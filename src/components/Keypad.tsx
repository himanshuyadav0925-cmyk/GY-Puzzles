import React from 'react';
import {
  RotateCcw,
  Eraser,
  PenTool,
  Lightbulb,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

interface KeypadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  canUndo: boolean;
  pencilMode: boolean;
  onTogglePencil: () => void;
  lifelines: number;
  onUseLifeline: () => void;
  onCheckConflicts?: () => void;
  onOpenMathChallenge: () => void;
  remainingCounts: Record<number, number>;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onNumberClick,
  onErase,
  onUndo,
  canUndo,
  pencilMode,
  onTogglePencil,
  lifelines,
  onUseLifeline,
  onCheckConflicts,
  onOpenMathChallenge,
  remainingCounts,
  disabled = false,
}) => {
  return (
    <div className="keypad-container" role="region" aria-label="Sudoku Controls and Keypad">
      {/* Action Toolbar */}
      <div className="action-toolbar" role="toolbar" aria-label="Game Actions">
        <button
          type="button"
          className="action-btn"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          title="Undo last move (Ctrl+Z)"
          aria-label="Undo last move"
        >
          <RotateCcw size={18} />
          <span>UNDO</span>
        </button>

        <button
          type="button"
          className="action-btn"
          onClick={onErase}
          disabled={disabled}
          title="Erase cell (Backspace / Delete)"
          aria-label="Erase selected cell"
        >
          <Eraser size={18} />
          <span>ERASE</span>
        </button>

        <button
          type="button"
          className={`action-btn pencil-btn ${pencilMode ? 'pencil-active' : ''}`}
          onClick={onTogglePencil}
          disabled={disabled}
          title="Toggle Notes mode (N)"
          aria-label={`Notes mode ${pencilMode ? 'enabled' : 'disabled'}`}
          aria-pressed={pencilMode}
        >
          <PenTool size={18} />
          <span>NOTES {pencilMode ? 'ON' : 'OFF'}</span>
        </button>

        {onCheckConflicts && (
          <button
            type="button"
            className="action-btn check-btn"
            onClick={onCheckConflicts}
            disabled={disabled}
            title="Verify duplicate rules"
            aria-label="Check duplicates"
          >
            <CheckCheck size={18} />
            <span>CHECK</span>
          </button>
        )}

        {/* Section 8 & 12: Lifeline / Smart Hint Button */}
        <button
          type="button"
          className={`action-btn lifeline-btn ${
            lifelines > 0 ? 'has-lifelines' : 'empty-lifelines'
          }`}
          onClick={lifelines > 0 ? onUseLifeline : onOpenMathChallenge}
          disabled={disabled}
          title={
            lifelines > 0
              ? `Use 1 Lifeline for a Smart Hint (${lifelines} remaining)`
              : 'Need another lifeline? Solve a Maths Challenge to earn +1'
          }
          aria-label={
            lifelines > 0
              ? `Use Hint. ${lifelines} lifelines remaining.`
              : 'Earn Lifeline via Maths Challenge'
          }
        >
          {lifelines > 0 ? <Lightbulb size={18} /> : <Sparkles size={18} />}
          <span>
            {lifelines > 0 ? `USE HINT (${lifelines})` : 'EARN LIFELINE'}
          </span>
        </button>
      </div>

      {/* Number Buttons Grid - Large, comfortable, spaced apart */}
      <div className="number-pad" role="group" aria-label="Number input 1 to 9">
        {Array.from({ length: 9 }).map((_, i) => {
          const num = i + 1;
          const remaining = remainingCounts[num] ?? 9;
          const isCompleted = remaining <= 0;

          return (
            <button
              key={`num-btn-${num}`}
              type="button"
              className={`num-btn ${isCompleted ? 'num-completed' : ''}`}
              onClick={() => onNumberClick(num)}
              disabled={disabled || isCompleted}
              aria-label={`Input ${num}${isCompleted ? ', all 9 placed' : `, ${remaining} remaining`}`}
            >
              <span className="num-digit">{num}</span>
              <span className="num-count" aria-hidden="true">
                {isCompleted ? '✓' : remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
