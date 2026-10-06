import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ActiveView,
  BoardGrid,
  CellPosition,
  Difficulty,
  GameMode,
  GameState,
  LevelProgress,
  MoveHistoryItem,
  StreakData,
  UserSettings,
  UserStatistics,
} from './types/sudoku';
import { VERIFIED_PUZZLES } from './data/puzzles';
import {
  cloneBoard,
  getConflicts,
  getRemainingDigitCounts,
  getSmartHint,
  isBoardSolved,
  isCellCorrect,
  stringToBoard,
} from './utils/sudokuSolver';
import { sound } from './utils/sound';
import { voice } from './utils/voice';
import {
  checkAndUnlockAchievements,
  loadAchievements,
  loadActiveGame,
  loadAllDailyProgress,
  loadAllLevelProgress,
  loadChallengeStats,
  loadSettings,
  loadStreakData,
  loadUserStats,
  recordCompletionStats,
  saveActiveGame,
  saveLevelProgress,
  saveSettings,
  updateUserStats,
  isWelcomeSeen,
  setWelcomeSeen,
  isTutorialSeen,
  isTodayGoalCompleted,
  setTodayGoalCompleted,
} from './utils/storage';
import { getTodayDateString } from './utils/dailySudoku';
import { Navbar } from './components/Navbar';
import { MobileNavBar } from './components/MobileNavBar';
import { HomeScreen } from './components/HomeScreen';
import { LevelMapScreen } from './components/LevelMapScreen';
import { DailySudokuView } from './components/DailySudokuView';
import { StatisticsScreen } from './components/StatisticsScreen';
import { GYChallengeView } from './components/GYChallengeView';
import { GameHeader } from './components/GameHeader';
import { SudokuBoard } from './components/SudokuBoard';
import { Keypad } from './components/Keypad';
import { MathChallengeModal } from './components/MathChallengeModal';
import { VictoryModal } from './components/VictoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { RulesHelpModal } from './components/RulesHelpModal';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ModeSelectModal } from './components/ModeSelectModal';
import { Toast, type ToastMessage, type ToastType } from './components/Toast';

export const App: React.FC = () => {
  // Navigation View State
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Persistence States
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [progressMap, setProgressMap] = useState<Record<number, LevelProgress>>(() =>
    loadAllLevelProgress()
  );
  const [userStats, setUserStats] = useState<UserStatistics>(() => loadUserStats());
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());
  const [challengeStats, setChallengeStats] = useState(() => loadChallengeStats());
  const [achievements, setAchievements] = useState(() => loadAchievements());
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Loaded active saved game on mount (safely validated)
  const [initialSavedGame] = useState<GameState | null>(() => {
    try {
      const saved = loadActiveGame();
      if (saved && saved.levelId && !saved.isCompleted) {
        const pDef = VERIFIED_PUZZLES.find((p) => p.id === saved.levelId);
        if (pDef) return saved;
      }
    } catch {
      // Ignore parse/read errors
    }
    return null;
  });
  const hasSavedActiveGame = Boolean(initialSavedGame);

  // Level & Puzzle State
  const [currentLevelId, setCurrentLevelId] = useState<number>(() =>
    hasSavedActiveGame ? initialSavedGame!.levelId : 1
  );
  const [initialBoard, setInitialBoard] = useState<BoardGrid>(() =>
    hasSavedActiveGame ? initialSavedGame!.initialBoard : stringToBoard(VERIFIED_PUZZLES[0].puzzle)
  );
  const [currentBoard, setCurrentBoard] = useState<BoardGrid>(() =>
    hasSavedActiveGame ? initialSavedGame!.currentBoard : stringToBoard(VERIFIED_PUZZLES[0].puzzle)
  );
  const [solution, setSolution] = useState<BoardGrid>(() =>
    hasSavedActiveGame ? initialSavedGame!.solution : stringToBoard(VERIFIED_PUZZLES[0].solution)
  );
  const [notes, setNotes] = useState<number[][][]>(() =>
    hasSavedActiveGame && initialSavedGame!.notes
      ? initialSavedGame!.notes
      : Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
  );

  // Gameplay State
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(() =>
    hasSavedActiveGame ? initialSavedGame!.selectedCell || null : null
  );
  const [pencilMode, setPencilMode] = useState<boolean>(() =>
    hasSavedActiveGame ? initialSavedGame!.pencilMode || false : false
  );
  const [timerSeconds, setTimerSeconds] = useState<number>(() =>
    hasSavedActiveGame ? initialSavedGame!.timerSeconds || 0 : 0
  );
  const [isPaused, setIsPaused] = useState<boolean>(() =>
    hasSavedActiveGame ? initialSavedGame!.isPaused || false : false
  );
  const [mistakes, setMistakes] = useState<number>(() =>
    hasSavedActiveGame ? initialSavedGame!.mistakes || 0 : 0
  );
  const [lifelines, setLifelines] = useState<number>(() =>
    hasSavedActiveGame ? initialSavedGame!.lifelines ?? 2 : 2
  );
  const [puzzleLifelinesUsed, setPuzzleLifelinesUsed] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [history, setHistory] = useState<MoveHistoryItem[]>(() =>
    hasSavedActiveGame ? initialSavedGame!.history || [] : []
  );
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [isNewBestTime, setIsNewBestTime] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>(() =>
    hasSavedActiveGame && initialSavedGame!.mode
      ? initialSavedGame!.mode
      : settings.preferredMode || 'relax'
  );
  const [isModeSelectOpen, setIsModeSelectOpen] = useState<boolean>(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(10);
  const [todayGoalDone, setTodayGoalDone] = useState<boolean>(() => isTodayGoalCompleted(getTodayDateString()));

  // Friendly Toast Feedback State (Section 16)
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback((text: string, type: ToastType = 'info') => {
    setToast({ id: `${Date.now()}-${Math.random()}`, text, type });
  }, []);
  const handleDismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Safe Destructive Action Confirmation State (Section 5)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Modals
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => !isWelcomeSeen());
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active level definition
  const currentPuzzleDef =
    VERIFIED_PUZZLES.find((p) => p.id === currentLevelId) || VERIFIED_PUZZLES[0];

  // Total stars tally
  const totalStars = Object.values(progressMap).reduce(
    (sum, p) => sum + (p.stars || 0),
    0
  );

  const completedLevelsCount = Object.values(progressMap).filter(
    (p) => p.completed
  ).length;

  // Daily puzzle status
  const todayStr = getTodayDateString();
  const dailyProgressList = loadAllDailyProgress();
  const dailyCompletedToday = Boolean(dailyProgressList[todayStr]?.completed);

  // Dynamic conflicts & remaining digit counts
  const conflicts = getConflicts(currentBoard, solution, settings.highlightDuplicates);
  const remainingCounts = getRemainingDigitCounts(currentBoard, solution);

  // Active Game state to pass to HomeScreen (Section 15)
  const activeGameState: GameState | null =
    !isCompleted && currentBoard.some((row, r) => row.some((val, c) => val !== initialBoard[r][c]))
      ? {
          levelId: currentLevelId,
          mode: gameMode,
          difficulty: currentPuzzleDef.difficulty,
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
        }
      : null;

  // Apply Theme & Accessibility classes to document element (Sections 18, 19, 20)
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = settings.theme;
    if (effectiveTheme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Keep sound and voice subsystems in sync with loaded settings
    sound.setMuted(!settings.soundEnabled);
    voice.setVoiceEnabled(settings.voiceEnabled);
  }, [settings.theme, settings.highContrast, settings.reducedMotion, settings.soundEnabled, settings.voiceEnabled]);

  // Load a specific Level
  const loadLevel = (levelId: number, startFresh: boolean = true, modeOverride?: GameMode) => {
    const pDef = VERIFIED_PUZZLES.find((p) => p.id === levelId) || VERIFIED_PUZZLES[0];
    const initial = stringToBoard(pDef.puzzle);
    const sol = stringToBoard(pDef.solution);

    if (modeOverride) {
      setGameMode(modeOverride);
    }

    setCurrentLevelId(levelId);
    setInitialBoard(initial);
    setCurrentBoard(cloneBoard(initial));
    setSolution(sol);
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    setTimerSeconds(0);
    setIsPaused(false);
    setMistakes(0);
    setLifelines(2); // Exactly 2 free lifelines per puzzle
    setPuzzleLifelinesUsed(0);
    setIsCompleted(false);
    setHistory([]);
    setSelectedCell(null);
    setPencilMode(false);
    setIsVictoryModalOpen(false);
    setIsNewBestTime(false);
    navigateToView('play');

    if (startFresh) {
      updateUserStats((prev) => ({
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      }));
      setUserStats(loadUserStats());
      voice.speakPuzzleStarted(levelId);
    }
  };

  // Re-synchronize storage data whenever returning to the Home view
  const navigateToView = (view: ActiveView) => {
    if (view === 'home') {
      setStreakData(loadStreakData());
      setTodayGoalDone(isTodayGoalCompleted(todayStr));
      setUserStats(loadUserStats());
      setProgressMap(loadAllLevelProgress());
      setChallengeStats(loadChallengeStats());
      setAchievements(loadAchievements());
    }
    setActiveView(view);
  };

  // Launch a game directly by Difficulty tier (Sections 1 & 3)
  const handleSelectDifficulty = (diff: Difficulty) => {
    let minId = 1;
    let maxId = 20;
    if (diff === 'Easy') { minId = 21; maxId = 40; }
    else if (diff === 'Medium') { minId = 41; maxId = 60; }
    else if (diff === 'Hard') { minId = 61; maxId = 80; }
    else if (diff === 'Expert') { minId = 81; maxId = 100; }

    let targetId = minId;
    for (let i = minId; i <= maxId; i++) {
      if (!progressMap[i]?.completed) {
        targetId = i;
        break;
      }
    }
    loadLevel(targetId, true, settings.preferredMode || 'relax');
  };

  // Autosave active game whenever state changes (Section 15)
  useEffect(() => {
    if (isCompleted) {
      saveActiveGame(null);
      return;
    }

    const stateToSave: GameState = {
      levelId: currentLevelId,
      mode: gameMode,
      difficulty: currentPuzzleDef.difficulty,
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
    };
    saveActiveGame(stateToSave);
  }, [
    currentLevelId,
    gameMode,
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
    currentPuzzleDef.difficulty,
  ]);

  // Timer Tick (only runs while on 'play' view and not paused)
  useEffect(() => {
    if (
      activeView !== 'play' ||
      isPaused ||
      isCompleted ||
      isMathModalOpen ||
      isVictoryModalOpen ||
      isAchievementsOpen ||
      isRulesOpen ||
      isSettingsOpen ||
      isTutorialOpen ||
      isWelcomeOpen ||
      Boolean(confirmConfig?.isOpen)
    ) {
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeView,
    isPaused,
    isCompleted,
    isMathModalOpen,
    isVictoryModalOpen,
    isAchievementsOpen,
    isRulesOpen,
    isSettingsOpen,
    isTutorialOpen,
    isWelcomeOpen,
    confirmConfig,
  ]);

  // Cell Selection Handler
  const handleSelectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    sound.playCellClick();
  };

  // Toggle Pencil Mode
  const handleTogglePencil = () => {
    setPencilMode((prev) => {
      const next = !prev;
      sound.playCellClick();
      voice.speakNotesMode(next);
      showToast(next ? 'Notes mode ON' : 'Notes mode OFF', 'info');
      return next;
    });
  };

  // Pause / Resume handler (Section 7 & 10)
  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        voice.speakGamePaused();
      } else {
        voice.speakGameResumed();
      }
      return next;
    });
  };

  // Erase current cell or notes
  const handleErase = () => {
    if (!selectedCell || isPaused || isCompleted) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const prevVal = currentBoard[row][col];
    const prevCellNotes = [...(notes[row]?.[col] || [])];
    if (prevVal === null && prevCellNotes.length === 0) return;

    setHistory((prev) => [
      ...prev,
      { row, col, prevValue: prevVal, newValue: null, prevNotes: prevCellNotes, newNotes: [] },
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

  // Undo Move
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

  // Puzzle Solved Celebration (Section 24)
  const handlePuzzleSolved = () => {
    if (isCompleted) return;
    setIsCompleted(true);

    let starsEarned = 1;
    if (mistakes === 0) starsEarned = 3;
    else if (mistakes <= 2) starsEarned = 2;
    setEarnedStars(starsEarned);

    const { isNewRecord } = saveLevelProgress(currentLevelId, true, starsEarned, timerSeconds, mistakes);
    setIsNewBestTime(isNewRecord);

    const updatedProgress = loadAllLevelProgress();
    setProgressMap(updatedProgress);

    const completedCount = Object.values(updatedProgress).filter((p) => p.completed).length;
    const allStarsCount = Object.values(updatedProgress).reduce((acc, p) => acc + (p.stars || 0), 0);

    // Update comprehensive player statistics with GY Points (Section 7)
    const { updatedStats, pointsEarned } = recordCompletionStats(
      timerSeconds,
      mistakes,
      starsEarned,
      currentPuzzleDef.difficulty
    );
    setUserStats(updatedStats);
    setLastEarnedPoints(pointsEarned);
    setTodayGoalCompleted(todayStr);
    setTodayGoalDone(true);

    // Check & trigger achievements
    checkAndUnlockAchievements({
      wonGame: true,
      mistakes,
      timeSeconds: timerSeconds,
      difficulty: currentPuzzleDef.difficulty,
      completedLevelsCount: completedCount,
      totalStars: allStarsCount,
    });
    setAchievements(loadAchievements());

    showToast('Puzzle completed!', 'success');
    voice.speakPuzzleCompleted();
    setIsVictoryModalOpen(true);
    saveActiveGame(null);
  };

  // Input a number (1-9)
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
        setMistakes((prev) => prev + 1);
        sound.playMistake();
        voice.speakConflict();
        showToast('That number conflicts with the puzzle.', 'warning');
      } else {
        sound.playNumberPlace();
        // Occasional friendly positive reinforcement
        if (mistakes === 0 && Math.random() < 0.12) {
          showToast('Good move!', 'success');
          voice.speakNiceMove();
        }
      }

      setHistory((prev) => [
        ...prev,
        { row, col, prevValue: prevVal, newValue: num, prevNotes: prevCellNotes, newNotes: [] },
      ]);

      const nextBoard = cloneBoard(currentBoard);
      nextBoard[row][col] = num;
      setCurrentBoard(nextBoard);

      // Clean up notes in row, column, and 3x3 box
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

  // Use a Lifeline / Smart Hint (Section 8)
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

    const nextLifelines = Math.max(0, lifelines - 1);
    setLifelines(nextLifelines);
    setPuzzleLifelinesUsed((prev) => prev + 1);
    setSelectedCell({ row, col });

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
      { row, col, prevValue: prevVal, newValue: value, prevNotes: prevCellNotes, newNotes: [] },
    ]);

    sound.playLifelineUsed();
    voice.speakHintUsed();
    showToast(`Smart Hint: Row ${hint.row + 1}, column ${hint.col + 1} solved (${value})`, 'hint');
    voice.speakLifelinesRemaining(nextLifelines);

    const updated = updateUserStats((prev) => ({
      ...prev,
      totalLifelinesUsed: prev.totalLifelinesUsed + 1,
    }));
    setUserStats(updated);

    if (isBoardSolved(nextBoard, solution)) {
      handlePuzzleSolved();
    }
  };

  // Reward Lifeline from Maths Challenge (Section 9)
  const handleRewardLifeline = () => {
    setLifelines((prev) => prev + 1);
    showToast('+1 Lifeline earned!', 'success');

    const updated = updateUserStats((prev) => ({
      ...prev,
      lifelinesEarned: prev.lifelinesEarned + 1,
      mathChallengesSolved: prev.mathChallengesSolved + 1,
    }));
    setUserStats(updated);

    checkAndUnlockAchievements({
      mathChallengesSolved: updated.mathChallengesSolved,
    });
    setAchievements(loadAchievements());
  };

  // Prompt safe confirmation before restarting active puzzle (Section 5)
  const promptRestartCurrentPuzzle = () => {
    const hasMoves = currentBoard.some((row, r) => row.some((val, c) => val !== initialBoard[r][c]));
    if (!hasMoves) {
      loadLevel(currentLevelId, false);
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: 'Restart Puzzle?',
      message: 'Your current moves and timer on this level will be reset.',
      confirmText: 'Restart Puzzle',
      cancelText: 'Cancel',
      isDanger: false,
      onConfirm: () => {
        setConfirmConfig(null);
        loadLevel(currentLevelId, false);
        showToast('Puzzle restarted', 'info');
      },
    });
  };

  // Safe reset all data confirmation (Section 5)
  const promptResetAllData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Are you sure?',
      message: 'This will permanently reset your progress.',
      confirmText: 'Reset Progress',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => {
        setConfirmConfig(null);
        handleAllDataReset();
        showToast('All progress reset', 'warning');
      },
    });
  };

  // Full reset callback
  const handleAllDataReset = () => {
    setProgressMap(loadAllLevelProgress());
    setUserStats(loadUserStats());
    setStreakData(loadStreakData());
    setChallengeStats(loadChallengeStats());
    setAchievements(loadAchievements());
    loadLevel(1, false);
    navigateToView('home');
  };

  const actionsRef = useRef({
    handleTogglePause,
    handleInputNumber,
    handleErase,
    handleTogglePencil,
    handleUseLifeline,
    handleUndo,
  });
  useEffect(() => {
    actionsRef.current = {
      handleTogglePause,
      handleInputNumber,
      handleErase,
      handleTogglePencil,
      handleUseLifeline,
      handleUndo,
    };
  });

  // Keyboard navigation & shortcuts (Section 4 & 12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (
        isWelcomeOpen ||
        isTutorialOpen ||
        isMathModalOpen ||
        isAchievementsOpen ||
        isRulesOpen ||
        isSettingsOpen ||
        isModeSelectOpen ||
        confirmConfig?.isOpen
      ) {
        if (e.key === 'Escape') {
          setIsWelcomeOpen(false);
          setIsTutorialOpen(false);
          setIsMathModalOpen(false);
          setIsAchievementsOpen(false);
          setIsRulesOpen(false);
          setIsSettingsOpen(false);
          setIsModeSelectOpen(false);
          setConfirmConfig(null);
        }
        return;
      }

      if (activeView !== 'play') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        actionsRef.current.handleTogglePause();
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

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMathModalOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        actionsRef.current.handleUndo();
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
    activeView,
    isPaused,
    isCompleted,
    isWelcomeOpen,
    isTutorialOpen,
    isMathModalOpen,
    isAchievementsOpen,
    isRulesOpen,
    isSettingsOpen,
    isModeSelectOpen,
    confirmConfig,
  ]);

  // Sound mute toggle
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    const updated = { ...settings, soundEnabled: !muted };
    setSettings(updated);
    saveSettings(updated);
    showToast(!muted ? 'Sound enabled' : 'Sound muted', 'info');
  };

  const isGameplayView = activeView === 'play' || activeView === 'daily' || activeView === 'challenge';

  return (
    <div
      className={`gy-app-root ${settings.animationsEnabled ? 'animations-enabled' : 'animations-disabled'} view-${activeView} ${
        isGameplayView ? 'is-gameplay-view' : ''
      }`}
    >
      {/* Toast Feedback Notification */}
      <Toast toast={toast} onDismiss={handleDismissToast} />

      {/* Desktop Brand Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'levels') voice.speakChooseLevel();
          navigateToView(view);
        }}
        onOpenMathChallenge={() => setIsMathModalOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        totalStars={totalStars}
      />

      {/* Main View Router */}
      <main className="main-content-area" role="main">
        {/* VIEW 1: HOME SCREEN (Section 1 & 15) */}
        {activeView === 'home' && (
          <HomeScreen
            onJustPlay={() => {
              if (activeGameState) {
                navigateToView('play');
              } else {
                loadLevel(currentLevelId, true, settings.preferredMode || 'relax');
              }
            }}
            onPlay={() => setIsModeSelectOpen(true)}
            onSelectDifficulty={handleSelectDifficulty}
            onContinue={() => navigateToView('play')}
            onStartOver={promptRestartCurrentPuzzle}
            onDaily={() => navigateToView('daily')}
            onLevels={() => {
              voice.speakChooseLevel();
              navigateToView('levels');
            }}
            onChallenge={() => navigateToView('challenge')}
            onStats={() => navigateToView('stats')}
            onAchievements={() => setIsAchievementsOpen(true)}
            onRules={() => setIsRulesOpen(true)}
            onTutorial={() => setIsTutorialOpen(true)}
            onSettings={() => setIsSettingsOpen(true)}
            activeGame={activeGameState}
            streakData={streakData}
            totalStars={totalStars}
            completedLevelsCount={completedLevelsCount}
            dailyCompletedToday={dailyCompletedToday}
            todayGoalCompleted={todayGoalDone}
            gyPoints={userStats.gyPoints || 0}
            progressMap={progressMap}
          />
        )}

        {/* VIEW 2: 100 LEVELS PROGRESSION MAP (Section 27) */}
        {activeView === 'levels' && (
          <LevelMapScreen
            onBack={() => navigateToView('home')}
            onSelectLevel={(id) => loadLevel(id, true)}
            currentLevelId={currentLevelId}
            progressMap={progressMap}
          />
        )}

        {/* VIEW 3: DAILY SUDOKU (Section 25) */}
        {activeView === 'daily' && (
          <DailySudokuView
            onBack={() => navigateToView('home')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        )}

        {/* VIEW 4: GY CHALLENGE (INTENSE TIMED MODE) */}
        {activeView === 'challenge' && (
          <GYChallengeView
            onBack={() => navigateToView('home')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* VIEW 5: STATISTICS SCREEN (Section 26) */}
        {activeView === 'stats' && (
          <StatisticsScreen
            onBack={() => navigateToView('home')}
            stats={userStats}
            streakData={streakData}
            challengeStats={challengeStats}
          />
        )}

        {/* VIEW 6: CLASSIC SUDOKU GAMEPLAY (Sections 3, 4, 6, 7, 8) */}
        {activeView === 'play' && (
          <section className="game-stage">
            <div className="game-stage-card">
              <GameHeader
                levelNumber={currentLevelId}
                difficulty={currentPuzzleDef.difficulty}
                timerSeconds={timerSeconds}
                isPaused={isPaused}
                onTogglePause={handleTogglePause}
                mistakes={mistakes}
                lifelines={lifelines}
                onOpenMathChallenge={() => setIsMathModalOpen(true)}
                onRestart={promptRestartCurrentPuzzle}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onOpenLevelSelect={() => {
                  voice.speakChooseLevel();
                  setActiveView('levels');
                }}
                mode={gameMode}
              />

              <SudokuBoard
                initialBoard={initialBoard}
                currentBoard={currentBoard}
                notes={notes}
                selectedCell={selectedCell}
                conflicts={conflicts}
                onSelectCell={handleSelectCell}
                isPaused={isPaused}
                onResume={handleTogglePause}
                mode={gameMode}
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
          </section>
        )}
      </main>

      {/* Brand Footer Dedicated to Govind Yadav */}
      <footer
        className={`gy-footer ${isGameplayView ? 'gy-footer-gameplay' : ''}`}
        role="contentinfo"
      >
        <div className="footer-content">
          <div className="footer-brand">
            <strong>GY Puzzles</strong> • THINK • SOLVE • GROW
          </div>
          <div className="footer-tribute">
            Dedicated with honor to <strong>Govind Yadav</strong>
          </div>
          <div className="footer-links">
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsRulesOpen(true)}
            >
              How to Play
            </button>
            <span>•</span>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsTutorialOpen(true)}
            >
              Tutorial
            </button>
            <span>•</span>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsAchievementsOpen(true)}
            >
              Achievements
            </button>
            <span>•</span>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => {
                voice.speakChooseLevel();
                navigateToView('levels');
              }}
            >
              100 Levels Map
            </button>
            <span>•</span>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsSettingsOpen(true)}
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Section 28) */}
      <MobileNavBar
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'levels') voice.speakChooseLevel();
          navigateToView(view);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Section 1: Lightweight Welcome Modal on First Launch */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => {
          setWelcomeSeen(true);
          setIsWelcomeOpen(false);
        }}
        onPlay={() => {
          setWelcomeSeen(true);
          setIsWelcomeOpen(false);
          // If first time, check if tutorial was seen
          if (!isTutorialSeen()) {
            setIsTutorialOpen(true);
          } else {
            setIsModeSelectOpen(true);
          }
        }}
        onHowToPlay={() => {
          setWelcomeSeen(true);
          setIsWelcomeOpen(false);
          setIsRulesOpen(true);
        }}
        onDaily={() => {
          setWelcomeSeen(true);
          setIsWelcomeOpen(false);
          navigateToView('daily');
        }}
      />

      {/* Section 2: Interactive Beginner Tutorial */}
      <InteractiveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onFinish={() => {
          setIsTutorialOpen(false);
          setIsModeSelectOpen(true);
        }}
      />

      {/* Section 5: Confirmation Modal for Destructive Actions */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isDanger={confirmConfig.isDanger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      {/* Section 9: Mental Maths Challenge */}
      <MathChallengeModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onRewardLifeline={handleRewardLifeline}
        currentLifelines={lifelines}
      />

      {/* Section 24: Enhanced Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        levelNumber={currentLevelId}
        difficulty={currentPuzzleDef.difficulty}
        timeSeconds={timerSeconds}
        mistakes={mistakes}
        stars={earnedStars}
        lifelinesUsed={puzzleLifelinesUsed}
        isNewBestTime={isNewBestTime}
        pointsEarned={lastEarnedPoints}
        animationsEnabled={settings.animationsEnabled}
        onNextLevel={() => {
          if (currentLevelId < 100) {
            loadLevel(currentLevelId + 1, true);
          }
        }}
        onReplay={() => loadLevel(currentLevelId, false)}
        onOpenLevelSelect={() => {
          setIsVictoryModalOpen(false);
          navigateToView('levels');
        }}
      />

      {/* Mode Select Modal (Section 1: Relax vs Classic) */}
      <ModeSelectModal
        isOpen={isModeSelectOpen}
        onClose={() => setIsModeSelectOpen(false)}
        onSelectMode={(mode) => {
          setIsModeSelectOpen(false);
          setGameMode(mode);
          loadLevel(currentLevelId, true, mode);
        }}
        levelNumber={currentLevelId}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* Rules & Help Modal */}
      <RulesHelpModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Section 18: Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetCurrentPuzzle={promptRestartCurrentPuzzle}
        onAllDataReset={promptResetAllData}
      />
    </div>
  );
};

export default App;
