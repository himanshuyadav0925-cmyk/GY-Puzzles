# GY Puzzles — THINK • SOLVE • GROW

**Dedicated with honor to Govind Yadav**

**GY Puzzles** is a premium, playable 9×9 Sudoku web application crafted with **React, TypeScript, and Vite**. It combines an elegant luxury aesthetic (deep navy, champagne gold, and clean ivory surfaces) with a verified 100-level progression system, mental maths lifeline challenges, pencil notes, duplicate conflict detection, and local progress tracking.

---

## 🌟 Brand Identity & Aesthetics

- **Name**: GY Puzzles
- **Tagline**: THINK • SOLVE • GROW
- **Dedication**: Dedicated to **Govind Yadav**
- **Palette**: Deep Royal Midnight Navy (`#060B18`, `#0A1226`, `#122042`), Champagne Gold (`#E5B842`, `#F3C64F`, `#C99723`), and crisp high-contrast ivory cells (`#FFFFFF`, `#F8FAFC`).
- **Monogram**: Interlocking geometric 'G' and 'Y' crest emblem with a Sudoku grid motif and starry glow.

---

## 🧩 Core Features & Architecture

### 1. 100 Verified Unique-Solution Levels
- Levels 1–20: **Beginner** (~42 clues)
- Levels 21–40: **Easy** (~36 clues)
- Levels 41–60: **Medium** (~31 clues)
- Levels 61–80: **Hard** (~27 clues)
- Levels 81–100: **Expert** (~24 clues)
- **Guaranteed Single Solution**: Every single one of the 100 included puzzles is algorithmically tested and verified to ensure `countSolutions(board, 2) === 1`.

### 2. Lifeline & Maths Challenge System
- Each puzzle starts with **exactly 2 free lifelines**.
- Using a lifeline activates a **Smart Hint** that logically reveals the correct digit for an empty or selected cell.
- When free lifelines run out, players can click **+Lifeline** to solve quick mental arithmetic challenges (**Addition**, **Subtraction**, **Multiplication**, **Division**).
- Every correct maths answer awards **+1 Lifeline** immediately with celebration feedback.

### 3. Interactive 9×9 Sudoku Board
- **Crosshair Highlighting**: Highlights row, column, and 3×3 box containing the selected cell.
- **Identical Number Highlighting**: Instantly highlights all instances of the selected digit.
- **Pencil / Notes Mode**: Toggle notes (press **N**) to pencil in multiple candidate digits in any empty cell. Conflicting notes automatically clear upon placing a digit.
- **Duplicate & Conflict Detection**: Highlights invalid duplicates in ruby red.
- **History & Undo**: Full undo stack supporting digit placement, note updates, and erasure.
- **Remaining Digit Counters**: Keypad displays the remaining count (0–9) for each digit with a checkmark once all 9 are placed.

### 4. Timer, Mistakes & Star Ratings
- Real-time timer with **Pause / Resume** (board blurs when paused).
- Mistakes tracker.
- Star rating system:
  - ★★★ (3 Stars): 0 mistakes (Mastery)
  - ★★☆ (2 Stars): ≤ 2 mistakes
  - ★☆☆ (1 Star): Completed
- Confetti celebration and victory modal on completion.

### 5. Autosave & Local Persistence
- Full in-progress game state (cells, notes, timer, mistakes, lifelines) is continuously preserved in `localStorage`.
- Progress across all 100 levels (unlocked state, best times, stars earned) is saved automatically.
- Hall of Achievements with 10 unlockable honors and progress tracks.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm

### Development Server
```bash
npm run dev
```
The website will start at:
- **Local**: `http://localhost:5173/`

### Production Build
```bash
npm run build
```

### Verification & Sudoku Logic Test Suite
To verify the Sudoku engine, rule constraints, and verify that all 100 levels have exactly one unique solution:
```bash
npx tsx scripts/testSudokuLogic.ts
```
