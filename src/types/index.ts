// Word data types
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'article'
  | 'numeral'
  | 'interjection'
  | 'other';

export interface Sentence {
  dutch: string;
  english: string;
}

export interface Word {
  id: number;
  rank: number;
  dutch: string;
  english: string;
  partOfSpeech: PartOfSpeech;
  gender?: 'de' | 'het';
  sentences: Sentence[];
}

// Card progress status
export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';
export type LockedStatus = 'locked' | 'new' | 'learning' | 'review' | 'mastered';

// Per-mode progress tracking
export interface ModeProgress {
  easeFactor: number;
  interval: number;
  dueDate: string; // ISO date string
  repetitions: number;
  status: CardStatus | LockedStatus;
  totalReviews: number;
  correctCount: number;
}

// Card progress with separate tracking per mode
export interface CardProgress {
  wordId: number;
  firstSeenDate: string;
  lastReviewDate: string | null;

  // Reading mode (Level 1) - Dutch → English
  reading: ModeProgress & { status: CardStatus };

  // Listening mode (Level 2) - unlocks after reading.repetitions >= 3
  listening: ModeProgress & {
    status: LockedStatus;
    unlocked: boolean;
  };

  // Production mode (Level 3) - English → Dutch recall + audio
  // Unlocks after listening.repetitions >= 3
  production: ModeProgress & {
    status: LockedStatus;
    unlocked: boolean;
  };
}

// User statistics
export interface DailyRecord {
  date: string;
  reviewsCompleted: number;
  newCardsLearned: number;
  accuracy: number;
  studyMinutes: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalWordsLearned: number;
  totalWordsMastered: number;
  totalReviewsCompleted: number;
  dailyHistory: DailyRecord[];
}

// User settings
export interface UserSettings {
  newCardsPerDay: number;
  reviewsPerSession: number;
  autoPlayAudio: boolean;
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  // Wave system - words progress through stages in batches
  waveSize: number; // Max words in "active" state before needing to progress them
}

// SM-2 Algorithm types
export interface SM2Input {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  dueDate: Date;
}

// Review mode - progressive difficulty levels (legacy)
// Reading (Dutch → English) → Listening (Audio → Dutch) → Production (English → Dutch)
export type ReviewMode = 'reading' | 'listening' | 'production';

// New practice mode type - three independent modes
export type PracticeMode = 'learn' | 'listen' | 'produce';

// Word status for the new scoring system
export type WordScoreStatus = 'new' | 'green' | 'yellow' | 'red';

// Per-word, per-mode progress tracking (new simplified model)
export interface WordModeProgress {
  wordId: number;
  mode: PracticeMode;
  status: WordScoreStatus;
  lastAttempt: string | null; // ISO date
  attempts: number;
}

// Mode stats summary
export interface ModeStats {
  green: number;
  yellow: number;
  red: number;
  new: number;
}

// Chapter/Track progress - simpler than base 900
export interface ChapterWordProgress {
  chapterId: number;
  wordId: number;
  stage: 'qualifying' | 'pitradio' | 'victorylap' | 'mastered';
  correctCount: number;
  wrongCount: number;
  lastSeen: string;
}

export interface ChapterProgress {
  chapterId: number;
  wordsStarted: number;
  wordsMastered: number;
  totalReviews: number;
  lastPracticed: string | null;
}
