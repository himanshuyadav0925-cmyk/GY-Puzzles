import type { PuzzleDefinition, StreakData } from '../types/sudoku';
import { VERIFIED_PUZZLES } from '../data/puzzles';

// Get today's local date in 'YYYY-MM-DD' format
export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get readable formatted date e.g. "Friday, October 2, 2026"
export function formatReadableDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Deterministically pick a puzzle for a given date string from our 100 verified puzzles
export function getDailyPuzzleForDate(dateStr: string): PuzzleDefinition {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % VERIFIED_PUZZLES.length;
  return VERIFIED_PUZZLES[index];
}

// Check day difference between two 'YYYY-MM-DD' strings
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

// Update streak when daily puzzle is completed
export function processDailyStreak(
  currentStreakData: StreakData,
  completedDateStr: string
): { updatedStreak: StreakData; isNewStreakDay: boolean } {
  const { currentStreak, longestStreak, lastCompletedDate } = currentStreakData;

  // Already completed today
  if (lastCompletedDate === completedDateStr) {
    return {
      updatedStreak: currentStreakData,
      isNewStreakDay: false,
    };
  }

  let newCurrentStreak = 1;

  if (lastCompletedDate) {
    const diff = getDaysDifference(lastCompletedDate, completedDateStr);
    if (diff === 1) {
      // Completed yesterday: streak continues!
      newCurrentStreak = currentStreak + 1;
    } else if (diff === 0) {
      // Same day edge case
      newCurrentStreak = currentStreak;
    } else {
      // Missed one or more days: reset to 1
      newCurrentStreak = 1;
    }
  }

  const newLongestStreak = Math.max(longestStreak, newCurrentStreak);

  return {
    updatedStreak: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastCompletedDate: completedDateStr,
    },
    isNewStreakDay: true,
  };
}
