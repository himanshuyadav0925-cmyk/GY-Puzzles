import React, { useState } from 'react';
import { X, Lock, Star, Trophy } from 'lucide-react';
import type { Difficulty, LevelProgress } from '../types/sudoku';
import { VERIFIED_PUZZLES } from '../data/puzzles';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
  currentLevelId: number;
  progressMap: Record<number, LevelProgress>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  currentLevelId,
  progressMap,
}) => {
  const [selectedTab, setSelectedTab] = useState<'All' | Difficulty>('All');

  if (!isOpen) return null;

  // Filter levels
  const filteredLevels = VERIFIED_PUZZLES.filter((p) => {
    if (selectedTab === 'All') return true;
    return p.difficulty === selectedTab;
  });

  // Calculate total stars earned
  const totalStars = Object.values(progressMap).reduce(
    (sum, p) => sum + (p.stars || 0),
    0
  );

  const completedCount = Object.values(progressMap).filter(
    (p) => p.completed
  ).length;

  const formatTime = (secs: number | null) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyPillClass = (diff: Difficulty) => {
    switch (diff) {
      case 'Beginner':
        return 'diff-beginner';
      case 'Easy':
        return 'diff-easy';
      case 'Medium':
        return 'diff-medium';
      case 'Hard':
        return 'diff-hard';
      case 'Expert':
        return 'diff-expert';
      default:
        return '';
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="levels-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <div className="modal-badge-icon">
              <Trophy size={22} />
            </div>
            <div>
              <h2 className="modal-title">Level Progression</h2>
              <p className="modal-subtitle">
                100 verified Sudoku levels. Conquer each level to unlock the next!
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close level selection"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Progress Tally */}
        <div className="level-progression-stats">
          <div className="prog-stat">
            <span className="stat-label">Levels Cleared</span>
            <span className="stat-number">{completedCount} / 100</span>
          </div>
          <div className="prog-stat">
            <span className="stat-label">Total Stars</span>
            <span className="stat-number stars-text">
              <Star size={16} fill="#E5B842" stroke="#E5B842" /> {totalStars} / 300
            </span>
          </div>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="difficulty-tabs">
          {(['All', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'] as const).map(
            (tab) => (
              <button
                key={`tab-${tab}`}
                type="button"
                className={`tab-btn ${selectedTab === tab ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
                {tab === 'All' ? ' (100)' : ' (20)'}
              </button>
            )
          )}
        </div>

        {/* 100 Levels Grid */}
        <div className="levels-grid-scroll">
          <div className="levels-grid">
            {filteredLevels.map((lvl) => {
              const prog = progressMap[lvl.id];
              // Level 1 is always unlocked; others are unlocked if progress exists
              const isUnlocked = lvl.id === 1 || Boolean(prog);
              const isCompleted = Boolean(prog?.completed);
              const stars = prog?.stars || 0;
              const isCurrent = lvl.id === currentLevelId;

              return (
                <button
                  key={`level-card-${lvl.id}`}
                  type="button"
                  className={[
                    'level-card',
                    isUnlocked ? 'level-unlocked' : 'level-locked',
                    isCompleted ? 'level-completed' : '',
                    isCurrent ? 'level-current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectLevel(lvl.id);
                      onClose();
                    }
                  }}
                  title={
                    isUnlocked
                      ? `Level ${lvl.id} (${lvl.difficulty})`
                      : `Locked. Complete Level ${lvl.id - 1} to unlock.`
                  }
                >
                  <div className="level-card-top">
                    <span className="card-level-num">#{lvl.id}</span>
                    <span className={`diff-micro-tag ${getDifficultyPillClass(lvl.difficulty)}`}>
                      {lvl.difficulty[0]}
                    </span>
                  </div>

                  <div className="level-card-center">
                    {isUnlocked ? (
                      <div className="card-stars">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={`lvl-${lvl.id}-star-${s}`}
                            size={12}
                            fill={s <= stars ? '#E5B842' : 'none'}
                            stroke={s <= stars ? '#E5B842' : '#475569'}
                          />
                        ))}
                      </div>
                    ) : (
                      <Lock size={16} className="lock-icon" />
                    )}
                  </div>

                  <div className="level-card-bottom">
                    {isUnlocked && prog?.bestTime ? (
                      <span className="card-time">{formatTime(prog.bestTime)}</span>
                    ) : isUnlocked ? (
                      <span className="card-status-play">Play</span>
                    ) : (
                      <span className="card-locked-text">Locked</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
