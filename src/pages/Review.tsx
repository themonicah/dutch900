import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { speakDutch } from '../lib/audio';
import { scoreAnswer, getScoreMessage, type ScoreColor } from '../lib/fuzzyMatch';
import { buildSmartBatch, getNewStatus, type WordStatus } from '../lib/batchBuilder';
import { getModeProgressMap, saveModeProgress, getTroubledWord, saveTroubledWord, removeTroubledWord, getAllTroubledWords } from '../lib/db';
import { playCorrectSound, playCloseSound, playWrongSound, playCelebrationSound, playStreakSound } from '../lib/sounds';
import Confetti from '../components/Confetti';
import type { PracticeMode, WordModeProgress } from '../types';

const BATCH_SIZE = 20;

function Review() {
  const { mode: modeParam } = useParams<{ mode?: string }>();
  const { words, settings } = useStore();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('cat');

  const categoryNames: Record<string, string> = {
    verb: 'Verbs', noun: 'Other Nouns', adjective: 'Adjectives', pronoun: 'Pronouns',
    adverb: 'Adverbs', preposition: 'Prepositions', numeral: 'Numbers',
    conjunction: 'Connectors', interjection: 'Expressions',
    emotions: 'Emotions', colors: 'Colors', size: 'Size',
    people: 'People', body: 'Body', food: 'Food', home: 'Home',
    clothing: 'Clothing', time: 'Time', nature: 'Nature',
    transport: 'Transport', places: 'Places',
  };

  // Determine practice mode from URL
  const mode: PracticeMode = modeParam === 'listen'
    ? 'listen'
    : modeParam === 'produce'
      ? 'produce'
      : 'learn';

  const [isLoading, setIsLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Map<number, WordModeProgress>>(new Map());
  const [queue, setQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enterAnimation, setEnterAnimation] = useState<'entering' | 'visible'>('visible');

  // Input state
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState<{ score: ScoreColor; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Session stats
  const [sessionStats, setSessionStats] = useState({ green: 0, yellow: 0, red: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [consecutiveGreens, setConsecutiveGreens] = useState(0);

  // Check if English and Dutch words are very similar (cognates like "weekend")
  const areSimilarWords = (dutch: string, english: string): boolean => {
    const d = dutch.toLowerCase().trim();
    const e = english.toLowerCase().trim();
    if (d === e) return true;
    if (d.includes(e) || e.includes(d)) return true;
    // Very close (1 character difference for short words)
    if (Math.abs(d.length - e.length) <= 1 && d.length <= 8) {
      let diff = 0;
      const longer = d.length > e.length ? d : e;
      const shorter = d.length > e.length ? e : d;
      for (let i = 0; i < shorter.length; i++) {
        if (shorter[i] !== longer[i]) diff++;
      }
      diff += longer.length - shorter.length;
      if (diff <= 1) return true;
    }
    return false;
  };

  // Load progress and build batch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const filteredWords = categoryFilter
        ? words.filter(w => w.category === categoryFilter)
        : words;
      const allWordIds = filteredWords.map(w => w.id);
      const progress = await getModeProgressMap(mode);
      setProgressMap(progress);

      // Get troubled words for this mode
      const troubled = await getAllTroubledWords(mode);
      const troubledIds = new Set(troubled.map(t => t.wordId));

      // Find green cognates to skip - they're too easy
      const skipIds = new Set<number>();
      for (const word of filteredWords) {
        const wordProgress = progress.get(word.id);
        if (wordProgress?.status === 'green' && areSimilarWords(word.dutch, word.english)) {
          skipIds.add(word.id);
        }
      }

      const batch = buildSmartBatch(allWordIds, progress, BATCH_SIZE, troubledIds, skipIds);
      setQueue(batch);
      setCurrentIndex(0);
      setSessionStats({ green: 0, yellow: 0, red: 0 });
      setConsecutiveGreens(0);
      setShowCelebration(false);
      setIsLoading(false);
    };
    init();
  }, [mode, words, categoryFilter]);

  // Reset state when moving to next card
  useEffect(() => {
    if (!isLoading) {
      setEnterAnimation('entering');
      setTypedAnswer('');
      setShowResult(null);
      const timer = setTimeout(() => setEnterAnimation('visible'), 50);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isLoading]);

  // Focus input when card appears
  useEffect(() => {
    if (!isLoading && !showResult && !showCelebration && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isLoading, showResult, showCelebration]);

  // Auto-play audio for learn/listen modes
  useEffect(() => {
    if (enterAnimation === 'visible' && !isLoading && !showCelebration) {
      const wordId = queue[currentIndex];
      const word = words.find(w => w.id === wordId);
      if (word && (mode === 'learn' || mode === 'listen')) {
        speakDutch(word.dutch);
      }
    }
  }, [currentIndex, enterAnimation, isLoading, showCelebration]);

  const currentWord = useMemo(() => {
    if (queue.length === 0 || currentIndex >= queue.length) return null;
    return words.find(w => w.id === queue[currentIndex]) || null;
  }, [queue, currentIndex, words]);

  // Get expected answer based on mode
  const getExpectedAnswer = (): string => {
    if (!currentWord) return '';
    switch (mode) {
      case 'learn':
        return currentWord.english;
      case 'listen':
        return currentWord.dutch;
      case 'produce':
        return currentWord.dutch;
    }
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!currentWord || !typedAnswer.trim()) return;

    const expected = getExpectedAnswer();
    const score = scoreAnswer(typedAnswer, expected);
    const message = getScoreMessage(score);

    setShowResult({ score, message });

    // Play audio on submit
    speakDutch(currentWord.dutch);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      [score]: prev[score] + 1
    }));

    // Play sound based on score
    if (score === 'green') {
      playCorrectSound();
    } else if (score === 'yellow') {
      playCloseSound();
    } else {
      playWrongSound();
    }

    // Track consecutive greens
    if (score === 'green') {
      const newStreak = consecutiveGreens + 1;
      setConsecutiveGreens(newStreak);
      // Play streak sound at milestones
      if (newStreak === 5 || newStreak === 10 || newStreak === 15) {
        setTimeout(playStreakSound, 200);
      }
    } else {
      setConsecutiveGreens(0);
    }

    // Update progress in database
    const currentProgress = progressMap.get(currentWord.id);
    const currentStatus: WordStatus = currentProgress?.status || 'new';
    const newStatus = getNewStatus(currentStatus, score);

    const updatedProgress: WordModeProgress = {
      wordId: currentWord.id,
      mode,
      status: newStatus,
      lastAttempt: new Date().toISOString(),
      attempts: (currentProgress?.attempts || 0) + 1,
      correctCount: (currentProgress?.correctCount || 0) + (score === 'green' ? 1 : 0),
      wrongCount: (currentProgress?.wrongCount || 0) + (score !== 'green' ? 1 : 0),
    };

    await saveModeProgress(updatedProgress);

    // Handle troubled words
    const existingTroubled = await getTroubledWord(currentWord.id, mode);

    if (score === 'green' && existingTroubled) {
      // Correct answer on troubled word - increment count or remove
      const newCorrectCount = existingTroubled.reviewCorrectCount + 1;
      if (newCorrectCount >= 2) {
        // Mastered! Remove from troubled words
        await removeTroubledWord(currentWord.id, mode);
      } else {
        await saveTroubledWord({
          ...existingTroubled,
          reviewCorrectCount: newCorrectCount,
        });
      }
    } else if (updatedProgress.attempts >= 3 && score !== 'green') {
      // Add to troubled words if 3+ attempts and not getting it right
      if (!existingTroubled) {
        await saveTroubledWord({
          wordId: currentWord.id,
          mode,
          wrongAttempts: updatedProgress.attempts,
          reviewCorrectCount: 0,
          addedDate: new Date().toISOString(),
        });
      }
    }

    // Update local state
    const newProgressMap = new Map(progressMap);
    newProgressMap.set(currentWord.id, updatedProgress);
    setProgressMap(newProgressMap);
  };

  // Move to next card or show celebration
  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Batch complete!
      setShowCelebration(true);
    }
  };

  // Continue with another batch
  const handleKeepGoing = async () => {
    const filteredWords = categoryFilter
      ? words.filter(w => w.category === categoryFilter)
      : words;
    const allWordIds = filteredWords.map(w => w.id);

    // Get fresh troubled words
    const troubled = await getAllTroubledWords(mode);
    const troubledIds = new Set(troubled.map(t => t.wordId));

    // Find green cognates to skip
    const skipIds = new Set<number>();
    for (const word of filteredWords) {
      const wordProgress = progressMap.get(word.id);
      if (wordProgress?.status === 'green' && areSimilarWords(word.dutch, word.english)) {
        skipIds.add(word.id);
      }
    }

    const newBatch = buildSmartBatch(allWordIds, progressMap, BATCH_SIZE, troubledIds, skipIds);
    setQueue(newBatch);
    setCurrentIndex(0);
    setSessionStats({ green: 0, yellow: 0, red: 0 });
    setConsecutiveGreens(0);
    setShowCelebration(false);
  };

  // Replay audio (for listen mode)
  const handleReplayAudio = () => {
    if (currentWord) {
      speakDutch(currentWord.dutch);
    }
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCelebration) return;

      if (showResult && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
        return;
      }

      if (!showResult && e.key === 'Enter' && typedAnswer.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, typedAnswer, showCelebration]);

  // Mode-specific styling
  const modeStyles = {
    learn: { color: '#1CB0F6', label: 'Learn', icon: '📖' },
    listen: { color: '#CE82FF', label: 'Listen', icon: '🔊' },
    produce: { color: '#58CC02', label: 'Translate', icon: '🎯' },
  };
  const style = modeStyles[mode];

  // Score-specific styling
  const scoreStyles = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-400' },
  };

  // Play celebration sound when celebration starts
  useEffect(() => {
    if (showCelebration) {
      playCelebrationSound();
    }
  }, [showCelebration]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: style.color }}></div>
      </div>
    );
  }

  // Celebration screen after 20 cards
  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Confetti />
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You've completed {BATCH_SIZE} words!
        </h2>

        {/* Score breakdown */}
        <div className="flex gap-6 my-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-green-500">{sessionStats.green}</span>
            <p className="text-xs text-gray-500 mt-1">correct</p>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-yellow-500">{sessionStats.yellow}</span>
            <p className="text-xs text-gray-500 mt-1">close</p>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-red-500">{sessionStats.red}</span>
            <p className="text-xs text-gray-500 mt-1">missed</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={handleKeepGoing}
            className="flex-1 py-4 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all"
            style={{ backgroundColor: style.color }}
          >
            Keep Going
          </button>
          <Link
            to="/"
            className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-center"
          >
            Take a Break
          </Link>
        </div>
      </div>
    );
  }

  if (queue.length === 0 || !currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No words available
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Try another practice mode
        </p>
        <Link
          to="/"
          className="px-6 py-3 text-white rounded-xl font-bold transition-all"
          style={{ backgroundColor: style.color }}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: style.color }}>{style.icon} {style.label}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {queue.length}
          </span>
        </div>

        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%`, backgroundColor: style.color }}
          />
        </div>
      </div>

      {/* Category header */}
      {categoryFilter && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {categoryNames[categoryFilter] || categoryFilter}
          </h2>
          <div className="flex gap-2">
            {(['learn', 'listen', 'produce'] as const).map(m => (
              <Link
                key={m}
                to={`/review/${m}?cat=${categoryFilter}`}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  m === mode
                    ? 'bg-duo-green text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {m === 'learn' ? 'Learn' : m === 'listen' ? 'Listen' : 'Translate'}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Streak indicator */}
      {consecutiveGreens >= 3 && (
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-green-500">
            🔥 {consecutiveGreens} in a row!
          </span>
        </div>
      )}

      {/* Card */}
      <div
        className="flex-1 flex flex-col items-center justify-center mb-6"
        style={{
          transform: enterAnimation === 'entering' ? 'translateY(100px)' : 'translateY(0)',
          opacity: enterAnimation === 'entering' ? 0 : 1,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
        }}
      >
        {/* Prompt Card */}
        <div
          onClick={mode === 'listen' ? handleReplayAudio : undefined}
          className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center ${mode === 'listen' ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''} transition-all`}
          style={{ minHeight: '160px' }}
        >
          {mode === 'learn' && (
            <>
              <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{currentWord.dutch}</p>
              {currentWord.gender && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{currentWord.gender}</p>
              )}
              <button
                onClick={handleReplayAudio}
                className="mt-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke={style.color} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </>
          )}

          {mode === 'listen' && (
            <svg className="w-16 h-16" fill="none" stroke={style.color} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}

          {mode === 'produce' && (
            <>
              <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{currentWord.english}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{currentWord.partOfSpeech}</p>
            </>
          )}
        </div>

        {/* Input / Result area */}
        <div className="w-full max-w-md mt-4">
          {showResult ? (
            <div
              className={`rounded-xl p-4 ${scoreStyles[showResult.score].bg} border ${scoreStyles[showResult.score].border}`}
            >
              <div className="text-center">
                <p className={`text-lg font-bold ${scoreStyles[showResult.score].text}`}>
                  {showResult.message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  <span className="text-gray-500">You typed:</span> {typedAnswer}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500">Correct:</span> {getExpectedAnswer()}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-4 py-3 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: style.color }}
              >
                Next →
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder={
                  mode === 'learn'
                    ? 'Type English translation...'
                    : mode === 'listen'
                      ? 'Type what you hear...'
                      : 'Type Dutch word...'
                }
                className="w-full py-4 px-4 pr-14 text-lg rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 transition-all"
                style={{
                  '--tw-ring-color': style.color,
                } as React.CSSProperties}
              />
              <button
                onClick={handleSubmit}
                disabled={!typedAnswer.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all text-white font-bold"
                style={{ backgroundColor: typedAnswer.trim() ? style.color : '#d1d5db' }}
              >
                →
              </button>
            </div>
          )}

          {/* Hints shown after reveal */}
          {showResult && settings.showMnemonics && (
            <div className="mt-3 px-4 py-2 space-y-3">
              {/* Example sentence - cycles through available sentences */}
              {currentWord.sentences && currentWord.sentences.length > 0 && (() => {
                const sentenceIndex = (currentWord.id + (progressMap.get(currentWord.id)?.attempts || 0)) % currentWord.sentences.length;
                const sentence = currentWord.sentences[sentenceIndex];
                return (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic">
                      "{sentence.dutch}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {sentence.english}
                    </p>
                  </div>
                );
              })()}

              {/* Etymology/word note */}
              {currentWord.note && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  {currentWord.note}
                </p>
              )}

              {/* Memory trick */}
              {currentWord.mnemonic && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {currentWord.mnemonic}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Review;
