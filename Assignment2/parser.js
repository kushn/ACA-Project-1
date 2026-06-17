/**
 * IITK ID Card QR String — Raw Example (mandatory research comment)
 *
 * After scanning a typical IITK student ID card with a QR app, the raw
 * string looks something like this:
 *
 *   IITK|240153|Rahul Sharma|BTech|CSE|2024
 *
 * The roll number is the second pipe-delimited field: "240153".
 * It is always a 6-digit number in the range 240001–240400 for the
 * 2024 batch. The regex below finds the first such 6-digit number
 * that falls inside the registered range.
 *
 * Note: The exact format may vary. The parser is intentionally flexible —
 * it scans the entire string for any 6-digit sequence in the valid range
 * rather than splitting on a fixed delimiter, so it works regardless of
 * the surrounding text.
 */

const ROLL_MIN = 240001;
const ROLL_MAX = 240400;

/**
 * Extracts the registered roll number from a raw QR string.
 * @param {string} qrString - The raw decoded QR text.
 * @returns {string|null} - Roll number as string, or null if not found.
 */
function extractRollNumber(qrString) {
  // Match every sequence of exactly 6 digits in the string
  const matches = qrString.match(/\b\d{6}\b/g);
  if (!matches) return null;

  // Return the first 6-digit number that falls in the registered range
  const found = matches.find((m) => {
    const n = Number(m);
    return n >= ROLL_MIN && n <= ROLL_MAX;
  });

  return found || null;
}

/**
 * Checks whether a roll number string is in the registered range.
 * @param {string} rollNumber - Roll number to check.
 * @returns {boolean}
 */
function isRegistered(rollNumber) {
  const n = Number(rollNumber);
  return n >= ROLL_MIN && n <= ROLL_MAX;
}

// Standalone test
if (require.main === module) {
  const testCases = [
    "IITK|240153|Rahul Sharma|BTech|CSE|2024",
    "ROLLNO:240400 NAME:Jane Doe DEPT:EE",
    "IITK|199999|Old Student|BTech|ME|2019", // out of range
    "No numbers here at all",
    "IITK|240001|First Student",
    "random 123456 text 240200 more",
  ];

  testCases.forEach((tc) => {
    const roll = extractRollNumber(tc);
    console.log(`Input : "${tc}"`);
    console.log(`Result: ${roll} | Registered: ${roll ? isRegistered(roll) : false}`);
    console.log("---");
  });
}

module.exports = { extractRollNumber, isRegistered };
