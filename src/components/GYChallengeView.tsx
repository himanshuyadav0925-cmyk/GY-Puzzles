import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Zap,
  ArrowLeft,
  AlertTriangle,
  RotateCw,
  Trophy,
  Clock,
  Sparkles,
  Heart,
} from 'lucide-react';
import type {
  BoardGrid,
  CellPosition,
  MoveHistoryItem,
} from '../types/sudoku';
import { VERIFIED_PUZZLES } from '../data/puzzles';
import {
  cloneBoard,
  getConflicts,
  getRemainingDigitCounts,
  getSmartHint,
  isBoardSolved,
  isCellCorrect,
  stringToBoard,
} from '../utils/sudokuSolver';
import { sound } from '../utils/sound';
import {
  loadChallengeStats,
  recordChallengeGame,
} from '../utils/storage';
import { SudokuBoard } from './SudokuBoard';
import { Keypad } from './Keypad';
import { MathChallengeModal } from './MathChallengeModal';

interface GYChallengeViewProps {
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GYChallengeView: React.FC<GYChallengeViewProps> = ({
  onBack,
}) => {
  // Pick an exciting challenge puzzle (e.g. Medium difficulty ~Level 45)
  const challengePuzzleDef = VERIFIED_PUZZLES[44]; // Level 45 Medium

  const [initialBoard] = useState<BoardGrid>(() =>
    stringToBoard(challengePuzzleDef.puzzle)
  );
  const [solution] = useState<BoardGrid>(() =>
    stringToBoard(challengePuzzleDef.solution)
  );
  const [currentBoard, setCurrentBoard] = useState<BoardGrid>(() =>
    stringToBoard(challengePuzzleDef.puzzle)
  );
  const [notes, setNotes] = useState<number[][][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
  );

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300); // 5 minutes
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const maxMistakes = 3;
  const [lifelines, setLifelines] = useState<number>(2);
  const [score, setScore] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);

  const [challengeStats, setChallengeStats] = useState(() => loadChallengeStats());
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);

  const handleGameOver = useCallback((reason: string) => {
    setIsGameOver(true);
    setGameOverReason(reason);
    sound.playMistake();

    const { isNewHighScore, stats } = recordChallengeGame(score, countdownSeconds);
    setChallengeStats(stats);
    setIsNewRecord(isNewHighScore);
  }, [score, countdownSeconds]);

  const handleGameOverRef = useRef(handleGameOver);
  useEffect(() => {
    handleGameOverRef.current = handleGameOver;
  });

  // Countdown Timer
  useEffect(() => {
    if (isPaused || isGameOver || isVictory || isMathModalOpen) return;

    if (countdownSeconds <= 0) {
      handleGameOverRef.current('Time Expired! The clock reached 0:00.');
      return;
    }

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOverRef.current('Time Expired! The clock reached 0:00.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds, isPaused, isGameOver, isVictory, isMathModalOpen]);

  const conflicts = getConflicts(currentBoard, solution);
  const remainingCounts = getRemainingDigitCounts(currentBoard, solution);

  const handleSelectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    sound.playCellClick();
  };

  const handleChallengeVictory = () => {
    setIsVictory(true);
    sound.playVictory();

    // Time bonus: 10 points per remaining second
    const timeBonus = countdownSeconds * 10;
    const flawlessBonus = mistakes === 0 ? 500 : 0;
    const finalScore = score + timeBonus + flawlessBonus;
    setScore(finalScore);

    const { isNewHighScore, stats } = recordChallengeGame(finalScore, countdownSeconds);
    setChallengeStats(stats);
    setIsNewRecord(isNewHighScore);
  };

  const handleInputNumber = (num: number) => {
    if (!selectedCell || isPaused || isGameOver || isVictory) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const prevVal = currentBoard[row][col];
    const prevCellNotes = [...(notes[row]?.[col] || [])];

    if (pencilMode) {
      const currentCellNotes = notes[row]?.[col] || [];
      const hasNote = currentCellNotes.includes(num);
      const newCellNotes = hasNote
        ? currentCellNotes.filter((n) => n !== num)
        : [...currentCellNotes, num].sort((a, b) => a - b);

      setHistory((prev) => [
        ...prev,
        { row, col, prevValue: prevVal, newValue: prevVal, prevNotes: prevCellNotes, newNotes: newCellNotes },
      ]);
      setNotes((prev) => {
        const next = prev.map((r) => r.map((c) => [...c]));
        next[row][col] = newCellNotes;
        return next;
      });
      sound.playPencilNote();
    } else {
      if (prevVal === num) return;

      const isCorrect = isCellCorrect(solution, row, col, num);
      if (!isCorrect) {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setConsecutiveCorrect(0);
        sound.playMistake();

        if (newMistakes >= maxMistakes) {
          handleGameOver('3 Strikes! You exceeded the maximum mistake limit.');
          return;
        }
      } else {
        // Correct placement: +100 base + streak bonus
        const streakBonus = Math.min(consecutiveCorrect * 15, 60);
        setScore((prev) => prev + 100 + streakBonus);
        setConsecutiveCorrect((prev) => prev + 1);
        sound.playNumberPlace();
      }

      setHistory((prev) => [
        ...prev,
        { row, col, prevValue: prevVal, newValue: num, prevNotes: prevCellNotes, newNotes: [] },
      ]);

      const nextBoard = cloneBoard(currentBoard);
      nextBoard[row][col] = num;
      setCurrentBoard(nextBoard);

      // Clean notes in row, col, box
      setNotes((prev) => {
        const next = prev.map((r) => r.map((c) => [...c]));
        next[row][col] = [];
        for (let i = 0; i < 9; i++) {
          next[row][i] = next[row][i].filter((n) => n !== num);
          next[i][col] = next[i][col].filter((n) => n !== num);
        }
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            next[r][c] = next[r][c].filter((n) => n !== num);
          }
        }
        return next;
      });

      if (isBoardSolved(nextBoard, solution)) {
        handleChallengeVictory();
      }
    }
  };

  const handleUseLifeline = () => {
    if (lifelines <= 0 || isPaused || isGameOver || isVictory) {
      setIsMathModalOpen(true);
      return;
    }

    const hint = getSmartHint(currentBoard, solution, selectedCell);
    if (!hint) return;

    const { row, col, value } = hint;
    const prevVal = currentBoard[row][col];
    const prevCellNotes = [...(notes[row]?.[col] || [])];

    setLifelines((prev) => Math.max(0, prev - 1));
    setSelectedCell({ row, col });

    const nextBoard = cloneBoard(currentBoard);
    nextBoard[row][col] = value;
    setCurrentBoard(nextBoard);

    setScore((prev) => prev + 60); // Half points for hint
    sound.playLifelineUsed();

    setHistory((prev) => [
      ...prev,
      { row, col, prevValue: prevVal, newValue: value, prevNotes: prevCellNotes, newNotes: [] },
    ]);

    if (isBoardSolved(nextBoard, solution)) {
      handleChallengeVictory();
    }
  };

  const handleRestart = () => {
    setCurrentBoard(cloneBoard(initialBoard));
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    setCountdownSeconds(300);
    setMistakes(0);
    setLifelines(2);
    setScore(0);
    setConsecutiveCorrect(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setHistory([]);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="challenge-view-container">
      {/* Header */}
      <div className="challenge-view-header">
        <button
          type="button"
          className="back-nav-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="challenge-title-group">
          <div className="challenge-badge">
            <Zap size={16} />
            <span>GY CHALLENGE</span>
          </div>
          <h1 className="challenge-main-title">Beat The Clock</h1>
        </div>

        <div className="challenge-highscore-pill">
          <Trophy size={16} className="icon-gold" />
          <span>Best: {challengeStats.highScore} pts</span>
        </div>
      </div>

      {/* Challenge HUD Bar */}
      <div className="challenge-hud-bar">
        {/* Countdown */}
        <div className={`hud-item countdown-box ${countdownSeconds <= 60 ? 'timer-danger' : ''}`}>
          <Clock size={16} />
          <span className="hud-val font-mono">{formatCountdown(countdownSeconds)}</span>
        </div>

        {/* Strikes / Mistakes */}
        <div className="hud-item strikes-box">
          <AlertTriangle size={16} className="icon-red" />
          <span className="hud-label">Strikes</span>
          <span className="hud-val">{mistakes} / {maxMistakes}</span>
        </div>

        {/* Score */}
        <div className="hud-item score-box">
          <span className="hud-label">Score</span>
          <span className="hud-val text-gold">{score} pts</span>
        </div>

        {/* Lifelines */}
        <div className="hud-item lifelines-hud">
          <Heart size={14} className="heart-icon" />
          <span className="hud-val">{lifelines}</span>
          <button
            type="button"
            className="add-lifeline-btn"
            onClick={() => setIsMathModalOpen(true)}
            title="Earn Lifelines with Maths"
          >
            +
          </button>
        </div>
      </div>

      {/* Main Board Stage */}
      <div className="challenge-stage-card">
        <SudokuBoard
          initialBoard={initialBoard}
          currentBoard={currentBoard}
          notes={notes}
          selectedCell={selectedCell}
          conflicts={conflicts}
          onSelectCell={handleSelectCell}
          isPaused={isPaused}
        />

        <Keypad
          onNumberClick={handleInputNumber}
          onErase={() => {
            if (!selectedCell || isPaused || isGameOver || isVictory) return;
            const { row, col } = selectedCell;
            if (initialBoard[row][col] !== null) return;
            const next = cloneBoard(currentBoard);
            next[row][col] = null;
            setCurrentBoard(next);
            sound.playErase();
          }}
          onUndo={() => {
            if (history.length === 0 || isPaused || isGameOver || isVictory) return;
            const last = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            const next = cloneBoard(currentBoard);
            next[last.row][last.col] = last.prevValue;
            setCurrentBoard(next);
          }}
          canUndo={history.length > 0}
          pencilMode={pencilMode}
          onTogglePencil={() => setPencilMode((prev) => !prev)}
          lifelines={lifelines}
          onUseLifeline={handleUseLifeline}
          onOpenMathChallenge={() => setIsMathModalOpen(true)}
          remainingCounts={remainingCounts}
          disabled={isPaused || isGameOver || isVictory}
        />
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="modal-backdrop">
          <div className="challenge-result-card gameover-card">
            <div className="result-icon-ring red-ring">
              <AlertTriangle size={36} />
            </div>
            <h2>Challenge Over</h2>
            <p className="result-reason">{gameOverReason}</p>

            <div className="challenge-final-score">
              <span className="score-label">Final Score</span>
              <span className="score-val">{score} pts</span>
            </div>

            {isNewRecord && (
              <div className="new-record-pill">
                <Sparkles size={14} /> NEW PERSONAL HIGH SCORE!
              </div>
            )}

            <div className="modal-footer full-width">
              <button type="button" className="primary-btn full-width" onClick={handleRestart}>
                <RotateCw size={16} /> Try Again
              </button>
              <button type="button" className="secondary-btn full-width" onClick={onBack}>
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {isVictory && (
        <div className="modal-backdrop">
          <div className="challenge-result-card victory-card">
            <div className="result-icon-ring gold-ring">
              <Trophy size={36} />
            </div>
            <h2>Challenge Conquered!</h2>
            <p className="result-reason">You solved the puzzle before the clock ran out!</p>

            <div className="challenge-final-score">
              <span className="score-label">Total Score</span>
              <span className="score-val text-gold">{score} pts</span>
            </div>

            {isNewRecord && (
              <div className="new-record-pill">
                <Sparkles size={14} /> NEW ALL-TIME HIGH SCORE!
              </div>
            )}

            <div className="modal-footer full-width">
              <button type="button" className="primary-btn full-width" onClick={handleRestart}>
                <RotateCw size={16} /> Play Again
              </button>
              <button type="button" className="secondary-btn full-width" onClick={onBack}>
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Math Modal */}
      <MathChallengeModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onRewardLifeline={() => setLifelines((prev) => prev + 1)}
        currentLifelines={lifelines}
      />
    </div>
  );
};
