import * as fs from 'fs';
import * as path from 'path';

// Mini self-contained solver & generator for build script
type Board = (number | null)[][];

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function cloneBoard(b: Board): Board {
  return b.map((row) => [...row]);
}

function isValid(b: Board, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && b[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && b[r][col] === num) return false;
  }
  const sr = Math.floor(row / 3) * 3;
  const sc = Math.floor(col / 3) * 3;
  for (let r = sr; r < sr + 3; r++) {
    for (let c = sc; c < sc + 3; c++) {
      if ((r !== row || c !== col) && b[r][c] === num) return false;
    }
  }
  return true;
}

function getCandidates(b: Board, r: number, c: number): number[] {
  if (b[r][c] !== null) return [];
  const list: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (isValid(b, r, c, n)) list.push(n);
  }
  return list;
}

function countSolutions(b: Board, limit: number = 2): number {
  const wb = cloneBoard(b);
  let count = 0;

  function findMRV(): { r: number; c: number; candidates: number[] } | null {
    let min = 10;
    let best = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (wb[r][c] === null) {
          const cands = getCandidates(wb, r, c);
          if (cands.length === 0) return { r, c, candidates: [] };
          if (cands.length < min) {
            min = cands.length;
            best = { r, c, candidates: cands };
            if (min === 1) return best;
          }
        }
      }
    }
    return best;
  }

  function backtrack(): boolean {
    const next = findMRV();
    if (!next) {
      count++;
      return count >= limit;
    }
    if (next.candidates.length === 0) return false;

    for (const num of next.candidates) {
      wb[next.r][next.c] = num;
      if (backtrack()) return true;
      wb[next.r][next.c] = null;
    }
    return false;
  }

  backtrack();
  return count;
}

function solveBoard(b: Board): Board | null {
  const wb = cloneBoard(b);

  function findMRV(): { r: number; c: number; candidates: number[] } | null {
    let min = 10;
    let best = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (wb[r][c] === null) {
          const cands = getCandidates(wb, r, c);
          if (cands.length === 0) return { r, c, candidates: [] };
          if (cands.length < min) {
            min = cands.length;
            best = { r, c, candidates: cands };
            if (min === 1) return best;
          }
        }
      }
    }
    return best;
  }

  function backtrack(): boolean {
    const next = findMRV();
    if (!next) return true;
    if (next.candidates.length === 0) return false;

    for (const num of next.candidates) {
      wb[next.r][next.c] = num;
      if (backtrack()) return true;
      wb[next.r][next.c] = null;
    }
    return false;
  }

  return backtrack() ? wb : null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillRandomSolution(): Board {
  const b = createEmptyBoard();

  // Fill diagonal 3x3 blocks independently
  for (let k = 0; k < 9; k += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        b[k + r][k + c] = nums[idx++];
      }
    }
  }

  function fillRemaining(row: number, col: number): boolean {
    if (col >= 9 && row < 8) {
      row++;
      col = 0;
    }
    if (row >= 9 && col >= 9) return true;

    // Skip pre-filled diagonal boxes
    if (row < 3 && col < 3) col = 3;
    else if (row >= 3 && row < 6 && col >= 3 && col < 6) col = 6;
    else if (row >= 6 && col >= 6) {
      row++;
      col = 0;
      if (row >= 9) return true;
    }

    if (row < 9 && col < 9 && b[row][col] !== null) {
      return fillRemaining(row, col + 1);
    }

    const shuffled = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of shuffled) {
      if (isValid(b, row, col, num)) {
        b[row][col] = num;
        if (fillRemaining(row, col + 1)) return true;
        b[row][col] = null;
      }
    }

    return false;
  }

  fillRemaining(0, 3);
  return b;
}

function boardToStr(b: Board): string {
  let s = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      s += b[r][c] !== null ? b[r][c] : '0';
    }
  }
  return s;
}

interface GeneratedPuzzle {
  id: number;
  levelNumber: number;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  puzzle: string;
  solution: string;
  clueCount: number;
}

function generateSinglePuzzle(
  id: number,
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert',
  targetClues: number
): GeneratedPuzzle {
  while (true) {
    const fullSolution = fillRandomSolution();
    const solutionStr = boardToStr(fullSolution);
    const puzzleBoard = cloneBoard(fullSolution);

    // List all 81 positions
    const positions: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffledPositions = shuffle(positions);

    let clues = 81;
    for (const [r, c] of shuffledPositions) {
      if (clues <= targetClues) break;
      const original = puzzleBoard[r][c];
      puzzleBoard[r][c] = null;

      // Check if uniqueness holds
      if (countSolutions(puzzleBoard, 2) === 1) {
        clues--;
      } else {
        // Must put back
        puzzleBoard[r][c] = original;
      }
    }

    // Verify final board has countSolutions === 1 and matches solution
    if (countSolutions(puzzleBoard, 2) === 1) {
      const solved = solveBoard(puzzleBoard);
      if (solved && boardToStr(solved) === solutionStr) {
        return {
          id,
          levelNumber: id,
          difficulty,
          puzzle: boardToStr(puzzleBoard),
          solution: solutionStr,
          clueCount: clues,
        };
      }
    }
  }
}

async function main() {
  console.log('Generating 100 Verified Sudoku Puzzles for GY Puzzles...');

  const difficulties: { diff: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert'; count: number; clues: number }[] = [
    { diff: 'Beginner', count: 20, clues: 42 },
    { diff: 'Easy', count: 20, clues: 36 },
    { diff: 'Medium', count: 20, clues: 31 },
    { diff: 'Hard', count: 20, clues: 27 },
    { diff: 'Expert', count: 20, clues: 24 },
  ];

  const puzzles: GeneratedPuzzle[] = [];
  let currentId = 1;

  for (const group of difficulties) {
    console.log(`Generating 20 ${group.diff} puzzles (target clues ~${group.clues})...`);
    for (let i = 0; i < group.count; i++) {
      const p = generateSinglePuzzle(currentId, group.diff, group.clues);
      puzzles.push(p);
      console.log(`Level ${p.levelNumber} [${p.difficulty}] generated. Clues: ${p.clueCount}`);
      currentId++;
    }
  }

  // Double check verification on all 100
  console.log('\nRunning strict verification on all 100 puzzles:');
  let verifiedCount = 0;
  for (const p of puzzles) {
    const b = createEmptyBoard();
    for (let i = 0; i < 81; i++) {
      const ch = p.puzzle[i];
      if (ch !== '0') {
        b[Math.floor(i / 9)][i % 9] = parseInt(ch, 10);
      }
    }
    const solCount = countSolutions(b, 2);
    if (solCount !== 1) {
      throw new Error(`CRITICAL: Puzzle ${p.levelNumber} does NOT have unique solution! Count: ${solCount}`);
    }
    const solved = solveBoard(b);
    if (!solved || boardToStr(solved) !== p.solution) {
      throw new Error(`CRITICAL: Puzzle ${p.levelNumber} solved board does not match expected solution!`);
    }
    verifiedCount++;
  }

  console.log(`All ${verifiedCount}/100 puzzles verified to have EXACTLY ONE unique solution!`);

  const fileContent = `// GY Puzzles - 100 Algorithmically Verified Puzzles with Guaranteed Unique Solutions
// Auto-generated & Verified by GY Puzzles Engine
import { PuzzleDefinition } from '../types/sudoku';

export const VERIFIED_PUZZLES: PuzzleDefinition[] = ${JSON.stringify(puzzles, null, 2)};
`;

  const outputPath = path.resolve('src/data/puzzles.ts');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written 100 verified puzzles to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
