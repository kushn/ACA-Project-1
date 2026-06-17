# Assignment 2 — QR Code Attendance System

A Telegram bot that marks student attendance by scanning QR codes on IITK ID cards.

---

## What it does

1. A volunteer sends a **photo of a student's IITK ID card** to the bot.
2. The bot **decodes the QR code** from the image using `jimp` (pixel extraction) and `jsqr` (QR decoding).
3. It **extracts the roll number** from the raw QR string via regex, checking the range 240001–240400.
4. It **marks the student present** in a local `attendance.json` file — or reports a duplicate if they're already marked.
5. `/report` returns the current count and sorted list of present students.
6. `/export` sends a CSV file of all attendance records (bonus feature).

---

## Project structure

```
assignment2/
├── bot.js          # Telegram bot — I/O only, delegates to modules
├── qr.js           # P1: decodeQR(imagePath) using jimp + jsqr
├── parser.js       # P2: extractRollNumber() + isRegistered()
├── attendance.js   # P3: markPresent() + getStats() + JSON persistence
├── .env.example    # Template — copy to .env and fill in your token
├── package.json
└── README.md
```

---

## Setup

### 1. Install dependencies

```bash
cd assignment2
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
BOT_TOKEN=your_actual_telegram_bot_token_here
```

Get a token from [@BotFather](https://t.me/BotFather) on Telegram (`/newbot`).

### 3. Run the bot

```bash
node bot.js
```

---

## Testing individual modules

```bash
# Test QR decoder on a local image
node qr.js path/to/id_card.jpg

# Test roll number parser (runs built-in test cases)
node parser.js

# Test attendance store (marks a couple of test entries)
node attendance.js
```

---

## Bot commands

| Command   | Description                                      |
|-----------|--------------------------------------------------|
| `/start`  | Welcome message and usage instructions           |
| `/report` | Show total present count + sorted roll number list |
| `/export` | Download attendance as a CSV file (bonus)        |

Send a **photo** of an IITK ID card at any time to mark attendance.

---

## Files NOT committed

- `node_modules/` — install via `npm install`
- `.env` — contains secret token; never commit
- `attendance.json` — generated at runtime

---

## Dependencies

| Package                 | Purpose                                      |
|-------------------------|----------------------------------------------|
| `jimp`                  | Load image and extract raw pixel data        |
| `jsqr`                  | Decode QR code from pixel array              |
| `node-telegram-bot-api` | Telegram Bot API wrapper                     |
| `dotenv`                | Load `BOT_TOKEN` from `.env` file            |
