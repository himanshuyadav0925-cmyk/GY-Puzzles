import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Flame,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import type {
  BoardGrid,
  CellPosition,
  DailyProgress,
  GameState,
  MoveHistoryItem,
  StreakData,
} from '../types/sudoku';
import {
  cloneBoard,
  getConflicts,
  getRemainingDigitCounts,
  getSmartHint,
  isBoardSolved,
  isCellCorrect,
  stringToBoard,
} from '../utils/sudokuSolver';
import {
  formatReadableDate,
  getDailyPuzzleForDate,
  getTodayDateString,
  processDailyStreak,
} from '../utils/dailySudoku';
import { sound } from '../utils/sound';
import { voice } from '../utils/voice';
import {
  loadDailyProgress,
  saveDailyProgress,
  loadStreakData,
  saveStreakData,
  recordCompletionStats,
  checkAndUnlockAchievements,
  loadActiveDailyGame,
  saveActiveDailyGame,
  setTodayGoalCompleted,
  updateUserStats,
  loadUserStats,
} from '../utils/storage';
import { SudokuBoard } from './SudokuBoard';
import { Keypad } from './Keypad';
import { GameHeader } from './GameHeader';
import { MathChallengeModal } from './MathChallengeModal';
import { VictoryModal } from './VictoryModal';

interface DailySudokuViewProps {
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAchievements: () => void;
  onOpenRules: () => void;
}

export const DailySudokuView: React.FC<DailySudokuViewProps> = ({
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const todayStr = getTodayDateString();
  const readableDate = formatReadableDate(todayStr);
  const dailyPuzzleDef = getDailyPuzzleForDate(todayStr);

  const [initialBoard] = useState<BoardGrid>(() =>
    stringToBoard(dailyPuzzleDef.puzzle)
  );
  const [solution] = useState<BoardGrid>(() =>
    stringToBoard(dailyPuzzleDef.solution)
  );

  // Synchronously compute initial daily state from local storage
  const [initialData] = useState(() => {
    try {
      const savedDaily = loadDailyProgress(todayStr);
      if (savedDaily && savedDaily.completed) {
        return {
          completed: true,
          alreadyCompleted: true,
          board: stringToBoard(dailyPuzzleDef.solution),
          notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
          timer: savedDaily.timeSeconds,
          mistakes: savedDaily.mistakes,
          stars: savedDaily.stars,
          lifelines: 2,
          history: [] as MoveHistoryItem[],
          selectedCell: null as CellPosition | null,
          pencilMode: false,
        };
      }

      const activeDaily = loadActiveDailyGame();
      if (activeDaily && activeDaily.dateKey === todayStr && !activeDaily.isCompleted) {
        return {
          completed: false,
          alreadyCompleted: false,
          board: activeDaily.currentBoard,
          notes: activeDaily.notes || Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
          timer: activeDaily.timerSeconds || 0,
          mistakes: activeDaily.mistakes || 0,
          stars: 3,
          lifelines: activeDaily.lifelines ?? 2,
          history: activeDaily.history || [],
          selectedCell: activeDaily.selectedCell || null,
          pencilMode: activeDaily.pencilMode || false,
        };
      }
    } catch {
      // Ignore read errors
    }

    return {
      completed: false,
      alreadyCompleted: false,
      board: stringToBoard(dailyPuzzleDef.puzzle),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      timer: 0,
      mistakes: 0,
      stars: 3,
      lifelines: 2,
      history: [] as MoveHistoryItem[],
      selectedCell: null as CellPosition | null,
      pencilMode: false,
    };
  });

  const [currentBoard, setCurrentBoard] = useState<BoardGrid>(() => initialData.board);
  const [notes, setNotes] = useState<number[][][]>(() => initialData.notes);

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(() => initialData.selectedCell);
  const [pencilMode, setPencilMode] = useState<boolean>(() => initialData.pencilMode);
  const [timerSeconds, setTimerSeconds] = useState<number>(() => initialData.timer);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(() => initialData.mistakes);
  const [lifelines, setLifelines] = useState<number>(() => initialData.lifelines);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => initialData.completed);
  const [history, setHistory] = useState<MoveHistoryItem[]>(() => initialData.history);
  const [earnedStars, setEarnedStars] = useState<number>(() => initialData.stars);

  const [streakData, setStreakData] = useState<StreakData>(() =>
    loadStreakData()
  );
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState<boolean>(() => initialData.alreadyCompleted);
  const [pointsEarned, setPointsEarned] = useState<number>(15);

  // Modals
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);

  // Autosave active in-progress daily game
  useEffect(() => {
    if (isCompleted || alreadyCompletedToday) {
      saveActiveDailyGame(null);
      return;
    }

    const stateToSave: GameState = {
      levelId: dailyPuzzleDef.id,
      mode: 'daily',
      difficulty: dailyPuzzleDef.difficulty,
      initialBoard,
      currentBoard,
      solution,
      notes,
      timerSeconds,
      isPaused,
      mistakes,
      lifelines,
      isCompleted,
      history,
      selectedCell,
      pencilMode,
      dateKey: todayStr,
    };
    saveActiveDailyGame(stateToSave);
  }, [
    currentBoard,
    notes,
    timerSeconds,
    isPaused,
    mistakes,
    lifelines,
    isCompleted,
    alreadyCompletedToday,
    history,
    selectedCell,
    pencilMode,
    dailyPuzzleDef.id,
    dailyPuzzleDef.difficulty,
    initialBoard,
    solution,
    todayStr,
  ]);

  // Timer Tick
  useEffect(() => {
    if (isPaused || isCompleted || isMathModalOpen || alreadyCompletedToday) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isCompleted, isMathModalOpen, alreadyCompletedToday]);

  const conflicts = getConflicts(currentBoard, solution);
  const remainingCounts = getRemainingDigitCounts(currentBoard, solution);

  const handleSelectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    sound.playCellClick();
  };

  const handleTogglePencil = () => {
    setPencilMode((prev) => !prev);
  };

  const handleErase = () => {
    if (!selectedCell || isPaused || isCompleted) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const prevVal = currentBoard[row][col];
    const prevCellNotes = [...(notes[row]?.[col] || [])];
    if (prevVal === null && prevCellNotes.length === 0) return;

    setHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: prevVal,
        newValue: null,
        prevNotes: prevCellNotes,
        newNotes: [],
      },
    ]);

    if (prevVal !== null) {
      setCurrentBoard((prev) => {
        const next = cloneBoard(prev);
        next[row][col] = null;
        return next;
      });
    }

    if (prevCellNotes.length > 0) {
      setNotes((prev) => {
        const next = prev.map((r) => r.map((c) => [...c]));
        next[row][col] = [];
        return next;
      });
    }

    sound.playErase();
  };

  const handleUndo = () => {
    if (history.length === 0 || isPaused || isCompleted) return;

    const lastMove = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setCurrentBoard((prev) => {
      const next = cloneBoard(prev);
      next[lastMove.row][lastMove.col] = lastMove.prevValue;
      return next;
    });

    setNotes((prev) => {
      const next = prev.map((r) => r.map((c) => [...c]));
      next[lastMove.row][lastMove.col] = [...lastMove.prevNotes];
      return next;
    });

    setSelectedCell({ row: lastMove.row, col: lastMove.col });
    sound.playCellClick();
  };

  const handlePuzzleSolved = () => {
    if (isCompleted || alreadyCompletedToday) return;
    setIsCompleted(true);

    let starsEarned = 1;
    if (mistakes === 0) starsEarned = 3;
    else if (mistakes <= 2) starsEarned = 2;
    setEarnedStars(starsEarned);

    // Save daily progress locally
    const dailyProg: DailyProgress = {
      date: todayStr,
      puzzleId: dailyPuzzleDef.id,
      completed: true,
      timeSeconds: timerSeconds,
      mistakes,
      stars: starsEarned,
      completedAt: Date.now(),
    };
    saveDailyProgress(dailyProg);

    // Update streak
    const { updatedStreak } = processDailyStreak(streakData, todayStr);
    saveStreakData(updatedStreak);
    setStreakData(updatedStreak);
    setAlreadyCompletedToday(true);

    // Update player statistics with daily bonus
    const { pointsEarned: earned } = recordCompletionStats(
      timerSeconds,
      mistakes,
      starsEarned,
      dailyPuzzleDef.difficulty,
      5 // +5 bonus for daily
    );
    setPointsEarned(earned);
    setTodayGoalCompleted(todayStr);

    // Check achievements
    checkAndUnlockAchievements({
      wonGame: true,
      mistakes,
      timeSeconds: timerSeconds,
      difficulty: dailyPuzzleDef.difficulty,
      dailyStreak: updatedStreak.currentStreak,
    });

    setIsVictoryModalOpen(true);
  };

  const handleInputNumber = (num: number) => {
    if (!selectedCell || isPaused || isCompleted) return;
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
        {
          row,
          col,
          prevValue: prevVal,
          newValue: prevVal,
          prevNotes: prevCellNotes,
          newNotes: newCellNotes,
        },
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
        setMistakes((prev) => prev + 1);
        sound.playMistake();
        voice.speakConflict();
      } else {
        sound.playNumberPlace();
      }

      setHistory((prev) => [
        ...prev,
        {
          row,
          col,
          prevValue: prevVal,
          newValue: num,
          prevNotes: prevCellNotes,
          newNotes: [],
        },
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
        handlePuzzleSolved();
      }
    }
  };

  const handleUseLifeline = () => {
    if (lifelines <= 0 || isPaused || isCompleted) {
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
    updateUserStats((prev) => ({
      ...prev,
      totalLifelinesUsed: prev.totalLifelinesUsed + 1,
    }));

    const nextBoard = cloneBoard(currentBoard);
    nextBoard[row][col] = value;
    setCurrentBoard(nextBoard);

    setNotes((prev) => {
      const next = prev.map((r) => r.map((c) => [...c]));
      next[row][col] = [];
      for (let i = 0; i < 9; i++) {
        next[row][i] = next[row][i].filter((n) => n !== value);
        next[i][col] = next[i][col].filter((n) => n !== value);
      }
      const br = Math.floor(row / 3) * 3;
      const bc = Math.floor(col / 3) * 3;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          next[r][c] = next[r][c].filter((n) => n !== value);
        }
      }
      return next;
    });

    setHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: prevVal,
        newValue: value,
        prevNotes: prevCellNotes,
        newNotes: [],
      },
    ]);

    sound.playLifelineUsed();
    voice.speakHintUsed();

    if (isBoardSolved(nextBoard, solution)) {
      handlePuzzleSolved();
    }
  };

  const handleRewardLifeline = () => {
    setLifelines((prev) => prev + 1);
    updateUserStats((prev) => ({
      ...prev,
      lifelinesEarned: prev.lifelinesEarned + 1,
      mathChallengesSolved: (prev.mathChallengesSolved || 0) + 1,
    }));
    const updatedStats = loadUserStats();
    checkAndUnlockAchievements({
      mathChallengesSolved: updatedStats.mathChallengesSolved || 0,
    });
  };

  const actionsRef = useRef({
    handleInputNumber,
    handleErase,
    handleTogglePencil,
    handleUseLifeline,
  });
  useEffect(() => {
    actionsRef.current = {
      handleInputNumber,
      handleErase,
      handleTogglePencil,
      handleUseLifeline,
    };
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isMathModalOpen || isVictoryModalOpen) {
        if (e.key === 'Escape') {
          setIsMathModalOpen(false);
          setIsVictoryModalOpen(false);
        }
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused || isCompleted) return;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        actionsRef.current.handleInputNumber(parseInt(e.key, 10));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        actionsRef.current.handleErase();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        actionsRef.current.handleTogglePencil();
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        actionsRef.current.handleUseLifeline();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          if (!prev) return { row: 4, col: 4 };
          let { row, col } = prev;
          if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
          if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
          if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
          if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
          sound.playCellClick();
          return { row, col };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPaused,
    isCompleted,
    isMathModalOpen,
    isVictoryModalOpen,
  ]);

  return (
    <div className="daily-view-container">
      {/* Top Banner with Section 25 Details */}
      <div className="daily-view-header">
        <button
          type="button"
          className="back-nav-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="daily-view-title-block">
          <div className="daily-badge-inline">
            <Calendar size={15} />
            <span>TODAY'S SUDOKU</span>
          </div>
          <h1 className="daily-view-date">{readableDate}</h1>
          <div className="daily-meta-row">
            <span className="diff-pill diff-daily">{dailyPuzzleDef.difficulty}</span>
            <span className="daily-status-indicator">
              {alreadyCompletedToday ? '✓ Solved' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="daily-streak-badge" title="Consecutive daily solve streak">
          <Flame size={18} className="flame-gold" />
          <span className="streak-count">{streakData.currentStreak} Day Streak</span>
        </div>
      </div>

      {alreadyCompletedToday && (
        <div className="daily-completed-notice" role="status">
          <CheckCircle2 size={20} className="icon-green" />
          <div>
            <strong>Daily Challenge Complete</strong>
            <p>
              Solved in {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s with {mistakes} mistakes. Your {streakData.currentStreak}-day streak is secured for today!
            </p>
          </div>
        </div>
      )}

      {/* Main Game Stage */}
      <div className="daily-stage-wrapper">
        <div className="game-stage-card">
          <GameHeader
            levelNumber={dailyPuzzleDef.id}
            difficulty={dailyPuzzleDef.difficulty}
            timerSeconds={timerSeconds}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            mistakes={mistakes}
            lifelines={lifelines}
            onOpenMathChallenge={() => setIsMathModalOpen(true)}
            onRestart={() => {
              if (alreadyCompletedToday) return;
              setCurrentBoard(cloneBoard(initialBoard));
              setTimerSeconds(0);
              setMistakes(0);
              setLifelines(2);
              setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
              setHistory([]);
            }}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onOpenLevelSelect={onBack}
          />

          <SudokuBoard
            initialBoard={initialBoard}
            currentBoard={currentBoard}
            notes={notes}
            selectedCell={selectedCell}
            conflicts={conflicts}
            onSelectCell={handleSelectCell}
            isPaused={isPaused}
            onResume={() => setIsPaused(false)}
          />

          <Keypad
            onNumberClick={handleInputNumber}
            onErase={handleErase}
            onUndo={handleUndo}
            canUndo={history.length > 0}
            pencilMode={pencilMode}
            onTogglePencil={handleTogglePencil}
            lifelines={lifelines}
            onUseLifeline={handleUseLifeline}
            onOpenMathChallenge={() => setIsMathModalOpen(true)}
            remainingCounts={remainingCounts}
            disabled={isPaused || isCompleted}
          />
        </div>
      </div>

      {/* Modals */}
      <MathChallengeModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onRewardLifeline={handleRewardLifeline}
        currentLifelines={lifelines}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        levelNumber={dailyPuzzleDef.id}
        difficulty={dailyPuzzleDef.difficulty}
        timeSeconds={timerSeconds}
        mistakes={mistakes}
        stars={earnedStars}
        pointsEarned={pointsEarned}
        onNextLevel={onBack}
        onReplay={() => {
          setIsVictoryModalOpen(false);
        }}
        onOpenLevelSelect={onBack}
      />
    </div>
  );
};
