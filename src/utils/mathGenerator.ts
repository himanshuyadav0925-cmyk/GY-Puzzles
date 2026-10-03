import type { MathQuestion } from '../types/sudoku';

export function generateMathQuestion(): MathQuestion {
  const operations: Array<'+' | '-' | '×' | '÷'> = ['+', '-', '×', '÷'];
  const operator = operations[Math.floor(Math.random() * operations.length)];

  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  switch (operator) {
    case '+': {
      num1 = Math.floor(Math.random() * 65) + 15; // 15 to 80
      num2 = Math.floor(Math.random() * 55) + 12; // 12 to 67
      answer = num1 + num2;
      break;
    }
    case '-': {
      const a = Math.floor(Math.random() * 70) + 25; // 25 to 95
      const b = Math.floor(Math.random() * (a - 10)) + 10;
      num1 = a;
      num2 = b;
      answer = num1 - num2;
      break;
    }
    case '×': {
      num1 = Math.floor(Math.random() * 15) + 6; // 6 to 20
      num2 = Math.floor(Math.random() * 11) + 3; // 3 to 13
      answer = num1 * num2;
      break;
    }
    case '÷': {
      const divisor = Math.floor(Math.random() * 11) + 3; // 3 to 13
      const quotient = Math.floor(Math.random() * 14) + 4; // 4 to 17
      num1 = divisor * quotient;
      num2 = divisor;
      answer = quotient;
      break;
    }
  }

  // Generate 3 plausible distractors
  const distractors = new Set<number>();
  distractors.add(answer);

  const deltas = [-10, 10, -1, 1, -2, 2, -5, 5, 3, -3];
  // Shuffle deltas
  for (let i = deltas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deltas[i], deltas[j]] = [deltas[j], deltas[i]];
  }

  for (const delta of deltas) {
    const candidate = answer + delta;
    if (candidate > 0 && candidate !== answer) {
      distractors.add(candidate);
      if (distractors.size === 4) break;
    }
  }

  // Fallback if needed
  let fallbackOffset = 4;
  while (distractors.size < 4) {
    distractors.add(answer + fallbackOffset);
    fallbackOffset += 3;
  }

  const options = Array.from(distractors);
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    id: `math_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    num1,
    num2,
    operator,
    answer,
    options,
  };
}
