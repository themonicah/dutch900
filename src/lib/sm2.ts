import type { SM2Input, SM2Output } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout, no memory
 * 1 - Wrong answer, but recognized after seeing it
 * 2 - Wrong answer, but it felt familiar
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect, instant recall
 *
 * For the simplified 4-button UI:
 * - Again = 1
 * - Hard = 2
 * - Good = 3
 * - Easy = 4
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, repetitions, easeFactor, interval } = input;

  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  // Calculate new ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Enforce minimum ease factor of 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Calculate interval based on quality
  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1; // First correct: 1 day
    } else if (repetitions === 1) {
      newInterval = 6; // Second correct: 6 days
    } else {
      // Subsequent: multiply by ease factor
      newInterval = Math.ceil(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset progress
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
    // Keep ease factor unchanged on incorrect (per SM-2 spec)
    newEaseFactor = easeFactor;
  }

  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);
  dueDate.setHours(0, 0, 0, 0); // Start of day

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    interval: newInterval,
    dueDate,
  };
}

/**
 * Get the next review interval preview for UI display
 */
export function getNextIntervals(easeFactor: number, interval: number): {
  again: string;
  hard: string;
  good: string;
  easy: string;
} {
  const formatInterval = (days: number): string => {
    if (days < 1) return '<1d';
    if (days === 1) return '1d';
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.round(days / 7)}w`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${Math.round(days / 365)}y`;
  };

  return {
    again: formatInterval(1),
    hard: formatInterval(Math.max(1, Math.ceil(interval * 0.5))),
    good: formatInterval(Math.ceil(interval * easeFactor)),
    easy: formatInterval(Math.ceil(interval * easeFactor * 1.3)),
  };
}

/**
 * Create initial progress for a new card
 */
export function createInitialProgress(): {
  easeFactor: number;
  interval: number;
  dueDate: string;
  repetitions: number;
  totalReviews: number;
  correctCount: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    easeFactor: 2.5,
    interval: 0,
    dueDate: today.toISOString(),
    repetitions: 0,
    totalReviews: 0,
    correctCount: 0,
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}

/**
 * Determine card status based on repetitions and interval
 */
export function getCardStatus(repetitions: number, interval: number): 'new' | 'learning' | 'review' | 'mastered' {
  if (repetitions === 0 && interval === 0) return 'new';
  if (repetitions < 2) return 'learning';
  if (interval >= 21) return 'mastered';
  return 'review';
}
