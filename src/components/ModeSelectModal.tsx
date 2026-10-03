import React from 'react';
import { X, Feather, Compass } from 'lucide-react';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'relax' | 'classic') => void;
  levelNumber?: number;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  levelNumber = 1,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop mode-select-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-select-title"
      onClick={onClose}
    >
      <div
        className="mode-select-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="mode-select-subhead">Level {levelNumber}</span>
            <h2 id="mode-select-title" className="modal-title">
              Start Playing
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mode-select-prompt">
          Choose the experience that fits your mood right now:
        </p>

        <div className="mode-options-grid">
          {/* Relax Mode Option */}
          <button
            type="button"
            className="mode-option-btn relax-mode-btn"
            onClick={() => onSelectMode('relax')}
            autoFocus
          >
            <div className="mode-option-icon relax-icon">
              <Feather size={26} />
            </div>
            <div className="mode-option-text">
              <div className="mode-option-title-row">
                <span className="mode-option-title">Relax Mode</span>
                <span className="mode-badge relax-badge">Pressure-Free</span>
              </div>
              <p className="mode-option-desc">
                Solve at your own pace with unlimited thinking time, larger numbers, and gentle feedback.
              </p>
            </div>
          </button>

          {/* Classic Mode Option */}
          <button
            type="button"
            className="mode-option-btn classic-mode-btn"
            onClick={() => onSelectMode('classic')}
          >
            <div className="mode-option-icon classic-icon">
              <Compass size={26} />
            </div>
            <div className="mode-option-text">
              <div className="mode-option-title-row">
                <span className="mode-option-title">Classic Mode</span>
                <span className="mode-badge classic-badge">Traditional</span>
              </div>
              <p className="mode-option-desc">
                Normal Sudoku experience with active timer tracking, star ratings, and personal best records.
              </p>
            </div>
          </button>
        </div>

        <div className="mode-select-footer">
          <span>You can change modes anytime from Settings.</span>
        </div>
      </div>
    </div>
  );
};
