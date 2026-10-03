import React from 'react';
import {
  ArrowLeft,
  Trophy,
  Clock,
  Flame,
  Star,
  Brain,
  Sparkles,
  Timer,
  Target,
} from 'lucide-react';
import type { StreakData, UserStatistics, ChallengeStats } from '../types/sudoku';

interface StatisticsScreenProps {
  onBack: () => void;
  stats: UserStatistics;
  streakData: StreakData;
  challengeStats?: ChallengeStats;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  onBack,
  stats,
  streakData,
}) => {
  const formatTime = (secs: number | null) => {
    if (secs === null || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const averageTime =
    stats.totalGamesWon > 0
      ? Math.round(stats.totalPlayTimeSeconds / stats.totalGamesWon)
      : null;

  const hasData = stats.totalGamesWon > 0 || stats.totalGamesPlayed > 0;

  return (
    <div className="stats-screen-container">
      {/* Header */}
      <div className="stats-header">
        <button
          type="button"
          className="back-nav-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="stats-title-block">
          <h1 className="stats-title">Player Statistics</h1>
          <p className="stats-subtitle">
            Authentic performance records across your GY Puzzles journey.
          </p>
        </div>
      </div>

      {!hasData && (
        <div className="stats-empty-card">
          <Target size={40} className="empty-icon" />
          <h3>No Gameplay Data Yet</h3>
          <p>
            Start your first Sudoku puzzle to see your solve times, accuracy rates, and streaks!
          </p>
          <button type="button" className="primary-btn" onClick={onBack}>
            Start Playing
          </button>
        </div>
      )}

      {/* 8 Required Clean Cards according to Section 26 */}
      <div className="stats-kpi-grid">
        {/* 1. Puzzles Completed */}
        <div className="stat-card gold-border">
          <div className="stat-card-top">
            <Trophy size={20} className="icon-gold" />
            <span className="stat-card-label">Puzzles Completed</span>
          </div>
          <div className="stat-card-value">{stats.totalGamesWon}</div>
          <div className="stat-card-sub">
            {stats.totalGamesPlayed} games started
          </div>
        </div>

        {/* 2. Best Time */}
        <div className="stat-card">
          <div className="stat-card-top">
            <Timer size={20} className="icon-green" />
            <span className="stat-card-label">Best Time</span>
          </div>
          <div className="stat-card-value font-mono">
            {formatTime(stats.overallBestTime)}
          </div>
          <div className="stat-card-sub">All-time fastest solve</div>
        </div>

        {/* 3. Average Time */}
        <div className="stat-card">
          <div className="stat-card-top">
            <Clock size={20} className="icon-blue" />
            <span className="stat-card-label">Average Time</span>
          </div>
          <div className="stat-card-value font-mono">
            {formatTime(averageTime)}
          </div>
          <div className="stat-card-sub">Per completed puzzle</div>
        </div>

        {/* 4. Current Streak */}
        <div className="stat-card streak-card">
          <div className="stat-card-top">
            <Flame size={20} className="flame-gold" />
            <span className="stat-card-label">Current Streak</span>
          </div>
          <div className="stat-card-value">
            {streakData.currentStreak} <span className="stat-unit">days</span>
          </div>
          <div className="stat-card-sub">Consecutive daily solves</div>
        </div>

        {/* 5. Longest Streak */}
        <div className="stat-card">
          <div className="stat-card-top">
            <Flame size={20} className="icon-orange" />
            <span className="stat-card-label">Longest Streak</span>
          </div>
          <div className="stat-card-value">
            {streakData.longestStreak} <span className="stat-unit">days</span>
          </div>
          <div className="stat-card-sub">Personal consistency record</div>
        </div>

        {/* 6. 3-Star Puzzles */}
        <div className="stat-card">
          <div className="stat-card-top">
            <Star size={20} className="icon-amber" />
            <span className="stat-card-label">3-Star Puzzles</span>
          </div>
          <div className="stat-card-value">{stats.threeStarCompletions}</div>
          <div className="stat-card-sub">Zero-mistake masteries</div>
        </div>

        {/* 7. Math Challenges */}
        <div className="stat-card">
          <div className="stat-card-top">
            <Brain size={20} className="icon-purple" />
            <span className="stat-card-label">Math Challenges</span>
          </div>
          <div className="stat-card-value">{stats.mathChallengesSolved}</div>
          <div className="stat-card-sub">Arithmetic lifelines earned</div>
        </div>

        {/* 8. GY Points */}
        <div className="stat-card gold-border">
          <div className="stat-card-top">
            <Sparkles size={20} className="icon-gold" />
            <span className="stat-card-label">GY Points</span>
          </div>
          <div className="stat-card-value font-mono">
            {stats.gyPoints || 0}
          </div>
          <div className="stat-card-sub">Mindful puzzle progress</div>
        </div>
      </div>
    </div>
  );
};
