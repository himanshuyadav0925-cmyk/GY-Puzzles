export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type ActiveView = 'home' | 'play' | 'daily' | 'levels' | 'stats' | 'challenge' | 'achievements';

export type GameMode = 'classic' | 'daily' | 'challenge' | 'relax';

export interface PuzzleDefinition {
  id: number;
  levelNumber: number;
  difficulty: Difficulty;
  puzzle: string; // 81 chars, '0' or '.' for empty
  solution: string; // 81 chars, '1'-'9'
  clueCount: number;
}

export type CellValue = number | null;
export type NotesGrid = Set<number>[][];
export type BoardGrid = CellValue[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface GameState {
  levelId: number;
  mode: GameMode;
  difficulty: Difficulty;
  initialBoard: BoardGrid;
  currentBoard: BoardGrid;
  solution: BoardGrid;
  notes: number[][][]; // serializable notes
  timerSeconds: number;
  isPaused: boolean;
  mistakes: number;
  lifelines: number;
  isCompleted: boolean;
  history: MoveHistoryItem[];
  selectedCell: CellPosition | null;
  pencilMode: boolean;
  // Challenge mode extra fields
  challengeTimeRemaining?: number;
  challengeScore?: number;
  dateKey?: string; // e.g. '2026-10-02' for daily
}

export interface MoveHistoryItem {
  row: number;
  col: number;
  prevValue: CellValue;
  newValue: CellValue;
  prevNotes: number[];
  newNotes: number[];
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 0 to 3
  bestTime: number | null; // in seconds
  mistakes: number;
  lastPlayed: number; // timestamp
}

export interface DailyProgress {
  date: string; // 'YYYY-MM-DD'
  puzzleId: number;
  completed: boolean;
  timeSeconds: number;
  mistakes: number;
  stars: number;
  completedAt?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // 'YYYY-MM-DD'
}

export interface ChallengeStats {
  highScore: number;
  gamesPlayed: number;
  bestTimeRemaining: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  theme: ThemeMode;
  highContrast: boolean;
  reducedMotion: boolean;
  highlightDuplicates: boolean;
  highlightSameNumbers: boolean;
  highlightCrosshairs: boolean;
  preferredMode: 'relax' | 'classic';
}

export interface UserStatistics {
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalStars: number;
  totalPlayTimeSeconds: number;
  totalMistakes: number;
  totalLifelinesUsed: number;
  threeStarCompletions: number;
  mathChallengesSolved: number;
  lifelinesEarned: number;
  gyPoints: number;
  bestTimeByDifficulty: Record<Difficulty, number | null>;
  overallBestTime: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface MathQuestion {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  options: number[];
}
