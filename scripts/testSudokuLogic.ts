import { VERIFIED_PUZZLES } from '../src/data/puzzles.ts';
import {
  stringToBoard,
  boardToString,
  countSolutions,
  solveSudoku,
  isValidPlacement,
  getConflicts,
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

  // TEST 3: Smart Hint Engine
  console.log('\n--- 3. Testing Smart Hint Engine ---');
  const p1 = VERIFIED_PUZZLES[0];
  const p1Board = stringToBoard(p1.puzzle);
  const p1Sol = stringToBoard(p1.solution);
  const hint = getSmartHint(p1Board, p1Sol);
  assert(hint !== null, 'Smart hint generated a valid cell');
  assert(p1Sol[hint!.row][hint!.col] === hint!.value, 'Smart hint value matches puzzle solution');

  // TEST 4: Rigorous Verification of All 100 Included Levels
  console.log('\n--- 4. Rigorous Verification of ALL 100 Puzzles for Exactly 1 Solution ---');
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
