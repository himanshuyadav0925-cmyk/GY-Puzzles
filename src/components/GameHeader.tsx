import React from 'react';
import { Play, Pause, RotateCw, Volume2, VolumeX, Sparkles, Heart, Feather } from 'lucide-react';
import type { Difficulty, GameMode } from '../types/sudoku';

interface GameHeaderProps {
  levelNumber: number;
  difficulty: Difficulty;
  timerSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  mistakes: number;
  lifelines: number;
  onOpenMathChallenge: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLevelSelect: () => void;
  mode?: GameMode;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  levelNumber,
  difficulty,
  timerSeconds,
  isPaused,
  onTogglePause,
  mistakes,
  lifelines,
  onOpenMathChallenge,
  onRestart,
  isMuted,
  onToggleMute,
  onOpenLevelSelect,
  mode = 'classic',
}) => {
  const isRelaxMode = mode === 'relax';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyClass = (diff: Difficulty) => {
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
    <div className={`game-header-bar ${isRelaxMode ? 'header-relax-mode' : ''}`}>
      {/* Level Info, Difficulty & Mode */}
      <div className="header-meta-group">
        <button
          type="button"
          className="level-badge-btn"
          onClick={onOpenLevelSelect}
          title="Browse all 100 levels"
        >
          <span className="level-label">Level {levelNumber}</span>
          <span className={`diff-pill ${getDifficultyClass(difficulty)}`}>
            {difficulty}
          </span>
          {isRelaxMode && (
            <span className="relax-mode-tag" title="Relax Mode: Pressure-free puzzle">
              <Feather size={12} />
              <span>Relax</span>
            </span>
          )}
        </button>
      </div>

      {/* Center Stats: Timer & Mistakes & Lifelines */}
      <div className="header-stats-group">
        {/* Timer */}
        <div className="header-stat-box timer-box" title={isRelaxMode ? 'Relaxed time: no time limits' : 'Elapsed time'}>
          <button
            type="button"
            className="timer-pause-btn"
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <span className="timer-digits">{formatTime(timerSeconds)}</span>
        </div>

        {/* Mistakes */}
        <div
          className="header-stat-box mistakes-box"
          title={isRelaxMode ? 'Gentle mistake tracking (no penalties)' : 'Mistakes made in this puzzle'}
        >
          <span className="stat-label">Mistakes</span>
          <span className={`stat-value ${!isRelaxMode && mistakes > 0 ? 'has-mistakes' : isRelaxMode && mistakes > 0 ? 'relax-mistakes' : ''}`}>
            {mistakes}
          </span>
        </div>

        {/* Lifelines */}
        <div
          className={`header-stat-box lifelines-box ${lifelines === 0 ? 'lifeline-depleted' : ''}`}
          title={`${lifelines} Lifelines remaining. Click + to earn more via Maths!`}
        >
          <Heart size={14} className="heart-icon" />
          <span className="stat-value">{lifelines}</span>
          <button
            type="button"
            className="add-lifeline-btn"
            onClick={onOpenMathChallenge}
            title="Earn Lifelines with Maths"
            aria-label="Earn another lifeline with maths challenge"
          >
            <Sparkles size={11} />
            <span>+</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Restart & Sound */}
      <div className="header-tools-group">
        <button
          type="button"
          className="tool-btn"
          onClick={onRestart}
          title="Restart Current Puzzle"
          aria-label="Restart Current Puzzle"
        >
          <RotateCw size={17} />
        </button>

        <button
          type="button"
          className="tool-btn"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>
    </div>
  );
};
