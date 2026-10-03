import React from 'react';
import {
  X,
  Award,
  Trophy,
  Sparkles,
  Zap,
  Brain,
  Calculator,
  ShieldCheck,
  Star,
  Flame,
  Crown,
  CheckCircle,
} from 'lucide-react';
import type { Achievement } from '../types/sudoku';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy size={22} />;
      case 'Sparkles':
        return <Sparkles size={22} />;
      case 'Zap':
        return <Zap size={22} />;
      case 'Brain':
        return <Brain size={22} />;
      case 'Calculator':
        return <Calculator size={22} />;
      case 'Award':
        return <Award size={22} />;
      case 'ShieldCheck':
        return <ShieldCheck size={22} />;
      case 'Star':
        return <Star size={22} />;
      case 'Flame':
        return <Flame size={22} />;
      case 'Crown':
        return <Crown size={22} />;
      default:
        return <Award size={22} />;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="achievements-modal-card">
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <div className="modal-badge-icon">
              <Award size={22} />
            </div>
            <div>
              <h2 className="modal-title">Hall of Achievements</h2>
              <p className="modal-subtitle">
                Unlock honors as you think, solve, and grow with GY Puzzles.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close achievements"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tally */}
        <div className="achievements-banner">
          <span>Unlocked Honors:</span>
          <strong>
            {unlockedCount} / {achievements.length}
          </strong>
        </div>

        {/* List */}
        <div className="achievements-list">
          {achievements.map((ach) => {
            const max = ach.maxProgress || 1;
            const cur = Math.min(ach.progress || 0, max);
            const percent = Math.round((cur / max) * 100);

            return (
              <div
                key={ach.id}
                className={`achievement-item ${
                  ach.isUnlocked ? 'ach-unlocked' : 'ach-locked'
                }`}
              >
                <div className="ach-icon-wrapper">{renderIcon(ach.icon)}</div>

                <div className="ach-info">
                  <div className="ach-header">
                    <span className="ach-name">{ach.title}</span>
                    {ach.isUnlocked ? (
                      <span className="ach-status-badge">
                        <CheckCircle size={14} /> Completed
                      </span>
                    ) : (
                      <span className="ach-progress-num">
                        {cur} / {max}
                      </span>
                    )}
                  </div>
                  <p className="ach-desc">{ach.description}</p>

                  {!ach.isUnlocked && max > 1 && (
                    <div className="ach-bar-track">
                      <div
                        className="ach-bar-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
