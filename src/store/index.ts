import { create } from 'zustand';
import type { CardProgress, UserStats, UserSettings, Word, ReviewMode } from '../types';
import {
  db,
  defaultSettings,
  createDefaultStats,
  saveProgress,
  saveStats,
  saveSettings,
} from '../lib/db';
import { createInitialProgress } from '../lib/sm2';
import words from '../data/words.json';

// Cast imported words to Word[]
const wordList = words as Word[];

// Stage counts - tracks how words are progressing through stages
interface StageCounts {
  notStarted: number;     // Words not yet in any stage
  inReading: number;      // Words in reading/qualifying stage
  inListening: number;    // Words in listening/pit radio stage
  inProduction: number;   // Words in production/victory lap stage
  fullyMastered: number;  // Words that completed all 3 stages
}

interface AppState {
  // Data
  words: Word[];
  progress: Map<number, CardProgress>;
  stats: UserStats;
  settings: UserSettings;
  isLoaded: boolean;

  // Review session state
  currentMode: ReviewMode;
  currentQueue: number[]; // Word IDs in review order
  currentIndex: number;

  // Actions
  loadData: () => Promise<void>;
  getWord: (id: number) => Word | undefined;
  getProgress: (wordId: number) => CardProgress | undefined;
  getStageCounts: () => StageCounts;

  // Review actions
  startReview: (mode: ReviewMode) => Promise<void>;
  recordReview: (wordId: number, quality: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  nextCard: () => void;
  getCurrentCard: () => { word: Word; progress: CardProgress } | null;

  // Learning actions
  learnNewCards: (count: number) => Promise<number[]>;

  // Stats actions
  updateStreak: () => Promise<void>;

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  words: wordList,
  progress: new Map(),
  stats: createDefaultStats(),
  settings: defaultSettings,
  isLoaded: false,

  currentMode: 'reading',
  currentQueue: [],
  currentIndex: 0,

  // Load data from IndexedDB
  loadData: async () => {
    try {
      // Load all progress
      const allProgress = await db.progress.toArray();
      const progressMap = new Map<number, CardProgress>();

      // Migrate old data: if word has correct answers in a stage, advance it
      for (const p of allProgress) {
        // If has correct reading reviews but listening not unlocked, advance to listening
        if (p.reading.correctCount > 0 && !p.listening.unlocked) {
          p.listening.unlocked = true;
          p.listening.status = 'learning';
          p.listening.dueDate = new Date().toISOString();
          await saveProgress(p);
        }
        // If has correct listening reviews but production not unlocked, advance to production
        if (p.listening.correctCount > 0 && !p.production.unlocked) {
          p.production.unlocked = true;
          p.production.status = 'learning';
          p.production.dueDate = new Date().toISOString();
          await saveProgress(p);
        }
        progressMap.set(p.wordId, p);
      }

      // Load stats
      const storedStats = await db.stats.get(1);
      const stats = storedStats || createDefaultStats();

      // Load settings
      const storedSettings = await db.settings.get(1);
      const settings = storedSettings || defaultSettings;

      set({
        progress: progressMap,
        stats,
        settings,
        isLoaded: true,
      });

      // Update streak on load
      await get().updateStreak();
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoaded: true });
    }
  },

  getWord: (id) => {
    return get().words.find((w) => w.id === id);
  },

  getProgress: (wordId) => {
    return get().progress.get(wordId);
  },

  // Calculate stage counts - how words are distributed across stages
  getStageCounts: () => {
    const { words, progress } = get();

    let notStarted = 0;    // Not yet added to any stage
    let inReading = 0;     // In qualifying (listening not unlocked)
    let inListening = 0;   // In pit radio (production not unlocked)
    let inProduction = 0;  // In victory lap (not yet mastered)
    let fullyMastered = 0; // Completed all 3 stages

    // Count words not started
    notStarted = words.length - progress.size;

    // Count words in each stage
    progress.forEach((card) => {
      if (card.production.status === 'mastered') {
        fullyMastered++;
      } else if (card.production.unlocked) {
        inProduction++;
      } else if (card.listening.unlocked) {
        inListening++;
      } else {
        inReading++;
      }
    });

    return {
      notStarted,
      inReading,
      inListening,
      inProduction,
      fullyMastered,
    };
  },

  // Start a review session
  // For Qualifying: auto-fills to 10 with new words if needed
  // For Pit Radio/Victory Lap: takes all words in that stage
  startReview: async (mode) => {
    const { progress, learnNewCards } = get();
    const BATCH_SIZE = 10;

    // Get all cards currently in this stage
    const stageCards: number[] = [];

    progress.forEach((card, wordId) => {
      if (mode === 'reading') {
        // Cards in reading stage = started but listening not unlocked
        if (!card.listening.unlocked) {
          stageCards.push(wordId);
        }
      } else if (mode === 'listening') {
        // Cards in listening stage = listening unlocked but production not unlocked
        if (card.listening.unlocked && !card.production.unlocked) {
          stageCards.push(wordId);
        }
      } else if (mode === 'production') {
        // Cards in production stage = production unlocked but not mastered
        if (card.production.unlocked && card.production.status !== 'mastered') {
          stageCards.push(wordId);
        }
      }
    });

    // For Qualifying (reading mode): auto-fill to batch size with new words
    if (mode === 'reading') {
      const needed = BATCH_SIZE - stageCards.length;
      if (needed > 0) {
        // Add new words to reach batch size
        const newWordIds = await learnNewCards(needed);
        stageCards.push(...newWordIds);
      }
    }

    // Shuffle for variety
    for (let i = stageCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [stageCards[i], stageCards[j]] = [stageCards[j], stageCards[i]];
    }

    // All modes: limit to 10 words per lesson (like Duolingo)
    const queue = stageCards.slice(0, BATCH_SIZE);

    set({
      currentMode: mode,
      currentQueue: queue,
      currentIndex: 0,
    });
  },

  // Record a review result - Simple progression: correct = advance, wrong = go back
  recordReview: async (wordId, quality) => {
    const { progress, currentMode, stats } = get();
    let card = progress.get(wordId);

    if (!card) {
      console.error('Card not found:', wordId);
      return;
    }

    // Create a copy to modify
    card = { ...card };

    const isCorrect = quality >= 3; // 3+ is considered correct
    const today = new Date().toISOString();

    // Progression logic - words only move UP, never back
    if (currentMode === 'reading') {
      card.reading.totalReviews++;
      if (isCorrect) {
        card.reading.correctCount++;
        // Correct in reading = advance to listening
        card.listening = {
          ...card.listening,
          unlocked: true,
          status: 'learning',
          dueDate: today,
        };
      }
      // Wrong = stay in current stage
    } else if (currentMode === 'listening') {
      card.listening.totalReviews++;
      if (isCorrect) {
        card.listening.correctCount++;
        // Correct in listening = advance to production
        card.production = {
          ...card.production,
          unlocked: true,
          status: 'learning',
          dueDate: today,
        };
      }
      // Wrong = stay in current stage (no demotion)
    } else {
      // Production mode
      card.production.totalReviews++;
      if (isCorrect) {
        card.production.correctCount++;
        // Correct in production = MASTERED! 🏆
        card.production.status = 'mastered';
      }
      // Wrong = stay in current stage (no demotion)
    }

    card.lastReviewDate = today;

    // Save to DB
    await saveProgress(card);

    // Update state
    const newProgress = new Map(progress);
    newProgress.set(wordId, card);

    // Update stats
    const newStats = { ...stats };
    newStats.totalReviewsCompleted++;
    // Count words as mastered when they reach mastered in production
    newStats.totalWordsMastered = Array.from(newProgress.values()).filter(
      (p) => p.production.status === 'mastered'
    ).length;
    await saveStats(newStats);

    set({ progress: newProgress, stats: newStats });
  },

  // Move to next card in queue
  nextCard: () => {
    const { currentIndex, currentQueue } = get();
    if (currentIndex < currentQueue.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  // Get current card for review
  getCurrentCard: () => {
    const { currentQueue, currentIndex, words, progress } = get();
    if (currentQueue.length === 0 || currentIndex >= currentQueue.length) {
      return null;
    }

    const wordId = currentQueue[currentIndex];
    const word = words.find((w) => w.id === wordId);
    const cardProgress = progress.get(wordId);

    if (!word || !cardProgress) {
      return null;
    }

    return { word, progress: cardProgress };
  },

  // Learn new cards - add to Qualifying stage
  learnNewCards: async (count) => {
    const { words, progress, stats } = get();

    // Find words that haven't been started yet
    const newWordIds = words
      .filter((w) => !progress.has(w.id))
      .slice(0, count)
      .map((w) => w.id);

    const today = new Date().toISOString();
    const newProgress = new Map(progress);

    for (const wordId of newWordIds) {
      const initial = createInitialProgress();
      const card: CardProgress = {
        wordId,
        firstSeenDate: today,
        lastReviewDate: null,
        reading: {
          ...initial,
          status: 'learning',
        },
        listening: {
          ...initial,
          status: 'locked',
          unlocked: false,
        },
        production: {
          ...initial,
          status: 'locked',
          unlocked: false,
        },
      };

      await saveProgress(card);
      newProgress.set(wordId, card);
    }

    // Update stats
    const newStats = {
      ...stats,
      totalWordsLearned: newProgress.size,
    };
    await saveStats(newStats);

    set({ progress: newProgress, stats: newStats });

    return newWordIds;
  },

  // Update streak based on last activity
  updateStreak: async () => {
    const { stats } = get();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(stats.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = stats.currentStreak;

    if (diffDays === 0) {
      // Same day - no change
    } else if (diffDays === 1) {
      // Consecutive day - increment
      newStreak = stats.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 0;
    }

    const newStats = {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastActivityDate: today.toISOString(),
    };

    await saveStats(newStats);
    set({ stats: newStats });
  },

  // Update settings
  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    set({ settings: updated });
  },
}));
