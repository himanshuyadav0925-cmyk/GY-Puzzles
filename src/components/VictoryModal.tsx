import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCw, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Difficulty } from '../types/sudoku';
import { sound } from '../utils/sound';
import { voice } from '../utils/voice';

interface VictoryModalProps {
  isOpen: boolean;
  levelNumber: number;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakes: number;
  stars: number;
  lifelinesUsed?: number;
  isNewBestTime?: boolean;
  pointsEarned?: number;
  animationsEnabled?: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelNumber,
  difficulty,
  timeSeconds,
  mistakes,
  stars,
  lifelinesUsed = 0,
  isNewBestTime = false,
  pointsEarned = 10,
  animationsEnabled = true,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playVictory();
      voice.speakPuzzleCompleted();

      if (animationsEnabled) {
        // Restrained, elegant 1-second confetti
        const end = Date.now() + 800;
        const colors = ['#E5B842', '#FFF2A3', '#0072B2', '#56B4E9', '#009E73'];

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 45,
            origin: { x: 0 },
            colors: colors,
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 45,
            origin: { x: 1 },
            colors: colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      }
    }
  }, [isOpen, animationsEnabled]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextLevelNumber = levelNumber + 1;

  return (
    <div
      className="modal-backdrop victory-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-heading"
    >
      <div className="victory-modal-card">
        <div className="victory-trophy-ring">
          <Trophy size={40} className="trophy-gold" />
        </div>

        {/* Section 6: Clean PUZZLE COMPLETE header */}
        <h2 id="victory-heading" className="victory-title">
          PUZZLE COMPLETE!
        </h2>
        <div className="victory-subtitle">
          Level {levelNumber} • <span className="diff-highlight">{difficulty}</span>
        </div>

        {/* Section 6: Personal Best Indicator */}
        {isNewBestTime && (
          <div className="best-time-banner" role="status">
            <Trophy size={14} className="icon-gold" />
            <span>New Best Time!</span>
          </div>
        )}

        {/* Stars Presentation */}
        <div className="stars-earned-container" aria-label={`${stars} of 3 stars earned`}>
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={`star-${starIdx}`}
                className={`star-wrapper ${isEarned ? 'star-earned' : 'star-unearned'}`}
                style={{ animationDelay: `${starIdx * 0.1}s` }}
              >
                <Star
                  size={34}
                  fill={isEarned ? '#E5B842' : 'none'}
                  stroke={isEarned ? '#C99723' : '#64748b'}
                />
              </div>
            );
          })}
        </div>

        {/* Section 9: Gentle Progress Message */}
        <div className="victory-encouragement-card">
          <div className="encouragement-row">
            <CheckCircle2 size={16} className="icon-green" />
            <strong>Level complete ✓</strong>
          </div>
          <p className="encouragement-sub">
            You're making progress.
            {levelNumber < 100 && (
              <span className="unlocked-highlight"> Level {nextLevelNumber} unlocked!</span>
            )}
          </p>
        </div>

        {/* Section 7: GY Points Earned */}
        {pointsEarned > 0 && (
          <div className="points-reward-pill">
            <Sparkles size={14} className="icon-gold" />
            <span>+{pointsEarned} GY Points Earned</span>
          </div>
        )}

        {/* Section 6: Stats summary table */}
        <div className="victory-stats-panel">
          <div className="v-stat-item">
            <span className="v-stat-label">Time</span>
            <span className="v-stat-val font-mono">{formatTime(timeSeconds)}</span>
          </div>
          <div className="v-stat-divider" />
          <div className="v-stat-item">
            <span className="v-stat-label">Mistakes</span>
            <span className="v-stat-val">{mistakes}</span>
          </div>
          <div className="v-stat-divider" />
          <div className="v-stat-item">
            <span className="v-stat-label">Lifelines Used</span>
            <span className="v-stat-val">{lifelinesUsed}</span>
          </div>
        </div>

        {/* Actions according to Section 6 & 12 */}
        <div className="victory-actions-grid">
          {levelNumber < 100 && (
            <button
              type="button"
              className="primary-btn full-width victory-next-btn"
              onClick={onNextLevel}
              autoFocus
            >
              <span>NEXT PUZZLE</span>
              <ArrowRight size={18} />
            </button>
          )}

          <div className="victory-secondary-row">
            <button
              type="button"
              className="secondary-btn flex-1"
              onClick={onReplay}
            >
              <RotateCw size={16} />
              <span>PLAY AGAIN</span>
            </button>

            <button
              type="button"
              className="secondary-btn flex-1"
              onClick={onOpenLevelSelect}
            >
              <MapPin size={16} />
              <span>LEVEL MAP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
