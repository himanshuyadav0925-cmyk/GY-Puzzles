import React from 'react';
import { Play } from 'lucide-react';
import type { BoardGrid, CellPosition, GameMode } from '../types/sudoku';

interface SudokuBoardProps {
  initialBoard: BoardGrid;
  currentBoard: BoardGrid;
  notes: number[][][];
  selectedCell: CellPosition | null;
  conflicts: Set<string>;
  onSelectCell: (row: number, col: number) => void;
  isPaused: boolean;
  onResume?: () => void;
  mode?: GameMode;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  initialBoard,
  currentBoard,
  notes,
  selectedCell,
  conflicts,
  onSelectCell,
  isPaused,
  onResume,
  mode = 'classic',
}) => {
  const selectedVal =
    selectedCell ? currentBoard[selectedCell.row][selectedCell.col] : null;

  return (
    <div className={`sudoku-board-container ${isPaused ? 'is-paused' : ''} ${mode === 'relax' ? 'board-relax-mode' : ''}`}>
      {/* Enhanced Pause Overlay according to Section 7 */}
      {isPaused && (
        <div className="pause-overlay-card">
          <div className="pause-icon-badge">⏸</div>
          <h2 className="pause-heading">GAME PAUSED</h2>
          <p className="pause-subtext">Take your time.</p>
          {onResume && (
            <button
              type="button"
              className="primary-btn pause-resume-btn"
              onClick={onResume}
              autoFocus
            >
              <Play size={18} fill="currentColor" />
              <span>RESUME GAME</span>
            </button>
          )}
        </div>
      )}

      <div className="sudoku-grid" role="grid" aria-label="Sudoku Board 9x9">
        {Array.from({ length: 9 }).map((_, r) => (
          <div key={`row-${r}`} className="sudoku-row" role="row">
            {Array.from({ length: 9 }).map((_, c) => {
              const val = currentBoard[r][c];
              const isInitial = initialBoard[r][c] !== null;
              const isSelected =
                selectedCell?.row === r && selectedCell?.col === c;

              const isSameRowOrCol =
                selectedCell !== null &&
                (selectedCell.row === r || selectedCell.col === c);

              const isSameBox =
                selectedCell !== null &&
                Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(c / 3);

              const isSameUnit = isSameRowOrCol || isSameBox;

              const isSameNumber =
                selectedVal !== null && val !== null && val === selectedVal;

              const isConflict = conflicts.has(`${r},${c}`);
              const cellNotes = notes[r]?.[c] || [];

              // 3x3 block boundary classes
              const rightBorder = (c + 1) % 3 === 0 && c !== 8;
              const bottomBorder = (r + 1) % 3 === 0 && r !== 8;

              return (
                <button
                  key={`cell-${r}-${c}`}
                  type="button"
                  className={[
                    'sudoku-cell',
                    isInitial ? 'cell-initial' : 'cell-user',
                    isSelected ? 'cell-selected' : '',
                    !isSelected && isSameNumber ? 'cell-same-number' : '',
                    !isSelected && !isSameNumber && isSameUnit ? 'cell-unit-highlight' : '',
                    isConflict ? 'cell-conflict' : '',
                    rightBorder ? 'border-box-right' : '',
                    bottomBorder ? 'border-box-bottom' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectCell(r, c)}
                  aria-label={`Row ${r + 1}, Column ${c + 1}${
                    val ? `, Value ${val}` : ', Empty'
                  }${isInitial ? ', Clue' : ''}${isConflict ? ', Conflict' : ''}`}
                  aria-selected={isSelected}
                  aria-invalid={isConflict}
                  disabled={isPaused}
                >
                  {/* Secondary visual indicator for accessibility beyond color alone */}
                  {isConflict && (
                    <span className="conflict-indicator" aria-hidden="true">
                      !
                    </span>
                  )}

                  {val !== null ? (
                    <span className="cell-value">{val}</span>
                  ) : cellNotes.length > 0 ? (
                    <div className="notes-grid">
                      {Array.from({ length: 9 }).map((_, n) => {
                        const digit = n + 1;
                        const hasDigit = cellNotes.includes(digit);
                        return (
                          <span
                            key={`note-${digit}`}
                            className={`note-digit ${
                              hasDigit ? 'note-active' : 'note-inactive'
                            } ${
                              selectedVal === digit ? 'note-matching-selected' : ''
                            }`}
                          >
                            {hasDigit ? digit : ''}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
