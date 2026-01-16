import Dexie, { type EntityTable } from 'dexie';
import type { CardProgress, UserStats, UserSettings, ChapterWordProgress, WordModeProgress, PracticeMode } from '../types';

// Define the database schema
interface Dutch900DB {
  progress: EntityTable<CardProgress, 'wordId'>;
  stats: EntityTable<UserStats & { id: number }, 'id'>;
  settings: EntityTable<UserSettings & { id: number }, 'id'>;
  chapterProgress: EntityTable<ChapterWordProgress, 'wordId'>;
  modeProgress: EntityTable<WordModeProgress, 'wordId'>;
}

// Create the database
const db = new Dexie('dutch900') as Dexie & Dutch900DB;

// Define schema - version 1
db.version(1).stores({
  progress: 'wordId, reading.dueDate, reading.status, listening.dueDate, listening.status',
  stats: 'id',
  settings: 'id',
});

// Version 2 - Add production mode tracking
db.version(2).stores({
  progress: 'wordId, reading.dueDate, reading.status, listening.dueDate, listening.status, production.dueDate, production.status',
  stats: 'id',
  settings: 'id',
}).upgrade(tx => {
  // Migrate existing progress records to include production field
  return tx.table('progress').toCollection().modify(card => {
    if (!card.production) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      card.production = {
        easeFactor: 2.5,
        interval: 0,
        dueDate: today.toISOString(),
        repetitions: 0,
        status: 'locked',
        totalReviews: 0,
        correctCount: 0,
        unlocked: false,
      };
    }
  });
});

// Version 3 - Add wave system setting
db.version(3).stores({
  progress: 'wordId, reading.dueDate, reading.status, listening.dueDate, listening.status, production.dueDate, production.status',
  stats: 'id',
  settings: 'id',
}).upgrade(tx => {
  // Add waveSize to existing settings
  return tx.table('settings').toCollection().modify(settings => {
    if (settings.waveSize === undefined) {
      settings.waveSize = 20;
    }
  });
});

// Version 4 - Add chapter progress table
db.version(4).stores({
  progress: 'wordId, reading.dueDate, reading.status, listening.dueDate, listening.status, production.dueDate, production.status',
  stats: 'id',
  settings: 'id',
  chapterProgress: '[chapterId+wordId], chapterId, stage',
});

// Version 5 - Add mode progress table for new independent practice modes
db.version(5).stores({
  progress: 'wordId, reading.dueDate, reading.status, listening.dueDate, listening.status, production.dueDate, production.status',
  stats: 'id',
  settings: 'id',
  chapterProgress: '[chapterId+wordId], chapterId, stage',
  modeProgress: '[wordId+mode], wordId, mode, status',
});

export { db };

// Default settings
export const defaultSettings: UserSettings = {
  newCardsPerDay: 10,
  reviewsPerSession: 50,
  autoPlayAudio: true,
  theme: 'system',
  dailyGoal: 20,
  waveSize: 20, // Progress 20 words at a time through all stages
};

// Default stats
export function createDefaultStats(): UserStats {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString(),
    totalWordsLearned: 0,
    totalWordsMastered: 0,
    totalReviewsCompleted: 0,
    dailyHistory: [],
  };
}

// Helper functions
export async function getProgress(wordId: number): Promise<CardProgress | undefined> {
  return db.progress.get(wordId);
}

export async function saveProgress(progress: CardProgress): Promise<void> {
  await db.progress.put(progress);
}

export async function getAllProgress(): Promise<CardProgress[]> {
  return db.progress.toArray();
}

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.get(1);
  return settings || defaultSettings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await db.settings.put({ ...settings, id: 1 });
}

export async function getStats(): Promise<UserStats> {
  const stats = await db.stats.get(1);
  return stats || createDefaultStats();
}

export async function saveStats(stats: UserStats): Promise<void> {
  await db.stats.put({ ...stats, id: 1 });
}

// Get cards due for review
export async function getDueCards(mode: 'reading' | 'listening' | 'production'): Promise<CardProgress[]> {
  const today = new Date().toISOString();
  const allProgress = await db.progress.toArray();

  return allProgress.filter((card) => {
    if (mode === 'reading') {
      return card.reading.dueDate <= today && card.reading.status !== 'mastered';
    } else if (mode === 'listening') {
      return (
        card.listening.unlocked &&
        card.listening.dueDate <= today &&
        card.listening.status !== 'mastered'
      );
    } else {
      return (
        card.production?.unlocked &&
        card.production.dueDate <= today &&
        card.production.status !== 'mastered'
      );
    }
  });
}

// Get new cards (not yet started)
export async function getNewCardCount(): Promise<number> {
  const allProgress = await db.progress.toArray();
  return allProgress.filter((card) => card.reading.status === 'new').length;
}

// Chapter progress helpers
export async function getChapterWordProgress(chapterId: number, wordId: number): Promise<ChapterWordProgress | undefined> {
  return db.chapterProgress.get([chapterId, wordId]);
}

export async function saveChapterWordProgress(progress: ChapterWordProgress): Promise<void> {
  await db.chapterProgress.put(progress);
}

export async function getChapterProgress(chapterId: number): Promise<ChapterWordProgress[]> {
  return db.chapterProgress.where('chapterId').equals(chapterId).toArray();
}

export async function getAllChapterProgress(): Promise<ChapterWordProgress[]> {
  return db.chapterProgress.toArray();
}

// Get words that were wrong across all chapters (for Rematch)
export async function getRematchWords(): Promise<ChapterWordProgress[]> {
  const all = await db.chapterProgress.toArray();
  return all.filter(p => p.wrongCount > 0 && p.stage !== 'mastered');
}

// Mode progress helpers (new independent practice modes)
export async function getModeProgress(wordId: number, mode: PracticeMode): Promise<WordModeProgress | undefined> {
  return db.modeProgress.get([wordId, mode]);
}

export async function saveModeProgress(progress: WordModeProgress): Promise<void> {
  await db.modeProgress.put(progress);
}

export async function getAllModeProgress(mode: PracticeMode): Promise<WordModeProgress[]> {
  return db.modeProgress.where('mode').equals(mode).toArray();
}

export async function getModeProgressMap(mode: PracticeMode): Promise<Map<number, WordModeProgress>> {
  const all = await getAllModeProgress(mode);
  const map = new Map<number, WordModeProgress>();
  for (const p of all) {
    map.set(p.wordId, p);
  }
  return map;
}

export async function getModeStats(mode: PracticeMode, totalWords: number): Promise<{ green: number; yellow: number; red: number; new: number }> {
  const all = await getAllModeProgress(mode);
  let green = 0;
  let yellow = 0;
  let red = 0;

  for (const p of all) {
    if (p.status === 'green') green++;
    else if (p.status === 'yellow') yellow++;
    else if (p.status === 'red') red++;
  }

  return {
    green,
    yellow,
    red,
    new: totalWords - all.length,
  };
}

// Export all data for backup
export async function exportAllData(): Promise<string> {
  const [learnProgress, listenProgress, translateProgress] = await Promise.all([
    getAllModeProgress('learn'),
    getAllModeProgress('listen'),
    getAllModeProgress('produce'),
  ]);

  const data = {
    exportDate: new Date().toISOString(),
    learn: learnProgress,
    listen: listenProgress,
    translate: translateProgress,
  };

  return JSON.stringify(data, null, 2);
}

// Import data from backup
export async function importAllData(jsonString: string): Promise<{ imported: number }> {
  const data = JSON.parse(jsonString);
  let imported = 0;

  // Import learn progress
  if (data.learn && Array.isArray(data.learn)) {
    for (const p of data.learn) {
      await saveModeProgress(p);
      imported++;
    }
  }

  // Import listen progress
  if (data.listen && Array.isArray(data.listen)) {
    for (const p of data.listen) {
      await saveModeProgress(p);
      imported++;
    }
  }

  // Import translate/produce progress
  if (data.translate && Array.isArray(data.translate)) {
    for (const p of data.translate) {
      await saveModeProgress(p);
      imported++;
    }
  }

  return { imported };
}
