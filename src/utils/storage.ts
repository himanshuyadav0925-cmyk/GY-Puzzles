import type {
  Achievement,
  ChallengeStats,
  DailyProgress,
  GameState,
  LevelProgress,
  StreakData,
  UserSettings,
  UserStatistics,
} from '../types/sudoku';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const KEYS = {
  ACTIVE_GAME: 'gy_puzzles_active_game',
  ACTIVE_DAILY_GAME: 'gy_puzzles_active_daily_game',
  LEVEL_PROGRESS: 'gy_puzzles_level_progress',
  DAILY_PROGRESS: 'gy_puzzles_daily_progress',
  STREAK_DATA: 'gy_puzzles_streak_data',
  CHALLENGE_STATS: 'gy_puzzles_challenge_stats',
  USER_SETTINGS: 'gy_puzzles_user_settings',
  USER_STATS: 'gy_puzzles_user_stats',
  ACHIEVEMENTS: 'gy_puzzles_achievements',
  WELCOME_SEEN: 'gy_puzzles_welcome_seen',
  TUTORIAL_SEEN: 'gy_puzzles_tutorial_seen',
  DAILY_GOAL: 'gy_puzzles_daily_goal',
};

export const DEFAULT_STATS: UserStatistics = {
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalStars: 0,
  totalPlayTimeSeconds: 0,
  totalMistakes: 0,
  totalLifelinesUsed: 0,
  threeStarCompletions: 0,
  mathChallengesSolved: 0,
  lifelinesEarned: 0,
  gyPoints: 0,
  bestTimeByDifficulty: {
    Beginner: null,
    Easy: null,
    Medium: null,
    Hard: null,
    Expert: null,
  },
  overallBestTime: null,
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  voiceEnabled: false,
  animationsEnabled: true,
  theme: 'dark',
  highContrast: false,
  reducedMotion: false,
  highlightDuplicates: true,
  highlightSameNumbers: true,
  highlightCrosshairs: true,
  preferredMode: 'relax',
};

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
};

export const DEFAULT_CHALLENGE_STATS: ChallengeStats = {
  highScore: 0,
  gamesPlayed: 0,
  bestTimeRemaining: 0,
};

// Safe JSON parser
function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Error parsing localStorage key:', e);
    return fallback;
  }
}

// Active Game
export function saveActiveGame(game: GameState | null): void {
  try {
    if (game === null) {
      localStorage.removeItem(KEYS.ACTIVE_GAME);
    } else {
      localStorage.setItem(KEYS.ACTIVE_GAME, JSON.stringify(game));
    }
  } catch (e) {
    console.error('Failed to save active game:', e);
  }
}

export function loadActiveGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_GAME);
    return safeParse<GameState | null>(raw, null);
  } catch {
    return null;
  }
}

// Level Progress (Map of levelId -> LevelProgress)
export function loadAllLevelProgress(): Record<number, LevelProgress> {
  try {
    const raw = localStorage.getItem(KEYS.LEVEL_PROGRESS);
    const progress = safeParse<Record<number, LevelProgress>>(raw, {});
    // Ensure benchmark starter levels for each tier are unlocked by default
    const STARTER_LEVELS = [1, 21, 41, 61, 81];
    STARTER_LEVELS.forEach((id) => {
      if (!progress[id]) {
        progress[id] = {
          levelId: id,
          completed: false,
          stars: 0,
          bestTime: null,
          mistakes: 0,
          lastPlayed: Date.now(),
        };
      }
    });
    return progress;
  } catch {
    const fallback: Record<number, LevelProgress> = {};
    [1, 21, 41, 61, 81].forEach((id) => {
      fallback[id] = {
        levelId: id,
        completed: false,
        stars: 0,
        bestTime: null,
        mistakes: 0,
        lastPlayed: Date.now(),
      };
    });
    return fallback;
  }
}

export function saveLevelProgress(
  levelId: number,
  completed: boolean,
  stars: number,
  timeSeconds: number,
  mistakes: number
): { isNewRecord: boolean; newStarsEarned: number } {
  try {
    const all = loadAllLevelProgress();
    const existing = all[levelId];
    const prevStars = existing?.stars || 0;
    const isNewRecord = !existing?.bestTime || timeSeconds < existing.bestTime;
    const newStars = Math.max(prevStars, stars);
    const starDelta = Math.max(0, newStars - prevStars);

    all[levelId] = {
      levelId,
      completed,
      stars: newStars,
      bestTime: existing?.bestTime ? Math.min(existing.bestTime, timeSeconds) : timeSeconds,
      mistakes: Math.min(existing?.mistakes ?? 999, mistakes),
      lastPlayed: Date.now(),
    };

    // Auto-unlock next level up to 100
    if (levelId < 100 && !all[levelId + 1]) {
      all[levelId + 1] = {
        levelId: levelId + 1,
        completed: false,
        stars: 0,
        bestTime: null,
        mistakes: 0,
        lastPlayed: Date.now(),
      };
    }

    localStorage.setItem(KEYS.LEVEL_PROGRESS, JSON.stringify(all));
    return { isNewRecord, newStarsEarned: starDelta };
  } catch (e) {
    console.error('Failed to save level progress:', e);
    return { isNewRecord: false, newStarsEarned: 0 };
  }
}

// Daily Sudoku Progress
export function loadAllDailyProgress(): Record<string, DailyProgress> {
  try {
    const raw = localStorage.getItem(KEYS.DAILY_PROGRESS);
    return safeParse<Record<string, DailyProgress>>(raw, {});
  } catch {
    return {};
  }
}

export function loadDailyProgress(dateStr: string): DailyProgress | null {
  const all = loadAllDailyProgress();
  return all[dateStr] || null;
}

export function saveDailyProgress(progress: DailyProgress): void {
  try {
    const all = loadAllDailyProgress();
    all[progress.date] = progress;
    localStorage.setItem(KEYS.DAILY_PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save daily progress:', e);
  }
}

// Streak Data
export function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(KEYS.STREAK_DATA);
    return safeParse<StreakData>(raw, DEFAULT_STREAK);
  } catch {
    return DEFAULT_STREAK;
  }
}

export function saveStreakData(streak: StreakData): void {
  try {
    localStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(streak));
  } catch (e) {
    console.error('Failed to save streak data:', e);
  }
}

// Challenge Stats
export function loadChallengeStats(): ChallengeStats {
  try {
    const raw = localStorage.getItem(KEYS.CHALLENGE_STATS);
    return safeParse<ChallengeStats>(raw, DEFAULT_CHALLENGE_STATS);
  } catch {
    return DEFAULT_CHALLENGE_STATS;
  }
}

export function recordChallengeGame(score: number, timeRemaining: number): { isNewHighScore: boolean; stats: ChallengeStats } {
  try {
    const prev = loadChallengeStats();
    const isNewHighScore = score > prev.highScore;
    const updated: ChallengeStats = {
      highScore: Math.max(prev.highScore, score),
      gamesPlayed: prev.gamesPlayed + 1,
      bestTimeRemaining: Math.max(prev.bestTimeRemaining, timeRemaining),
    };
    localStorage.setItem(KEYS.CHALLENGE_STATS, JSON.stringify(updated));
    return { isNewHighScore, stats: updated };
  } catch {
    return { isNewHighScore: false, stats: DEFAULT_CHALLENGE_STATS };
  }
}

// User Settings
export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEYS.USER_SETTINGS);
    const parsed = safeParse<Partial<UserSettings>>(raw, {});
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// User Stats
export function loadUserStats(): UserStatistics {
  try {
    const raw = localStorage.getItem(KEYS.USER_STATS);
    const parsed = safeParse<UserStatistics>(raw, DEFAULT_STATS);
    // Ensure all numeric keys exist
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestTimeByDifficulty: {
        ...DEFAULT_STATS.bestTimeByDifficulty,
        ...(parsed?.bestTimeByDifficulty || {}),
      },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function updateUserStats(updater: (prev: UserStatistics) => UserStatistics): UserStatistics {
  try {
    const prev = loadUserStats();
    const updated = updater(prev);
    localStorage.setItem(KEYS.USER_STATS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update stats:', e);
    return DEFAULT_STATS;
  }
}

// Record completion stats cleanly with GY Points (Section 7)
export function recordCompletionStats(
  timeSeconds: number,
  mistakes: number,
  stars: number,
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert',
  bonusPoints: number = 0,
  lifelinesUsed: number = 0
): { updatedStats: UserStatistics; pointsEarned: number } {
  const pointsEarned = 10 + (stars === 3 ? 5 : 0) + bonusPoints;
  const updated = updateUserStats((prev) => {
    const currentBestDiff = prev.bestTimeByDifficulty[difficulty];
    const newBestDiff = currentBestDiff === null || timeSeconds < currentBestDiff ? timeSeconds : currentBestDiff;
    const newOverallBest = prev.overallBestTime === null || timeSeconds < prev.overallBestTime ? timeSeconds : prev.overallBestTime;

    return {
      ...prev,
      totalGamesWon: prev.totalGamesWon + 1,
      totalPlayTimeSeconds: prev.totalPlayTimeSeconds + timeSeconds,
      totalMistakes: prev.totalMistakes + mistakes,
      totalLifelinesUsed: prev.totalLifelinesUsed + lifelinesUsed,
      threeStarCompletions: stars === 3 ? prev.threeStarCompletions + 1 : prev.threeStarCompletions,
      gyPoints: (prev.gyPoints || 0) + pointsEarned,
      bestTimeByDifficulty: {
        ...prev.bestTimeByDifficulty,
        [difficulty]: newBestDiff,
      },
      overallBestTime: newOverallBest,
    };
  });

  return { updatedStats: updated, pointsEarned };
}

// Add GY Points helper
export function addGyPoints(points: number): number {
  const updated = updateUserStats((prev) => ({
    ...prev,
    gyPoints: (prev.gyPoints || 0) + points,
  }));
  return updated.gyPoints;
}

// Achievements
export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(KEYS.ACHIEVEMENTS);
    const saved = safeParse<Achievement[]>(raw, []);
    if (!saved || saved.length === 0) {
      return INITIAL_ACHIEVEMENTS;
    }
    // Merge with initial list in case new achievements were added
    return INITIAL_ACHIEVEMENTS.map((initial) => {
      const match = saved.find((s) => s.id === initial.id);
      return match || initial;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function checkAndUnlockAchievements(
  events: {
    wonGame?: boolean;
    mistakes?: number;
    timeSeconds?: number;
    difficulty?: string;
    completedLevelsCount?: number;
    mathChallengesSolved?: number;
    totalStars?: number;
    dailyStreak?: number;
  }
): Achievement[] {
  try {
    const list = loadAchievements();
    let changed = false;
    const newlyUnlocked: Achievement[] = [];

    const updated = list.map((ach) => {
      if (ach.isUnlocked) return ach;
      let shouldUnlock = false;
      let newProgress = ach.progress || 0;

      if (ach.id === 'first_win' && events.wonGame) {
        shouldUnlock = true;
        newProgress = 1;
      } else if (ach.id === 'five_solves' && events.completedLevelsCount !== undefined) {
        newProgress = Math.min(events.completedLevelsCount, 5);
        if (events.completedLevelsCount >= 5) shouldUnlock = true;
      } else if (ach.id === 'flawless' && events.wonGame && events.mistakes === 0) {
        shouldUnlock = true;
        newProgress = 1;
      } else if (ach.id === 'daily_player' && events.dailyStreak !== undefined) {
        newProgress = Math.min(events.dailyStreak, 3);
        if (events.dailyStreak >= 3) shouldUnlock = true;
      } else if ((ach.id === 'math_master' || ach.id === 'math_scholar') && events.mathChallengesSolved !== undefined) {
        newProgress = events.mathChallengesSolved;
        if (newProgress >= (ach.maxProgress || 3)) shouldUnlock = true;
      } else if (ach.id === 'math_genius' && events.mathChallengesSolved !== undefined) {
        newProgress = events.mathChallengesSolved;
        if (newProgress >= 10) shouldUnlock = true;
      } else if (ach.id === 'level_10' && events.completedLevelsCount !== undefined) {
        newProgress = events.completedLevelsCount;
        if (newProgress >= 10) shouldUnlock = true;
      } else if (ach.id === 'level_25' && events.completedLevelsCount !== undefined) {
        newProgress = events.completedLevelsCount;
        if (newProgress >= 25) shouldUnlock = true;
      } else if (ach.id === 'star_collector' && events.totalStars !== undefined) {
        newProgress = events.totalStars;
        if (newProgress >= (ach.maxProgress || 15)) shouldUnlock = true;
      } else if (
        ach.id === 'speedster' &&
        events.wonGame &&
        events.timeSeconds !== undefined &&
        events.timeSeconds <= 300
      ) {
        shouldUnlock = true;
        newProgress = 1;
      } else if (ach.id === 'hard_solver' && events.wonGame && events.difficulty === 'Hard') {
        shouldUnlock = true;
        newProgress = 1;
      } else if (ach.id === 'expert_solver' && events.wonGame && events.difficulty === 'Expert') {
        shouldUnlock = true;
        newProgress = 1;
      }

      if (shouldUnlock) {
        changed = true;
        const unlockedAch = {
          ...ach,
          isUnlocked: true,
          unlockedAt: Date.now(),
          progress: ach.maxProgress || 1,
        };
        newlyUnlocked.push(unlockedAch);
        return unlockedAch;
      } else if (newProgress !== ach.progress) {
        changed = true;
        return { ...ach, progress: newProgress };
      }

      return ach;
    });

    if (changed) {
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    }

    return newlyUnlocked;
  } catch (e) {
    console.error('Error updating achievements:', e);
    return [];
  }
}

// Reset all user data completely
export function resetAllUserData(): void {
  try {
    Object.values(KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('Error clearing user data:', e);
  }
}

// Active Daily Sudoku Game
export function saveActiveDailyGame(game: GameState | null): void {
  try {
    if (game === null) {
      localStorage.removeItem(KEYS.ACTIVE_DAILY_GAME);
    } else {
      localStorage.setItem(KEYS.ACTIVE_DAILY_GAME, JSON.stringify(game));
    }
  } catch (e) {
    console.error('Failed to save daily game:', e);
  }
}

export function loadActiveDailyGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_DAILY_GAME);
    return safeParse<GameState | null>(raw, null);
  } catch {
    return null;
  }
}

// First Launch Welcome Screen Status
export function isWelcomeSeen(): boolean {
  try {
    return localStorage.getItem(KEYS.WELCOME_SEEN) === 'true';
  } catch {
    return false;
  }
}

export function setWelcomeSeen(seen: boolean = true): void {
  try {
    localStorage.setItem(KEYS.WELCOME_SEEN, seen ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

// Interactive Tutorial Status
export function isTutorialSeen(): boolean {
  try {
    return localStorage.getItem(KEYS.TUTORIAL_SEEN) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialSeen(seen: boolean = true): void {
  try {
    localStorage.setItem(KEYS.TUTORIAL_SEEN, seen ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

// Daily Goal Tracking (Section 4)
export function isTodayGoalCompleted(todayStr: string): boolean {
  try {
    return localStorage.getItem(KEYS.DAILY_GOAL) === todayStr;
  } catch {
    return false;
  }
}

export function setTodayGoalCompleted(todayStr: string): void {
  try {
    localStorage.setItem(KEYS.DAILY_GOAL, todayStr);
  } catch {
    // Ignore
  }
}


