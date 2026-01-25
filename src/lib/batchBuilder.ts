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
 * 4. Green review (0-1, 30% chance) - occasional review to prevent forgetting
 * 5. New words - fill remaining slots
 *
 * @param allWordIds - All available word IDs
 * @param progressMap - Map of wordId -> WordModeProgress
 * @param batchSize - Number of words in batch (default 20)
 * @param troubledWordIds - Set of word IDs that need extra practice
 * @param skipWordIds - Set of word IDs to skip entirely (e.g., green cognates)
 */
export function buildSmartBatch(
  allWordIds: number[],
  progressMap: Map<number, WordModeProgress>,
  batchSize: number = 20,
  troubledWordIds: Set<number> = new Set(),
  skipWordIds: Set<number> = new Set()
): number[] {
  // Categorize words by status
  const troubledWords: number[] = [];
  const redWords: number[] = [];
  const yellowWords: number[] = [];
  const greenWords: number[] = [];
  const newWords: number[] = [];

  for (const wordId of allWordIds) {
    // Skip words that should be excluded (e.g., mastered cognates)
    if (skipWordIds.has(wordId)) {
      continue;
    }

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
  // Focus: red/yellow (missed words) > a few new > max 2 green refreshers
  const batch: number[] = [];

  // Shuffle all categories
  const shuffledTroubled = shuffle(troubledWords);
  const shuffledRed = shuffle(redWords);
  const shuffledYellow = shuffle(yellowWords);
  const shuffledGreen = shuffle(greenWords);
  const shuffledNew = shuffle(newWords);

  // 1. Add troubled words (all of them - highest priority)
  batch.push(...shuffledTroubled);

  // 2. Add red words (fill most of the batch)
  const redToAdd = Math.min(shuffledRed.length, batchSize - batch.length - 5); // Leave room for yellow, new, green
  batch.push(...shuffledRed.slice(0, Math.max(0, redToAdd)));

  // 3. Add yellow words
  const yellowToAdd = Math.min(shuffledYellow.length, batchSize - batch.length - 5); // Leave room for new and green
  batch.push(...shuffledYellow.slice(0, Math.max(0, yellowToAdd)));

  // 4. Add a few new words (max 3-5, don't overwhelm with new until current ones mastered)
  const newToAdd = Math.min(shuffledNew.length, 5, batchSize - batch.length - 2); // Leave room for green refreshers
  batch.push(...shuffledNew.slice(0, Math.max(0, newToAdd)));

  // 5. Add max 2 green words for refresher bonus (cognates already filtered out via skipWordIds)
  const greenToAdd = Math.min(shuffledGreen.length, 2, batchSize - batch.length);
  batch.push(...shuffledGreen.slice(0, Math.max(0, greenToAdd)));

  // 6. If still not full, add more red/yellow/new
  if (batch.length < batchSize) {
    const remaining = batchSize - batch.length;
    const moreRed = shuffledRed.slice(redToAdd);
    const moreYellow = shuffledYellow.slice(yellowToAdd);
    const moreNew = shuffledNew.slice(newToAdd);
    const extras = shuffle([...moreRed, ...moreYellow, ...moreNew]);
    batch.push(...extras.slice(0, remaining));
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
