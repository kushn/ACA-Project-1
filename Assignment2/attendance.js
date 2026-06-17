const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "attendance.json");

// Load existing attendance data on module load; start fresh if file missing
let store = {};
try {
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  store = JSON.parse(raw);
} catch {
  // File doesn't exist yet or is corrupt — start with empty store
  store = {};
}

/**
 * Persists the in-memory store to disk.
 */
function _save() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Marks a student as present.
 * @param {string} rollNumber - The student's roll number.
 * @returns {{ success: boolean, reason?: string, timestamp?: string }}
 */
function markPresent(rollNumber) {
  if (store[rollNumber]) {
    // Already marked — return the original timestamp
    return {
      success: false,
      reason: "already_marked",
      timestamp: store[rollNumber].timestamp,
    };
  }

  const timestamp = new Date().toISOString();
  store[rollNumber] = { timestamp };
  _save();

  return { success: true, timestamp };
}

/**
 * Returns current attendance statistics.
 * @returns {{ total: number, rollNumbers: string[] }}
 */
function getStats() {
  const rollNumbers = Object.keys(store).sort();
  return {
    total: rollNumbers.length,
    rollNumbers,
  };
}

// Standalone test
if (require.main === module) {
  console.log("=== Attendance Store Test ===\n");

  const r1 = markPresent("240101");
  console.log("Mark 240101 (first time):", r1);

  const r2 = markPresent("240101");
  console.log("Mark 240101 (duplicate):", r2);

  const r3 = markPresent("240200");
  console.log("Mark 240200 (first time):", r3);

  console.log("\nStats:", getStats());
}

module.exports = { markPresent, getStats };
