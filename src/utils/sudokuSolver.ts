import type { BoardGrid, CellPosition } from '../types/sudoku';

// Create an empty 9x9 board
export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

// Deep clone a board
export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => [...row]);
}

// Convert 81-char string to BoardGrid
export function stringToBoard(str: string): BoardGrid {
  const board = createEmptyBoard();
  for (let i = 0; i < 81; i++) {
    const char = str[i];
    const row = Math.floor(i / 9);
    const col = i % 9;
    if (char >= '1' && char <= '9') {
      board[row][col] = parseInt(char, 10);
    } else {
      board[row][col] = null;
    }
  }
  return board;
}

// Convert BoardGrid to 81-char string
export function boardToString(board: BoardGrid): string {
  let str = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      str += val !== null ? val.toString() : '0';
    }
  }
  return str;
}

// Check if placing num at (row, col) is valid under standard Sudoku rules
export function isValidPlacement(
  board: BoardGrid,
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }

  return true;
}

// Find all cells that currently have conflicting duplicates in row, column, or 3x3 box
export function getConflicts(board: BoardGrid): Set<string> {
  const conflicts = new Set<string>();

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    for (const [, cols] of seen) {
      if (cols.length > 1) {
        cols.forEach((col) => conflicts.add(`${r},${col}`));
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    for (const [, rows] of seen) {
      if (rows.length > 1) {
        rows.forEach((row) => conflicts.add(`${row},${c}`));
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, CellPosition[]>();
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          const val = board[r][c];
          if (val !== null) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push({ row: r, col: c });
          }
        }
      }
      for (const [, cells] of seen) {
        if (cells.length > 1) {
          cells.forEach((pos) => conflicts.add(`${pos.row},${pos.col}`));
        }
      }
    }
  }

  return conflicts;
}

// Find all valid candidate numbers (1-9) for a cell
export function getCandidates(board: BoardGrid, row: number, col: number): number[] {
  if (board[row][col] !== null) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

// Find unassigned cell with minimum remaining values (MRV heuristic for speed)
function findMRVCell(board: BoardGrid): { row: number; col: number; candidates: number[] } | null {
  let minCount = 10;
  let bestCell: { row: number; col: number; candidates: number[] } | null = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) {
        const candidates = getCandidates(board, r, c);
        if (candidates.length === 0) {
          // Dead end immediately
          return { row: r, col: c, candidates: [] };
        }
        if (candidates.length < minCount) {
          minCount = candidates.length;
          bestCell = { row: r, col: c, candidates };
          if (minCount === 1) return bestCell; // Can't get better than 1 candidate
        }
      }
    }
  }

  return bestCell;
}

// Count solutions up to a given limit (e.g. limit = 2 to check uniqueness)
export function countSolutions(board: BoardGrid, limit: number = 2): number {
  const workingBoard = cloneBoard(board);
  let count = 0;

  function backtrack(): boolean {
    const next = findMRVCell(workingBoard);
    if (!next) {
      count++;
      return count >= limit;
    }
    if (next.candidates.length === 0) {
      return false;
    }

    for (const num of next.candidates) {
      workingBoard[next.row][next.col] = num;
      if (backtrack()) return true;
      workingBoard[next.row][next.col] = null;
    }

    return false;
  }

  backtrack();
  return count;
}

// Solve Sudoku returning solved BoardGrid or null if no solution
export function solveSudoku(board: BoardGrid): BoardGrid | null {
  const workingBoard = cloneBoard(board);

  function backtrack(): boolean {
    const next = findMRVCell(workingBoard);
    if (!next) return true; // Filled
    if (next.candidates.length === 0) return false;

    for (const num of next.candidates) {
      workingBoard[next.row][next.col] = num;
      if (backtrack()) return true;
      workingBoard[next.row][next.col] = null;
    }

    return false;
  }

  const success = backtrack();
  return success ? workingBoard : null;
}

// Check if entire board is correctly and completely solved
export function isBoardSolved(board: BoardGrid, solution: BoardGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null || board[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

// Count remaining unplaced numbers for 1 through 9
export function getRemainingDigitCounts(board: BoardGrid): Record<number, number> {
  const counts: Record<number, number> = {
    1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9
  };

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null && counts[val] !== undefined) {
        counts[val]--;
      }
    }
  }

  return counts;
}

// Find smart hint: returns target cell and value, with reason
export function getSmartHint(
  currentBoard: BoardGrid,
  solution: BoardGrid,
  preferredCell?: CellPosition | null
): { row: number; col: number; value: number; explanation: string } | null {
  // If user selected an empty cell or incorrect cell, give hint for that cell
  if (preferredCell) {
    const { row, col } = preferredCell;
    if (currentBoard[row][col] === null || currentBoard[row][col] !== solution[row][col]) {
      const val = solution[row][col] as number;
      return {
        row,
        col,
        value: val,
        explanation: `Cell (${row + 1}, ${col + 1}) must be ${val}.`
      };
    }
  }

  // Look for naked singles (cells with only 1 candidate)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentBoard[r][c] === null) {
        const candidates = getCandidates(currentBoard, r, c);
        if (candidates.length === 1) {
          const val = candidates[0];
          return {
            row: r,
            col: c,
            value: val,
            explanation: `Naked Single: Cell (${r + 1}, ${c + 1}) has only one possible candidate: ${val}!`
          };
        }
      }
    }
  }

  // Otherwise pick any empty cell with smallest candidate count
  let bestCell: { row: number; col: number; count: number } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentBoard[r][c] === null) {
        const count = getCandidates(currentBoard, r, c).length;
        if (!bestCell || count < bestCell.count) {
          bestCell = { row: r, col: c, count };
        }
      }
    }
  }

  if (bestCell) {
    const val = solution[bestCell.row][bestCell.col] as number;
    return {
      row: bestCell.row,
      col: bestCell.col,
      value: val,
      explanation: `Logical deduction: Cell (${bestCell.row + 1}, ${bestCell.col + 1}) must be ${val}.`
    };
  }

  return null;
}
