import React, { useState } from 'react';
import { Lock, Star, ArrowLeft, Check, Clock } from 'lucide-react';
import type { Difficulty, LevelProgress } from '../types/sudoku';
import { VERIFIED_PUZZLES } from '../data/puzzles';

interface LevelMapScreenProps {
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
  currentLevelId: number;
  progressMap: Record<number, LevelProgress>;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  onBack,
  onSelectLevel,
  currentLevelId,
  progressMap,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | Difficulty>('All');

  const groups: { diff: Difficulty; range: string; minId: number; maxId: number; desc: string }[] = [
    { diff: 'Beginner', range: 'Levels 1–20', minId: 1, maxId: 20, desc: 'Ideal for newcomers. Rich clues to build confidence and basic logic patterns.' },
    { diff: 'Easy', range: 'Levels 21–40', minId: 21, maxId: 40, desc: 'Balanced deduction. Requires basic row, column, and block intersections.' },
    { diff: 'Medium', range: 'Levels 41–60', minId: 41, maxId: 60, desc: 'Intermediate challenges. Requires active candidate tracking and pencil notes.' },
    { diff: 'Hard', range: 'Levels 61–80', minId: 61, maxId: 80, desc: 'Advanced logic. Sparse clues requiring naked/hidden pairs and subset elimination.' },
    { diff: 'Expert', range: 'Levels 81–100', minId: 81, maxId: 100, desc: 'Masterclass puzzles. Extreme discipline, deep logical chains, and flawless focus.' },
  ];

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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredGroups = activeTab === 'All'
    ? groups
    : groups.filter((g) => g.diff === activeTab);

  return (
    <div className="level-map-screen-container">
      {/* Top Header */}
      <div className="level-map-header">
        <button
          type="button"
          className="back-nav-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="level-map-title-block">
          <h1 className="level-map-title">100 Levels Progression</h1>
          <p className="level-map-subtitle">
            Every level is algorithmically verified to guarantee strictly one unique solution.
          </p>
        </div>

        {/* Global Progress Tally */}
        <div className="level-map-stats-pill">
          <div className="map-stat-col">
            <span className="stat-label">Cleared</span>
            <span className="stat-val">{completedCount} / 100</span>
          </div>
          <div className="map-stat-divider" />
          <div className="map-stat-col">
            <span className="stat-label">Stars</span>
            <span className="stat-val gold-val">
              <Star size={14} fill="#E5B842" stroke="#E5B842" /> {totalStars} / 300
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="level-tabs-bar">
        {(['All', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'] as const).map(
          (tab) => (
            <button
              key={`tab-${tab}`}
              type="button"
              className={`filter-tab-btn ${activeTab === tab ? 'active-tab' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Sections by Difficulty */}
      <div className="level-groups-list">
        {filteredGroups.map((group) => {
          const groupPuzzles = VERIFIED_PUZZLES.filter(
            (p) => p.id >= group.minId && p.id <= group.maxId
          );

          const groupCompleted = groupPuzzles.filter(
            (p) => progressMap[p.id]?.completed
          ).length;

          return (
            <section key={group.diff} className="level-group-section">
              <div className="group-section-header">
                <div>
                  <div className="group-title-row">
                    <h2 className="group-diff-name">{group.diff}</h2>
                    <span className="group-range-badge">{group.range}</span>
                    <span className="group-progress-badge">
                      {groupCompleted} / {groupPuzzles.length} Cleared
                    </span>
                  </div>
                  <p className="group-desc">{group.desc}</p>
                </div>
              </div>

              {/* Levels Grid */}
              <div className="levels-cards-grid">
                {groupPuzzles.map((lvl) => {
                  const prog = progressMap[lvl.id];
                  // Progression rule: Starter tier levels (1, 21, 41, 61, 81) are unlocked by default; others unlock as levels are solved
                  const isTierStarter = lvl.id === 1 || lvl.id === 21 || lvl.id === 41 || lvl.id === 61 || lvl.id === 81;
                  const isUnlocked = isTierStarter || Boolean(prog);
                  const isCompleted = Boolean(prog?.completed);
                  const stars = prog?.stars || 0;
                  const isCurrent = lvl.id === currentLevelId;

                  return (
                    <button
                      key={`lvl-node-${lvl.id}`}
                      type="button"
                      className={[
                        'level-node-card',
                        isUnlocked ? 'node-unlocked' : 'node-locked',
                        isCompleted ? 'node-completed' : '',
                        isCurrent ? 'node-current' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!isUnlocked}
                      onClick={() => onSelectLevel(lvl.id)}
                      aria-label={
                        isUnlocked
                          ? `Level ${lvl.id}, ${lvl.difficulty}, ${stars} stars earned${isCompleted ? ', Completed' : ''}`
                          : `Level ${lvl.id} is locked. Complete Level ${lvl.id - 1} to unlock Level ${lvl.id}.`
                      }
                      title={
                        isUnlocked
                          ? `Level ${lvl.id} (${lvl.difficulty}) • ${stars} Stars`
                          : `Complete Level ${lvl.id - 1} to unlock Level ${lvl.id}.`
                      }
                    >
                      <div className="node-top-row">
                        <span className="node-number">
                          {lvl.id.toString().padStart(2, '0')}
                        </span>
                        {isCompleted && (
                          <span className="node-check" title="Completed">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        )}
                        {!isUnlocked && (
                          <Lock size={14} className="node-lock-icon" />
                        )}
                      </div>

                      <div className="node-center-row">
                        {isUnlocked ? (
                          <div className="node-stars">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={`star-${lvl.id}-${s}`}
                                size={12}
                                fill={s <= stars ? '#E5B842' : 'none'}
                                stroke={s <= stars ? '#E5B842' : '#64748B'}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="node-locked-reason">
                            Unlock at Lvl {lvl.id - 1}
                          </span>
                        )}
                      </div>

                      <div className="node-bottom-row">
                        {isUnlocked && prog?.bestTime ? (
                          <div className="node-best-time">
                            <Clock size={10} />
                            <span>{formatTime(prog.bestTime)}</span>
                          </div>
                        ) : isUnlocked ? (
                          <span className="node-play-label">Play</span>
                        ) : (
                          <span className="node-unlock-sub">Complete Lv {lvl.id - 1}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
