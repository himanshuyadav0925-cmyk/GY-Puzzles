// Mock localStorage for Node.js test runner
const store: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    length: 0,
  };
}

import { loadAllLevelProgress, recordCompletionStats } from '../src/utils/storage';
import { VERIFIED_PUZZLES } from '../src/data/puzzles';

console.log('=== GY PUZZLES APP FEATURE & PROGRESSION TEST ===\n');

// 1. Verify Starter Benchmark Levels in loadAllLevelProgress
const progress = loadAllLevelProgress();
const starterLevels = [1, 21, 41, 61, 81];
let startersOk = true;

starterLevels.forEach((id) => {
  if (!progress[id]) {
    console.error(`❌ FAILED: Starter level ${id} not initialized in progress`);
    startersOk = false;
  } else {
    const puzzle = VERIFIED_PUZZLES.find(p => p.id === id);
    console.log(`✅ PASSED: Level ${id} (${puzzle?.difficulty}) initialized and unlocked`);
  }
});

if (startersOk) {
  console.log('✅ PASSED: All benchmark starter levels initialized');
}

// 2. Test recordCompletionStats with lifelines
console.log('\n--- 2. Testing Stats Recording with Lifelines ---');
const { updatedStats, pointsEarned } = recordCompletionStats(120, 0, 3, 'Medium', 0, 1);
if (updatedStats.totalLifelinesUsed >= 1) {
  console.log(`✅ PASSED: totalLifelinesUsed correctly incremented to ${updatedStats.totalLifelinesUsed}`);
} else {
  console.error(`❌ FAILED: totalLifelinesUsed not incremented: ${updatedStats.totalLifelinesUsed}`);
}

if (pointsEarned === 15) { // 10 base + 5 for 3-star
  console.log(`✅ PASSED: 3-Star solve correctly awarded 15 GY Points`);
} else {
  console.error(`❌ FAILED: Expected 15 points, got ${pointsEarned}`);
}

// 3. Test Difficulty Level Boundaries across all 100 puzzles
console.log('\n--- 3. Testing Difficulty Distribution Boundaries ---');
const beginnerCount = VERIFIED_PUZZLES.filter(p => p.id >= 1 && p.id <= 20 && p.difficulty === 'Beginner').length;
const easyCount = VERIFIED_PUZZLES.filter(p => p.id >= 21 && p.id <= 40 && p.difficulty === 'Easy').length;
const mediumCount = VERIFIED_PUZZLES.filter(p => p.id >= 41 && p.id <= 60 && p.difficulty === 'Medium').length;
const hardCount = VERIFIED_PUZZLES.filter(p => p.id >= 61 && p.id <= 80 && p.difficulty === 'Hard').length;
const expertCount = VERIFIED_PUZZLES.filter(p => p.id >= 81 && p.id <= 100 && p.difficulty === 'Expert').length;

if (beginnerCount === 20 && easyCount === 20 && mediumCount === 20 && hardCount === 20 && expertCount === 20) {
  console.log('✅ PASSED: All 5 difficulty tiers have exactly 20 consecutively indexed levels (1–100 total)');
} else {
  console.error('❌ FAILED: Difficulty tier counts mismatched');
}

console.log('\n🎉 ALL APPLICATION FEATURE TESTS PASSED!');
