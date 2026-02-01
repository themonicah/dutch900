import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { speakDutch } from '../lib/audio';
import { saveModeProgress, getModeProgressMap } from '../lib/db';
import { getNewStatus, type WordStatus } from '../lib/batchBuilder';
import { playCorrectSound, playCloseSound, playWrongSound } from '../lib/sounds';
import type { WordModeProgress, Word, Sentence } from '../types';

// Normalize for comparison: lowercase, trim, strip punctuation
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ').trim();
}

// Simple word-level Levenshtein
function levenshtein(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i-1] === a[j-1]
        ? m[i-1][j-1]
        : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
  return m[b.length][a.length];
}

type WordScore = 'green' | 'yellow' | 'red' | 'missing';

interface ScoredWord {
  correct: string;
  typed: string | null;
  score: WordScore;
}

function scoreSentence(userInput: string, correctDutch: string): ScoredWord[] {
  const correctWords = norm(correctDutch).split(' ').filter(w => w);
  const typedWords = norm(userInput).split(' ').filter(w => w);

  // Greedily match each correct word to the best typed word
  const used = new Set<number>();
  return correctWords.map(cw => {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < typedWords.length; i++) {
      if (used.has(i)) continue;
      const d = levenshtein(cw, typedWords[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestDist === 0) {
      used.add(bestIdx);
      return { correct: cw, typed: typedWords[bestIdx], score: 'green' as WordScore };
    }
    if (bestIdx >= 0 && bestDist <= (cw.length <= 3 ? 1 : 2)) {
      used.add(bestIdx);
      return { correct: cw, typed: typedWords[bestIdx], score: 'yellow' as WordScore };
    }
    return { correct: cw, typed: null, score: 'red' as WordScore };
  });
}

interface SentenceItem {
  word: Word;
  sentence: Sentence;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const BATCH_SIZE = 10;

function SentenceReview() {
  const { words } = useStore();
  const [progressMap, setProgressMap] = useState<Map<number, WordModeProgress>>(new Map());
  const [queue, setQueue] = useState<SentenceItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [result, setResult] = useState<ScoredWord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ green: 0, yellow: 0, red: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Build a pool of sentence items
  const sentencePool = useMemo(() => {
    const pool: SentenceItem[] = [];
    for (const word of words) {
      for (const sentence of word.sentences) {
        pool.push({ word, sentence });
      }
    }
    return pool;
  }, [words]);

  // Init batch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const progress = await getModeProgressMap('produce');
      setProgressMap(progress);
      const batch = shuffle(sentencePool).slice(0, BATCH_SIZE);
      setQueue(batch);
      setCurrentIndex(0);
      setSessionStats({ green: 0, yellow: 0, red: 0 });
      setShowCelebration(false);
      setIsLoading(false);
    };
    init();
  }, [sentencePool]);

  // Focus input
  useEffect(() => {
    if (!isLoading && !result && !showCelebration && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isLoading, result, showCelebration]);

  const current = queue[currentIndex] || null;

  const handleSubmit = async () => {
    if (!current || !typedAnswer.trim()) return;

    const scored = scoreSentence(typedAnswer, current.sentence.dutch);
    setResult(scored);

    // Play the Dutch sentence
    speakDutch(current.sentence.dutch);

    // Overall score: if all green → green, if any yellow and no red → yellow, else red
    const greens = scored.filter(w => w.score === 'green').length;
    const total = scored.length;
    const ratio = greens / total;

    let overallScore: 'green' | 'yellow' | 'red';
    if (ratio >= 0.85) overallScore = 'green';
    else if (ratio >= 0.5) overallScore = 'yellow';
    else overallScore = 'red';

    // Sound
    if (overallScore === 'green') playCorrectSound();
    else if (overallScore === 'yellow') playCloseSound();
    else playWrongSound();

    setSessionStats(prev => ({ ...prev, [overallScore]: prev[overallScore] + 1 }));

    // Save progress for the underlying word under 'produce' mode
    const currentProgress = progressMap.get(current.word.id);
    const currentStatus: WordStatus = currentProgress?.status || 'new';
    const newStatus = getNewStatus(currentStatus, overallScore);

    const updated: WordModeProgress = {
      wordId: current.word.id,
      mode: 'produce',
      status: newStatus,
      lastAttempt: new Date().toISOString(),
      attempts: (currentProgress?.attempts || 0) + 1,
      correctCount: (currentProgress?.correctCount || 0) + (overallScore === 'green' ? 1 : 0),
      wrongCount: (currentProgress?.wrongCount || 0) + (overallScore !== 'green' ? 1 : 0),
    };
    await saveModeProgress(updated);

    const newMap = new Map(progressMap);
    newMap.set(current.word.id, updated);
    setProgressMap(newMap);
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTypedAnswer('');
      setResult(null);
    } else {
      setShowCelebration(true);
    }
  };

  const handleKeepGoing = () => {
    const batch = shuffle(sentencePool).slice(0, BATCH_SIZE);
    setQueue(batch);
    setCurrentIndex(0);
    setTypedAnswer('');
    setResult(null);
    setSessionStats({ green: 0, yellow: 0, red: 0 });
    setShowCelebration(false);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCelebration) return;
      if (result && e.key === 'Enter') { e.preventDefault(); handleNext(); return; }
      if (!result && e.key === 'Enter' && !e.shiftKey && typedAnswer.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, typedAnswer, showCelebration]);

  if (isLoading || !current) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-duo-green" />
      </div>
    );
  }

  if (showCelebration) {
    const total = sessionStats.green + sessionStats.yellow + sessionStats.red;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Batch complete!</h2>
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{sessionStats.green}</p>
            <p className="text-xs text-gray-500">Perfect</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{sessionStats.yellow}</p>
            <p className="text-xs text-gray-500">Close</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{sessionStats.red}</p>
            <p className="text-xs text-gray-500">Missed</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {total > 0 ? Math.round((sessionStats.green / total) * 100) : 0}% accuracy
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleKeepGoing}
            className="px-6 py-3 bg-duo-green text-white font-bold rounded-xl shadow-md active:scale-[0.98]"
          >
            Keep going
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {queue.length}
        </span>
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-duo-green transition-all"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Prompt: English sentence */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">Translate to Dutch</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {current.sentence.english}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          Key word: <span className="font-medium text-gray-600 dark:text-gray-300">{current.word.dutch}</span> ({current.word.english})
        </p>
      </div>

      {/* Input / Result */}
      <div className="w-full max-w-md mx-auto flex-1">
        {result ? (
          <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {/* Word-by-word scoring */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {result.map((w, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    w.score === 'green'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : w.score === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {w.correct}
                  {w.score === 'yellow' && w.typed && (
                    <span className="text-xs opacity-60 ml-1">({w.typed})</span>
                  )}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
              <span className="text-gray-400">You typed:</span> {typedAnswer}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
              {current.sentence.dutch}
            </p>

            <button
              onClick={handleNext}
              className="w-full mt-4 py-3 bg-duo-green text-white font-bold rounded-xl shadow-md active:scale-[0.98]"
            >
              Next →
            </button>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={inputRef}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type the Dutch sentence..."
              rows={2}
              className="w-full py-3 px-4 text-lg rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-duo-green transition-all resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!typedAnswer.trim()}
              className="mt-2 w-full py-3 bg-duo-green text-white font-bold rounded-xl shadow-md disabled:opacity-30 active:scale-[0.98] transition-all"
            >
              Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SentenceReview;
