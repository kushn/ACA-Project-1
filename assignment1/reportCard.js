/**
 * Student Report Card System
 * Usage: node reportCard.js <name> <score1> <score2> <score3> [score4 ...]
 * Bonus: node reportCard.js --file students.json
 */

const fs = require("fs");

// ─────────────────────────────────────────────
// P1 — Student Class
// ─────────────────────────────────────────────

class Student {
  // P1a — Constructor
  constructor(name, scores) {
    this.name = name;       // string
    this.scores = scores;   // number[]
  }

  // P1b — Average (uses a loop, no built-in reduce)
  get average() {
    let total = 0;
    for (let i = 0; i < this.scores.length; i++) {
      total += this.scores[i];
    }
    return total / this.scores.length;
  }

  // P1c — Letter Grade
  // Grading scale:
  //   A  →  90 – 100
  //   B  →  80 –  89
  //   C  →  70 –  79
  //   D  →  60 –  69
  //   F  →   0 –  59
  get letterGrade() {
    const avg = this.average;
    if (avg >= 90) return "A";
    else if (avg >= 80) return "B";
    else if (avg >= 70) return "C";
    else if (avg >= 60) return "D";
    else return "F";
  }

  // P1d — Summary: highest & lowest using a loop (no Math.max/min)
  summary() {
    let highest = this.scores[0];
    let lowest = this.scores[0];

    for (let i = 1; i < this.scores.length; i++) {
      if (this.scores[i] > highest) highest = this.scores[i];
      if (this.scores[i] < lowest) lowest = this.scores[i];
    }

    return { highest, lowest };
  }
}

// ─────────────────────────────────────────────
// P3b — getRemark (switch-based)
// ─────────────────────────────────────────────

function getRemark(grade) {
  switch (grade) {
    case "A":
      return "Outstanding! Keep up the excellent work.";
    case "B":
      return "Great job! You're above average.";
    case "C":
      return "Decent effort. There's room to grow.";
    case "D":
      return "You passed, but consider reviewing the material.";
    case "F":
      return "Unfortunately failed. Please seek extra support.";
    default:
      return "Invalid grade.";
  }
}

// ─────────────────────────────────────────────
// P3 — Formatted Report Card Printer
// ─────────────────────────────────────────────

function printReportCard(student) {
  const avg = student.average;
  const grade = student.letterGrade;
  const { highest, lowest } = student.summary();

  // P3b — Pass/Fail via ternary (≥60 = PASS)
  const status = avg >= 60 ? "PASS ✅" : "FAIL ❌";

  const remark = getRemark(grade);

  // P3c — Destructure scores: first two named, rest collected
  const [score1, score2, ...remaining] = student.scores;

  // ── Build the card using template literals only (no + concatenation) ──
  console.log(`
╔══════════════════════════════════════════════╗
║             STUDENT REPORT CARD              ║
╚══════════════════════════════════════════════╝

  Student  : ${student.name}
  Status   : ${status}
  Grade    : ${grade}
  Average  : ${avg.toFixed(1)}

──────────────────────────────────────────────
  Score Breakdown
──────────────────────────────────────────────
  Score 1  : ${score1 !== undefined ? score1 : "—"}
  Score 2  : ${score2 !== undefined ? score2 : "—"}${
    remaining.length > 0
      ? `
  Remaining: ${remaining.join(", ")}`
      : ""
  }

  All Scores : ${student.scores.join(", ")}
  Highest    : ${highest}
  Lowest     : ${lowest}

──────────────────────────────────────────────
  Remark: ${remark}
══════════════════════════════════════════════
`);
}

// ─────────────────────────────────────────────
// BONUS — Multi-student mode (--file flag)
// ─────────────────────────────────────────────

function runMultiStudentMode(filePath) {
  let data;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading file "${filePath}": ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.error("students.json must contain a non-empty array of student objects.");
    process.exit(1);
  }

  const students = data.map((entry) => new Student(entry.name, entry.scores));

  console.log(`\n📋 Processing ${students.length} student(s) from file...\n`);

  // Print each report card
  students.forEach((s) => printReportCard(s));

  // Identify top performer (highest average)
  let topStudent = students[0];
  for (let i = 1; i < students.length; i++) {
    if (students[i].average > topStudent.average) {
      topStudent = students[i];
    }
  }

  console.log(`🏆 Top Performer: ${topStudent.name} with an average of ${topStudent.average.toFixed(1)} (${topStudent.letterGrade})\n`);
}

// ─────────────────────────────────────────────
// P2 — CLI Entry Point
// ─────────────────────────────────────────────

const args = process.argv; // argv[0] = node, argv[1] = script path

// BONUS: detect --file flag
if (args[2] === "--file") {
  const filePath = args[3];
  if (!filePath) {
    console.error("Please provide a file path after --file.");
    process.exit(1);
  }
  runMultiStudentMode(filePath);
  process.exit(0);
}

// P2a — Parse name and scores from argv
const name = args[2];                           // string
const scores = args.slice(3).map(Number);       // convert strings → numbers

// P2b — Validate: must have name + at least 3 scores
if (!name) {
  console.error("Error: Please provide a student name.");
  console.error("Usage: node reportCard.js <name> <score1> <score2> <score3> [...]");
  process.exit(1);
}

if (scores.length < 3) {
  console.error(`Error: At least 3 scores are required. You provided ${scores.length}.`);
  console.error("Usage: node reportCard.js <name> <score1> <score2> <score3> [...]");
  process.exit(1);
}

// Check for non-numeric inputs
const hasInvalidScore = scores.some((s) => isNaN(s));
if (hasInvalidScore) {
  console.error("Error: All scores must be valid numbers.");
  process.exit(1);
}

// P1 — Create student and P3 — Print report
const student = new Student(name, scores);
printReportCard(student);
