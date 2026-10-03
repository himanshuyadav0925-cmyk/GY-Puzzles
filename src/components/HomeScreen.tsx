import React from 'react';
import {
  Play,
  RotateCw,
  RotateCcw,
  Calendar,
  Flame,
  Zap,
  BarChart3,
  Award,
  ChevronRight,
  Star,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Circle,
  Brain,
  Compass,
  Feather,
  Trophy,
  BookOpen,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { Difficulty, GameState, LevelProgress, StreakData } from '../types/sudoku';
import { GYLogo } from './GYLogo';
import { formatReadableDate, getTodayDateString } from '../utils/dailySudoku';

interface HomeScreenProps {
  onJustPlay: () => void;
  onPlay: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onContinue: () => void;
  onStartOver?: () => void;
  onDaily: () => void;
  onLevels: () => void;
  onChallenge: () => void;
  onStats: () => void;
  onAchievements: () => void;
  onRules: () => void;
  onTutorial?: () => void;
  onSettings: () => void;
  activeGame: GameState | null;
  streakData: StreakData;
  totalStars: number;
  completedLevelsCount: number;
  dailyCompletedToday: boolean;
  todayGoalCompleted: boolean;
  gyPoints: number;
  progressMap: Record<number, LevelProgress>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onJustPlay,
  onPlay,
  onSelectDifficulty,
  onContinue,
  onStartOver,
  onDaily,
  onLevels,
  onChallenge,
  onStats,
  onAchievements,
  onRules,
  onTutorial,
  onSettings,
  activeGame,
  streakData,
  totalStars,
  completedLevelsCount,
  dailyCompletedToday,
  todayGoalCompleted,
  gyPoints,
  progressMap,
}) => {
  const todayStr = getTodayDateString();
  const readableToday = formatReadableDate(todayStr);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const countClearedInRange = (minId: number, maxId: number) => {
    let count = 0;
    for (let i = minId; i <= maxId; i++) {
      if (progressMap[i]?.completed) count++;
    }
    return count;
  };

  const difficultyTiers: {
    diff: Difficulty;
    range: string;
    desc: string;
    solvedCount: number;
    icon: React.ReactNode;
  }[] = [
    {
      diff: 'Beginner',
      range: 'Levels 1–20',
      desc: 'Gentle introduction & confidence building',
      solvedCount: countClearedInRange(1, 20),
      icon: <Feather size={20} />,
    },
    {
      diff: 'Easy',
      range: 'Levels 21–40',
      desc: 'Row, column & block intersection logic',
      solvedCount: countClearedInRange(21, 40),
      icon: <Compass size={20} />,
    },
    {
      diff: 'Medium',
      range: 'Levels 41–60',
      desc: 'Candidate tracking & active pencil notes',
      solvedCount: countClearedInRange(41, 60),
      icon: <Brain size={20} />,
    },
    {
      diff: 'Hard',
      range: 'Levels 61–80',
      desc: 'Advanced subsets & naked pairs deduction',
      solvedCount: countClearedInRange(61, 80),
      icon: <Zap size={20} />,
    },
    {
      diff: 'Expert',
      range: 'Levels 81–100',
      desc: 'Masterclass chains & deep logical reasoning',
      solvedCount: countClearedInRange(81, 100),
      icon: <Trophy size={20} />,
    },
  ];

  return (
    <div className="home-screen-container">
      {/* Brand Hero with Personal Touch (Sections 1, 10, 11) */}
      <section className="home-hero-section">
        <div className="home-hero-glow" />
        <div className="home-logo-wrap">
          <GYLogo size={76} showText={false} />
        </div>

        <h1 className="home-brand-title">
          <span className="brand-gold">GY</span>{' '}
          <span className="brand-light">PUZZLES</span>
        </h1>
        <div className="home-tagline">THINK • SOLVE • GROW</div>

        {/* Section 10: Subtle dedication with warm motto */}
        <div className="home-dedication-badge">
          <span className="tribute-star">✦</span>
          <span>Dedicated to <strong>Govind Yadav</strong></span>
          <span className="tribute-star">✦</span>
        </div>
        <div className="home-dedication-quote">
          A little puzzle. A little progress.
        </div>

        {/* Section 7: Lightweight GY Points Badge */}
        {gyPoints > 0 && (
          <div className="home-points-pill" title="Your overall puzzle progress points">
            <Sparkles size={14} className="icon-gold" />
            <span>{gyPoints} GY Points</span>
          </div>
        )}

        {/* Section 20: RETURNING PLAYER EXPERIENCE (Compact, safe Continue Card) */}
        {activeGame && !activeGame.isCompleted ? (
          <div className="resume-game-card" role="region" aria-label="Resume active game">
            <div className="resume-header-row">
              <span className="resume-pulse-dot" />
              <h2 className="resume-title">CONTINUE YOUR PUZZLE?</h2>
            </div>

            <div className="resume-meta-grid">
              <div className="resume-stat">
                <span className="r-label">Level</span>
                <span className="r-val">{activeGame.levelId}</span>
              </div>
              <div className="resume-stat">
                <span className="r-label">Elapsed</span>
                <span className="r-val font-mono">{formatElapsed(activeGame.timerSeconds)}</span>
              </div>
              <div className="resume-stat">
                <span className="r-label">Mistakes</span>
                <span className="r-val">{activeGame.mistakes}</span>
              </div>
              <div className="resume-stat">
                <span className="r-label">Lifelines</span>
                <span className="r-val">{activeGame.lifelines}</span>
              </div>
            </div>

            <div className="resume-actions-group">
              <button
                type="button"
                className="primary-btn resume-continue-btn"
                onClick={onContinue}
                autoFocus
              >
                <RotateCw size={18} />
                <span>CONTINUE</span>
              </button>

              {onStartOver && (
                <button
                  type="button"
                  className="secondary-btn resume-startover-btn"
                  onClick={onStartOver}
                >
                  <RotateCcw size={16} />
                  <span>START OVER</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Primary Actions: JUST PLAY & PLAY SUDOKU (Sections 1 & 19) */
          <div className="home-cta-group">
            <button
              type="button"
              className="primary-btn home-main-btn"
              onClick={onJustPlay}
              title="Jump right into the next puzzle without delay"
            >
              <Play size={20} fill="currentColor" />
              <span>JUST PLAY</span>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="secondary-btn home-secondary-btn"
              onClick={onPlay}
              title="Choose between Relax Mode or Classic Mode"
            >
              <Sparkles size={18} />
              <span>PLAY SUDOKU</span>
            </button>
          </div>
        )}

        {/* Section 4: TODAY'S GOAL (Gentle progress indicator without guilt) */}
        <div className="home-daily-goal-card" role="region" aria-label="Today's Goal">
          <div className="goal-header">
            <div className="goal-title-group">
              <span className="goal-badge">TODAY'S GOAL</span>
              <span className="goal-text">Solve 1 Sudoku today</span>
            </div>
            <div className={`goal-status-pill ${todayGoalCompleted ? 'goal-done' : ''}`}>
              {todayGoalCompleted ? (
                <>
                  <CheckCircle2 size={16} className="icon-green" />
                  <span>Today's Goal Complete ✓</span>
                </>
              ) : (
                <>
                  <Circle size={14} className="icon-slate" />
                  <span>0 / 1</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tutorial Link */}
        {onTutorial && (
          <div className="home-tutorial-link-wrap">
            <button
              type="button"
              className="tutorial-link-btn"
              onClick={onTutorial}
            >
              <GraduationCap size={16} />
              <span>How to Play • Guided Tutorial</span>
            </button>
          </div>
        )}
      </section>

      {/* Section 5: INVITING DAILY SUDOKU CARD */}
      <section className="home-daily-banner">
        <div className="daily-banner-left">
          <div className="daily-badge">
            <Calendar size={16} />
            <span>TODAY'S SUDOKU</span>
          </div>
          <h2 className="daily-banner-title">{readableToday}</h2>
          <p className="daily-banner-sub">
            {dailyCompletedToday ? (
              <span className="daily-praise-text">
                <strong>DAILY PUZZLE COMPLETE ⭐⭐⭐</strong>
                <br />
                Great job! Come back tomorrow for a new puzzle.
              </span>
            ) : (
              'A fresh puzzle for today. Relax and enjoy.'
            )}
          </p>
        </div>

        <div className="daily-banner-right">
          <div className="daily-streak-pill" title="Daily Completion Streak">
            <Flame size={20} className="flame-gold" />
            <div className="streak-meta">
              <span className="streak-num">{streakData.currentStreak}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>

          <button
            type="button"
            className={dailyCompletedToday ? 'secondary-btn' : 'primary-btn'}
            onClick={onDaily}
          >
            {dailyCompletedToday ? 'Review Daily' : "PLAY TODAY'S PUZZLE"}
          </button>
        </div>
      </section>

      {/* Quick Play by Difficulty Tiers */}
      <section className="home-difficulty-section" aria-label="Select Puzzle Difficulty">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Select Difficulty</h2>
            <p className="section-subtitle">
              Jump directly into a puzzle matching your desired challenge level.
            </p>
          </div>
          <button
            type="button"
            className="section-link-btn"
            onClick={onLevels}
            title="Browse all 100 levels on map"
          >
            <span>View 100 Levels Map</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="difficulty-cards-grid">
          {difficultyTiers.map((tier) => (
            <button
              key={tier.diff}
              type="button"
              className={`difficulty-tier-card tier-${tier.diff.toLowerCase()}`}
              onClick={() => onSelectDifficulty(tier.diff)}
              title={`Play next ${tier.diff} Sudoku puzzle`}
            >
              <div className="tier-card-top">
                <div className={`tier-icon-wrap icon-${tier.diff.toLowerCase()}`}>
                  {tier.icon}
                </div>
                <span className="tier-range-pill">{tier.range}</span>
              </div>

              <div className="tier-card-body">
                <h3 className="tier-name">{tier.diff}</h3>
                <p className="tier-desc">{tier.desc}</p>
              </div>

              <div className="tier-card-footer">
                <span className="tier-progress">
                  {tier.solvedCount} / 20 Solved
                </span>
                <span className="tier-play-action">
                  <span>Play</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 11: Simplified Secondary Exploration Grid */}
      <section className="home-modes-grid">
        {/* 100 Levels Card */}
        <div
          className="home-mode-card"
          onClick={onLevels}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLevels(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon gold-icon">
              <Star size={24} />
            </div>
            <span className="mode-pill">Progression</span>
          </div>
          <h3 className="mode-title">100 Levels Map</h3>
          <p className="mode-desc">
            Progress through Beginner to Expert. Every puzzle is independently verified to have strictly 1 solution.
          </p>
          <div className="mode-card-footer">
            <span>{completedLevelsCount} / 100 Solved • {totalStars} ★</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Player Statistics & GY Points */}
        <div
          className="home-mode-card"
          onClick={onStats}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStats(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon blue-icon">
              <BarChart3 size={24} />
            </div>
            <span className="mode-pill">Profile</span>
          </div>
          <h3 className="mode-title">Player Statistics</h3>
          <p className="mode-desc">
            Track your completed puzzles, times, zero-mistake solves, and total GY Points.
          </p>
          <div className="mode-card-footer">
            <span>View Records</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Hall of Achievements */}
        <div
          className="home-mode-card"
          onClick={onAchievements}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAchievements(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon purple-icon">
              <Award size={24} />
            </div>
            <span className="mode-pill">Honors</span>
          </div>
          <h3 className="mode-title">Achievements</h3>
          <p className="mode-desc">
            Gentle milestone badges for your solves, flawless rounds, and arithmetic challenges.
          </p>
          <div className="mode-card-footer">
            <span>View Badges</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* GY Challenge (Optional Intense Mode) */}
        <div
          className="home-mode-card"
          onClick={onChallenge}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChallenge(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon red-icon">
              <Zap size={24} />
            </div>
            <span className="mode-pill intense-pill">Optional</span>
          </div>
          <h3 className="mode-title">GY Challenge</h3>
          <p className="mode-desc">
            Timed 5-minute countdown for players seeking quick adrenaline.
          </p>
          <div className="mode-card-footer">
            <span>Timed Mode</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* How to Play */}
        <div
          className="home-mode-card"
          onClick={onRules}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRules(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon amber-icon">
              <BookOpen size={24} />
            </div>
            <span className="mode-pill">Guide</span>
          </div>
          <h3 className="mode-title">How to Play</h3>
          <p className="mode-desc">
            Simple explanation of rows, columns, 3×3 boxes, notes, and friendly lifelines.
          </p>
          <div className="mode-card-footer">
            <span>Read Guide</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Settings */}
        <div
          className="home-mode-card"
          onClick={onSettings}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSettings(); }}
        >
          <div className="mode-card-header">
            <div className="mode-card-icon slate-icon">
              <SettingsIcon size={24} />
            </div>
            <span className="mode-pill">Preferences</span>
          </div>
          <h3 className="mode-title">Settings & Theme</h3>
          <p className="mode-desc">
            Adjust sound, voice guidance, light/dark themes, contrast, and animations.
          </p>
          <div className="mode-card-footer">
            <span>Adjust Settings</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </section>
    </div>
  );
};
