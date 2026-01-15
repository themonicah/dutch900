import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapter, type ChapterWord } from '../data/chapters';
import { speakDutch } from '../lib/audio';
import { scoreAnswer, getScoreMessage, type ScoreColor } from '../lib/fuzzyMatch';
import { saveModeProgress, getModeProgress } from '../lib/db';
import type { PracticeMode as DBPracticeMode } from '../types';

type PracticeMode = 'learn' | 'listen' | 'produce';

const BATCH_SIZE = 20;

function TrackReview() {
  const { trackId, stage } = useParams<{ trackId: string; stage: string }>();
  const chapterId = parseInt(trackId || '1');

  // Determine practice mode from URL
  const mode: PracticeMode = stage === 'listen'
    ? 'listen'
    : stage === 'produce'
      ? 'produce'
      : 'learn';

  const [isLoading, setIsLoading] = useState(true);
  const [chapterWords, setChapterWords] = useState<ChapterWord[]>([]);
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

  // Load chapter words and build batch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const chapter = getChapter(chapterId);
      if (!chapter) {
        setIsLoading(false);
        return;
      }

      setChapterWords(chapter.words);

      // Shuffle and take up to BATCH_SIZE words
      const shuffled = [...chapter.words]
        .sort(() => Math.random() - 0.5)
        .slice(0, BATCH_SIZE);
      setQueue(shuffled.map(w => w.id));
      setCurrentIndex(0);
      setSessionStats({ green: 0, yellow: 0, red: 0 });
      setConsecutiveGreens(0);
      setShowCelebration(false);
      setIsLoading(false);
    };
    init();
  }, [chapterId, mode]);

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
      const word = chapterWords.find(w => w.id === wordId);
      if (word && (mode === 'learn' || mode === 'listen')) {
        speakDutch(word.dutch);
      }
    }
  }, [currentIndex, enterAnimation, isLoading, showCelebration, chapterWords, queue, mode]);

  const currentWord = useMemo(() => {
    if (queue.length === 0 || currentIndex >= queue.length) return null;
    return chapterWords.find(w => w.id === queue[currentIndex]) || null;
  }, [queue, currentIndex, chapterWords]);

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

    // Track consecutive greens
    if (score === 'green') {
      setConsecutiveGreens(prev => prev + 1);
    } else {
      setConsecutiveGreens(0);
    }

    // Save progress to database
    const dbMode = mode as DBPracticeMode;
    const existing = await getModeProgress(currentWord.id, dbMode);
    await saveModeProgress({
      wordId: currentWord.id,
      mode: dbMode,
      status: score,
      lastAttempt: new Date().toISOString(),
      attempts: (existing?.attempts || 0) + 1,
    });
  };

  // Move to next card or show celebration
  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowCelebration(true);
    }
  };

  // Continue with another batch
  const handleKeepGoing = () => {
    const shuffled = [...chapterWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, BATCH_SIZE);
    setQueue(shuffled.map(w => w.id));
    setCurrentIndex(0);
    setSessionStats({ green: 0, yellow: 0, red: 0 });
    setConsecutiveGreens(0);
    setShowCelebration(false);
  };

  // Replay audio
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
    produce: { color: '#58CC02', label: 'Produce', icon: '🎯' },
  };
  const style = modeStyles[mode];

  // Score-specific styling
  const scoreStyles = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-400' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: style.color }}></div>
      </div>
    );
  }

  // Celebration screen after batch
  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You've completed {queue.length} words!
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
            to={`/tracks/${chapterId}`}
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
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No words in this chapter
        </h2>
        <Link
          to={`/tracks/${chapterId}`}
          className="px-6 py-3 text-white rounded-xl font-bold transition-all mt-4"
          style={{ backgroundColor: style.color }}
        >
          Back to Chapter
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/tracks/${chapterId}`}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ch {chapterId}</span>
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
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{currentWord.english}</p>
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
        </div>
      </div>
    </div>
  );
}

export default TrackReview;
