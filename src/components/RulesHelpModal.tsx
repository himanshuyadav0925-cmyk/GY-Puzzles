import React from 'react';
import { X, Check, Sparkles, Brain, BookOpen } from 'lucide-react';

interface RulesHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesHelpModal: React.FC<RulesHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="rules-modal-card">
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <div className="modal-badge-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="modal-title">How to Play GY Puzzles</h2>
              <p className="modal-subtitle">Master Sudoku with logic, focus, and mathematics.</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close rules"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rules-content-scroll">
          {/* Rule 1 */}
          <div className="rule-section">
            <div className="rule-title">
              <span className="rule-num">1</span>
              <h3>The 3 Golden Rules of Sudoku</h3>
            </div>
            <ul className="rule-list">
              <li>
                <Check size={16} className="rule-check" />
                <span>
                  <strong>Rows:</strong> Each horizontal row must contain digits 1 through 9 with no repetition.
                </span>
              </li>
              <li>
                <Check size={16} className="rule-check" />
                <span>
                  <strong>Columns:</strong> Each vertical column must contain digits 1 through 9 with no repetition.
                </span>
              </li>
              <li>
                <Check size={16} className="rule-check" />
                <span>
                  <strong>3×3 Boxes:</strong> Each of the nine 3×3 sub-grids must contain digits 1 through 9 with no repetition.
                </span>
              </li>
            </ul>
          </div>

          {/* Lifelines & Maths Challenge */}
          <div className="rule-section highlight-section">
            <div className="rule-title">
              <Sparkles size={20} className="rule-icon-gold" />
              <h3>Lifelines & The Maths Challenge</h3>
            </div>
            <p>
              Each puzzle provides exactly <strong>2 free lifelines</strong>. Using a lifeline provides a Smart Hint to reveal a cell value and guide your next move.
            </p>
            <p className="rule-note">
              <Brain size={16} /> Need more hints? Click <strong>+Lifeline</strong> to solve arithmetic questions (Addition, Subtraction, Multiplication, Division). Every correct answer awards <strong>+1 Lifeline</strong> immediately!
            </p>
          </div>

          {/* Notes and Pencil Mode */}
          <div className="rule-section">
            <div className="rule-title">
              <span className="rule-num">2</span>
              <h3>Pencil Notes & Keyboard Shortcuts</h3>
            </div>
            <ul className="rule-list">
              <li>
                <strong>Pencil Mode (N):</strong> Toggle notes to jot down candidate numbers in empty cells. Placing a final digit automatically cleans up conflicting notes.
              </li>
              <li>
                <strong>Keyboard Navigation:</strong> Use arrow keys to move, 1–9 to input numbers, Backspace or Delete to erase, and Space to pause.
              </li>
              <li>
                <strong>Autosave:</strong> Your progress, timer, mistakes, and lifelines are continuously saved locally. You can close or refresh at any time and resume right where you left off.
              </li>
            </ul>
          </div>

          {/* Dedication Banner */}
          <div className="dedication-card">
            <p className="dedication-quote">
              “THINK with clarity. SOLVE with precision. GROW with every puzzle.”
            </p>
            <p className="dedication-signature">
              Dedicated to <strong>Govind Yadav</strong>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-btn full-width" onClick={onClose}>
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
