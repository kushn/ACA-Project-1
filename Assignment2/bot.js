require("dotenv").config(); // Must be first line

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const https = require("https");

const { decodeQR } = require("./qr");
const { extractRollNumber, isRegistered } = require("./parser");
const { markPresent, getStats } = require("./attendance");

// ── Bot initialisation ────────────────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is not set. Check your .env file.");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Bot is running in polling mode…");

// Temp directory for downloaded photos
const TEMP_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Downloads a file from Telegram servers to a local path.
 * @param {string} fileUrl - Full HTTPS URL of the file.
 * @param {string} destPath - Local destination path.
 * @returns {Promise<void>}
 */
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(fileUrl, (res) => {
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {}); // clean up on error
        reject(err);
      });
  });
}

// ── /start command ────────────────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `👋 *IITK Attendance Bot*\n\n` +
      `Send a photo of a student's ID card to mark attendance.\n\n` +
      `Commands:\n` +
      `/report — show current attendance stats\n` +
      `/export — download attendance as CSV`,
    { parse_mode: "Markdown" }
  );
});

// ── Photo handler ─────────────────────────────────────────────────────────────
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  let tempPath = null;

  try {
    // Telegram sends multiple resolutions; last entry = highest resolution
    const photoArray = msg.photo;
    const bestPhoto = photoArray[photoArray.length - 1];
    const fileId = bestPhoto.file_id;

    // Get the file URL from Telegram
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    // Download to a temp file
    tempPath = path.join(TEMP_DIR, `${fileId}.jpg`);
    await downloadFile(fileUrl, tempPath);

    // P1 — Decode QR
    let qrString;
    try {
      qrString = await decodeQR(tempPath);
    } catch {
      await bot.sendMessage(chatId, "❌ No QR code found in this image. Please try a clearer photo.");
      return;
    }

    // P2 — Extract roll number
    const rollNumber = extractRollNumber(qrString);
    if (!rollNumber) {
      await bot.sendMessage(chatId, "⚠️ QR code decoded but no roll number found in the data.");
      return;
    }

    // P2 — Check range
    if (!isRegistered(rollNumber)) {
      await bot.sendMessage(
        chatId,
        `🚫 Roll number *${rollNumber}* is not in the registered range (240001–240400).`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // P3 — Mark attendance
    const result = markPresent(rollNumber);

    if (!result.success) {
      const originalTime = new Date(result.timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      await bot.sendMessage(
        chatId,
        `🔁 Roll *${rollNumber}* was already marked present.\n` +
          `First marked at: ${originalTime} IST`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    const markedAt = new Date(result.timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    await bot.sendMessage(
      chatId,
      `✅ Attendance marked for roll *${rollNumber}*\nTime: ${markedAt} IST`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("Unexpected error in photo handler:", err);
    await bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again.");
  } finally {
    // Clean up temp file
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlink(tempPath, () => {});
    }
  }
});

// ── /report command ───────────────────────────────────────────────────────────
bot.onText(/\/report/, (msg) => {
  const chatId = msg.chat.id;
  const { total, rollNumbers } = getStats();

  if (total === 0) {
    bot.sendMessage(chatId, "📋 No attendance recorded yet.");
    return;
  }

  const list = rollNumbers.map((r, i) => `${i + 1}. ${r}`).join("\n");
  bot.sendMessage(
    chatId,
    `📊 *Attendance Report*\n\nTotal present: *${total}*\n\n${list}`,
    { parse_mode: "Markdown" }
  );
});

// ── BONUS: /export command (CSV) ──────────────────────────────────────────────
bot.onText(/\/export/, async (msg) => {
  const chatId = msg.chat.id;
  const { rollNumbers } = getStats();

  if (rollNumbers.length === 0) {
    bot.sendMessage(chatId, "📋 No attendance data to export yet.");
    return;
  }

  // Build CSV content
  const lines = ["roll_number,timestamp"];
  const { markPresent: _, getStats: __ } = require("./attendance");
  const store = JSON.parse(fs.readFileSync(path.join(__dirname, "attendance.json"), "utf-8"));

  for (const roll of rollNumbers) {
    lines.push(`${roll},${store[roll].timestamp}`);
  }

  const csvContent = lines.join("\n");
  const csvPath = path.join(TEMP_DIR, "attendance_export.csv");
  fs.writeFileSync(csvPath, csvContent, "utf-8");

  try {
    await bot.sendDocument(chatId, csvPath, {
      caption: `📁 Attendance export — ${rollNumbers.length} student(s)`,
    });
  } finally {
    fs.unlink(csvPath, () => {});
  }
});

// ── Polling error handler ─────────────────────────────────────────────────────
bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
