import { VERIFIED_PUZZLES } from '../src/data/puzzles.ts';
import {
  stringToBoard,
  boardToString,
  countSolutions,
  solveSudoku,
  isValidPlacement,
  isCellCorrect,
  getConflicts,
  getCandidates,
  cloneBoard,
  getRemainingDigitCounts,
  isBoardSolved,
  getSmartHint,
} from '../src/utils/sudokuSolver.ts';

function runTests() {
  console.log('=== GY PUZZLES LOGIC & PUZZLE VERIFICATION SUITE ===\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, msg: string) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FAILED: ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    } else {
      passedTests++;
      console.log(`✅ PASSED: ${msg}`);
    }
  }

  // TEST 1: Rule Constraints Check (Row, Col, Box)
  console.log('\n--- 1. Testing Rule Constraints (Row, Col, Box) ---');
  const testBoard = stringToBoard(
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  );
  testBoard[0][0] = 5;

  // Same row conflict
  assert(!isValidPlacement(testBoard, 0, 5, 5), 'Number 5 cannot be placed in same row (0, 5)');
  assert(isValidPlacement(testBoard, 0, 5, 6), 'Number 6 CAN be placed in row (0, 5)');

  // Same column conflict
  assert(!isValidPlacement(testBoard, 7, 0, 5), 'Number 5 cannot be placed in same column (7, 0)');
  assert(isValidPlacement(testBoard, 7, 0, 8), 'Number 8 CAN be placed in column (7, 0)');

  // Same 3x3 box conflict
  assert(!isValidPlacement(testBoard, 1, 1, 5), 'Number 5 cannot be placed in same 3x3 box (1, 1)');
  assert(isValidPlacement(testBoard, 4, 4, 5), 'Number 5 CAN be placed in different box (4, 4)');

  // TEST 2: Conflict Detection Function
  console.log('\n--- 2. Testing Conflict Detection ---');
  testBoard[0][3] = 5; // Duplicate in row 0
  const conflicts = getConflicts(testBoard);
  assert(conflicts.has('0,0') && conflicts.has('0,3'), 'Conflicts detected at (0,0) and (0,3)');

  // TEST 3: Wrong-Answer Detection (Locally Valid Candidates vs Solution)
  console.log('\n--- 3. Testing Solution-Based Wrong-Answer Detection ---');
  const p1 = VERIFIED_PUZZLES[0];
  const p1Board = stringToBoard(p1.puzzle);
  const p1Sol = stringToBoard(p1.solution);

  // Find an empty cell with multiple locally valid candidates
  let testCell: { row: number; col: number; correct: number; incorrect: number } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (p1Board[r][c] === null) {
        const cands = getCandidates(p1Board, r, c);
        const solVal = p1Sol[r][c] as number;
        const wrongCands = cands.filter((val) => val !== solVal);
        if (cands.includes(solVal) && wrongCands.length > 0) {
          testCell = { row: r, col: c, correct: solVal, incorrect: wrongCands[0] };
          break;
        }
      }
    }
    if (testCell) break;
  }

  assert(testCell !== null, 'Found an empty cell with multiple candidates');
  const { row: tRow, col: tCol, correct: tCorrect, incorrect: tWrong } = testCell!;

  // 1. Both numbers are locally valid (no immediate row/col/box duplicate conflict)
  assert(
    isValidPlacement(p1Board, tRow, tCol, tCorrect),
    `Correct number ${tCorrect} is locally valid at (${tRow}, ${tCol})`
  );
  assert(
    isValidPlacement(p1Board, tRow, tCol, tWrong),
    `Incorrect candidate ${tWrong} is also locally valid at (${tRow}, ${tCol}) without row/col/box duplicate`
  );

  // 2. isCellCorrect differentiates based on puzzle solution
  assert(
    isCellCorrect(p1Sol, tRow, tCol, tCorrect),
    `isCellCorrect identifies ${tCorrect} as the correct answer at (${tRow}, ${tCol})`
  );
  assert(
    !isCellCorrect(p1Sol, tRow, tCol, tWrong),
    `isCellCorrect detects ${tWrong} as incorrect at (${tRow}, ${tCol}) despite being locally valid`
  );

  // 3. getConflicts marks the locally valid but wrong candidate as incorrect
  const boardWithWrong = cloneBoard(p1Board);
  boardWithWrong[tRow][tCol] = tWrong;
  const conflictsWrong = getConflicts(boardWithWrong, p1Sol);
  assert(
    conflictsWrong.has(`${tRow},${tCol}`),
    `getConflicts immediately flags locally valid candidate ${tWrong} as an error at (${tRow}, ${tCol})`
  );

  // 4. getConflicts does NOT mark the correct answer as incorrect
  const boardWithCorrect = cloneBoard(p1Board);
  boardWithCorrect[tRow][tCol] = tCorrect;
  const conflictsCorrect = getConflicts(boardWithCorrect, p1Sol);
  assert(
    !conflictsCorrect.has(`${tRow},${tCol}`),
    `getConflicts does NOT flag correct number ${tCorrect} as an error at (${tRow}, ${tCol})`
  );

  // 5. Pre-filled puzzle cells and hint cells never trigger false mistakes
  const conflictsInitial = getConflicts(p1Board, p1Sol);
  assert(conflictsInitial.size === 0, 'Pre-filled puzzle cells produce 0 false mistakes');

  // 6. getRemainingDigitCounts ignores incorrect placements
  const remainingBefore = getRemainingDigitCounts(p1Board, p1Sol);
  const remainingWithWrong = getRemainingDigitCounts(boardWithWrong, p1Sol);
  assert(
    remainingWithWrong[tWrong] === remainingBefore[tWrong],
    `Incorrectly placed number ${tWrong} does not decrement remaining unplaced count`
  );
  const remainingWithCorrect = getRemainingDigitCounts(boardWithCorrect, p1Sol);
  assert(
    remainingWithCorrect[tCorrect] === remainingBefore[tCorrect] - 1,
    `Correctly placed number ${tCorrect} decrements remaining unplaced count by 1`
  );

  // TEST 4: Smart Hint Engine
  console.log('\n--- 4. Testing Smart Hint Engine ---');
  const hint = getSmartHint(p1Board, p1Sol);
  assert(hint !== null, 'Smart hint generated a valid cell');
  assert(p1Sol[hint!.row][hint!.col] === hint!.value, 'Smart hint value matches puzzle solution');

  // Also verify Smart Hint correctly prioritizes correcting an incorrect cell
  const hintForCorrection = getSmartHint(boardWithWrong, p1Sol);
  assert(
    hintForCorrection !== null && hintForCorrection.row === tRow && hintForCorrection.col === tCol && hintForCorrection.value === tCorrect,
    `Smart hint prioritizes fixing incorrect cell at (${tRow}, ${tCol}) with correct value ${tCorrect}`
  );

  // TEST 5: Rigorous Verification of All 100 Included Levels
  console.log('\n--- 5. Rigorous Verification of ALL 100 Puzzles for Exactly 1 Solution ---');
  assert(VERIFIED_PUZZLES.length === 100, 'Exactly 100 puzzles loaded in dataset');

  const diffCounts: Record<string, number> = {
    Beginner: 0,
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Expert: 0,
  };

  let uniqueSolutionsVerified = 0;

  for (const p of VERIFIED_PUZZLES) {
    diffCounts[p.difficulty] = (diffCounts[p.difficulty] || 0) + 1;

    // Check puzzle length
    if (p.puzzle.length !== 81 || p.solution.length !== 81) {
      throw new Error(`Puzzle ${p.levelNumber} length invalid`);
    }

    const b = stringToBoard(p.puzzle);
    const solBoard = stringToBoard(p.solution);

    // Verify Board Solved validator
    if (!isBoardSolved(solBoard, solBoard)) {
      throw new Error(`Solution board validator failed for puzzle ${p.levelNumber}`);
    }

    // Verify UNIQUE solution
    const solCount = countSolutions(b, 2);
    if (solCount !== 1) {
      throw new Error(`CRITICAL: Puzzle Level ${p.levelNumber} has ${solCount} solutions (expected strictly 1)`);
    }

    // Verify Solver output matches expected solution
    const solved = solveSudoku(b);
    if (!solved || boardToString(solved) !== p.solution) {
      throw new Error(`CRITICAL: Puzzle Level ${p.levelNumber} solved output does not match target solution`);
    }

    uniqueSolutionsVerified++;
  }

  assert(
    uniqueSolutionsVerified === 100,
    `All 100/100 puzzles independently confirmed to have EXACTLY ONE unique solution!`
  );

  console.log('\nDifficulty distribution:');
  for (const [diff, count] of Object.entries(diffCounts)) {
    console.log(`  • ${diff}: ${count} verified puzzles`);
  }

  console.log(`\n🎉 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED WITH 100% SUCCESS!`);
}

runTests();
