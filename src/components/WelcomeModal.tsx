import React from 'react';
import { Play, BookOpen, Calendar, X } from 'lucide-react';
import { GYLogo } from './GYLogo';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onHowToPlay: () => void;
  onDaily: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  onHowToPlay,
  onDaily,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop welcome-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-modal-card">
        <button
          type="button"
          className="modal-close-btn welcome-close-btn"
          onClick={onClose}
          aria-label="Close welcome message"
        >
          <X size={20} />
        </button>

        <div className="welcome-content">
          <div className="welcome-logo-badge">
            <GYLogo size={68} showText={false} />
          </div>

          <h1 id="welcome-title" className="welcome-title">
            <span className="brand-gold">GY</span> PUZZLES
          </h1>

          <div className="welcome-tagline">
            THINK • SOLVE • GROW
          </div>

          <div className="welcome-tribute">
            <span className="welcome-star">✦</span>
            <span>Dedicated to <strong>Govind Yadav</strong></span>
            <span className="welcome-star">✦</span>
          </div>

          <p className="welcome-summary">
            A serene, algorithmically verified Sudoku experience with 100 uniquely solvable puzzles, daily challenges, and arithmetic lifelines.
          </p>

          <div className="welcome-actions">
            <button
              type="button"
              className="primary-btn welcome-primary-btn"
              onClick={() => {
                onClose();
                onPlay();
              }}
              autoFocus
            >
              <Play size={18} fill="currentColor" />
              <span>PLAY SUDOKU</span>
            </button>

            <div className="welcome-secondary-row">
              <button
                type="button"
                className="secondary-btn welcome-secondary-btn"
                onClick={() => {
                  onClose();
                  onHowToPlay();
                }}
              >
                <BookOpen size={16} />
                <span>HOW TO PLAY</span>
              </button>

              <button
                type="button"
                className="secondary-btn welcome-secondary-btn"
                onClick={() => {
                  onClose();
                  onDaily();
                }}
              >
                <Calendar size={16} />
                <span>DAILY SUDOKU</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
