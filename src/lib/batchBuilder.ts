/**
 * Smart batch builder for creating practice sessions
 * Uses Anki-style prioritization: red > yellow > green review > new
 */

import type { ScoreColor } from './fuzzyMatch';

export type WordStatus = ScoreColor | 'new';

export interface WordModeProgress {
  wordId: number;
  mode: 'learn' | 'listen' | 'produce';
  status: WordStatus;
  lastAttempt: string | null;
  attempts: number;
}

/**
 * Fisher-Yates shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build a smart batch of word IDs for practice
 *
 * Priority order:
 * 1. Troubled words (~5) - words that took 3+ attempts, need reinforcement
 * 2. Red words (~5) - struggled with these
 * 3. Yellow words (~3) - close but need practice
 * 4. Green review (1-2) - occasional review to prevent forgetting
 * 5. New words - fill remaining slots
 *
 * @param allWordIds - All available word IDs
 * @param progressMap - Map of wordId -> WordModeProgress
 * @param batchSize - Number of words in batch (default 20)
 * @param troubledWordIds - Set of word IDs that need extra practice
 */
export function buildSmartBatch(
  allWordIds: number[],
  progressMap: Map<number, WordModeProgress>,
  batchSize: number = 20,
  troubledWordIds: Set<number> = new Set()
): number[] {
  // Categorize words by status
  const troubledWords: number[] = [];
  const redWords: number[] = [];
  const yellowWords: number[] = [];
  const greenWords: number[] = [];
  const newWords: number[] = [];

  for (const wordId of allWordIds) {
    const progress = progressMap.get(wordId);
    const isTroubled = troubledWordIds.has(wordId);

    if (isTroubled) {
      // Troubled words get highest priority
      troubledWords.push(wordId);
    } else if (!progress || progress.status === 'new') {
      newWords.push(wordId);
    } else if (progress.status === 'red') {
      redWords.push(wordId);
    } else if (progress.status === 'yellow') {
      yellowWords.push(wordId);
    } else if (progress.status === 'green') {
      greenWords.push(wordId);
    }
  }

  // Build batch with priorities
  const batch: number[] = [];

  // 1. Add troubled words (up to 5) - highest priority
  const shuffledTroubled = shuffle(troubledWords);
  batch.push(...shuffledTroubled.slice(0, Math.min(5, shuffledTroubled.length)));

  // 2. Add red words (up to 5)
  const shuffledRed = shuffle(redWords);
  batch.push(...shuffledRed.slice(0, Math.min(5, shuffledRed.length)));

  // 3. Add yellow words (up to 3)
  const shuffledYellow = shuffle(yellowWords);
  batch.push(...shuffledYellow.slice(0, Math.min(3, shuffledYellow.length)));

  // 4. Add green review (0-1, only 30% chance)
  if (Math.random() < 0.3 && greenWords.length > 0) {
    const shuffledGreen = shuffle(greenWords);
    batch.push(shuffledGreen[0]);
  }

  // 5. Fill remaining with new words
  const remaining = batchSize - batch.length;
  if (remaining > 0) {
    const shuffledNew = shuffle(newWords);
    batch.push(...shuffledNew.slice(0, remaining));
  }

  // Shuffle final batch so it's not predictable
  return shuffle(batch);
}

/**
 * Get status counts for a mode
 */
export function getStatusCounts(
  allWordIds: number[],
  progressMap: Map<number, WordModeProgress>
): { green: number; yellow: number; red: number; new: number } {
  let green = 0;
  let yellow = 0;
  let red = 0;
  let newCount = 0;

  for (const wordId of allWordIds) {
    const progress = progressMap.get(wordId);
    if (!progress || progress.status === 'new') {
      newCount++;
    } else if (progress.status === 'green') {
      green++;
    } else if (progress.status === 'yellow') {
      yellow++;
    } else if (progress.status === 'red') {
      red++;
    }
  }

  return { green, yellow, red, new: newCount };
}

/**
 * Determine new status based on current status and score
 * - Green score always upgrades to green
 * - Yellow score: stays at current level or upgrades to yellow
 * - Red score: downgrades to red
 */
export function getNewStatus(currentStatus: WordStatus, score: ScoreColor): WordStatus {
  if (score === 'green') {
    return 'green';
  } else if (score === 'yellow') {
    // Yellow doesn't downgrade from green, but can upgrade from new/red
    if (currentStatus === 'green') {
      return 'green'; // Keep green status on yellow answer
    }
    return 'yellow';
  } else {
    // Red answer
    return 'red';
  }
}
