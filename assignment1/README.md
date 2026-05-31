# Assignment 1 — Student Report Card System

A Node.js CLI that takes a student name and exam scores, then prints a formatted report card.

---

## Usage

### Single Student
```bash
node reportCard.js <name> <score1> <score2> <score3> [more scores...]
```

**Examples:**
```bash
node reportCard.js "Alice" 92 88 95 91 87
node reportCard.js "Bob" 73 68 75
node reportCard.js "Carol" 55 60 48
```

### Bonus — Multi-Student Mode (reads from JSON file)
```bash
node reportCard.js --file students.json
```

---

## Grading Scale

| Grade | Range     |
|-------|-----------|
| A     | 90 – 100  |
| B     | 80 – 89   |
| C     | 70 – 79   |
| D     | 60 – 69   |
| F     | 0  – 59   |

Pass threshold: average **≥ 60**

---

## Files

| File            | Purpose                               |
|-----------------|---------------------------------------|
| `reportCard.js` | Main CLI program                      |
| `students.json` | Sample data for multi-student mode    |
| `.gitignore`    | Excludes node_modules and misc files  |

---

## Git Workflow

```bash
# 1. Initialize a repo (first time only)
git init
git remote add origin https://github.com/<your-username>/assignmentFULLSTACK.git

# 2. Stage and commit your work
git add .
git commit -m "Add assignment1 — Student Report Card"

# 3. Push to GitHub
git push -u origin main
```

> ⚠️ Never commit `node_modules/`. The `.gitignore` already handles this.
