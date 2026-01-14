import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapter, type ChapterWord } from '../data/chapters';
import { getChapterProgress, saveChapterWordProgress, getRematchWords } from '../lib/db';
import { speakDutch } from '../lib/audio';
import type { ChapterWordProgress } from '../types';

type Stage = 'qualifying' | 'pitradio' | 'victorylap' | 'mastered';

function TrackReview() {
  const { trackId, stage: stageParam } = useParams<{ trackId: string; stage?: string }>();
  const navigate = useNavigate();
  const isRematch = trackId === 'rematch';

  // Map URL stage param to internal stage type
  const selectedStage: Stage = stageParam === 'pitradio' ? 'pitradio'
    : stageParam === 'victorylap' ? 'victorylap'
    : 'qualifying';

  const [words, setWords] = useState<ChapterWord[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, ChapterWordProgress>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionWordCount, setSessionWordCount] = useState(0); // Track original session size
  const [sessionWords, setSessionWords] = useState<ChapterWord[]>([]); // Fixed session words
  const [correctCount, setCorrectCount] = useState(0); // Track correct answers
  const [missedWords, setMissedWords] = useState<ChapterWord[]>([]); // Track missed words for retry

  // Typing mode state
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation state for card transitions
  const [enterAnimation, setEnterAnimation] = useState<'entering' | 'visible'>('visible');
  const [exitAnimation, setExitAnimation] = useState<'left' | 'right' | null>(null);

  // Load chapter data and progress
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      if (isRematch) {
        const rematchProgress = await getRematchWords();
        const rematchWords: ChapterWord[] = [];
        const progMap = new Map<string, ChapterWordProgress>();

        for (const prog of rematchProgress) {
          const chapter = getChapter(prog.chapterId);
          if (chapter) {
            const word = chapter.words.find(w => w.id === prog.wordId);
            if (word) {
              rematchWords.push({ ...word, id: prog.chapterId * 1000 + word.id });
              progMap.set(`${prog.chapterId}-${prog.wordId}`, prog);
            }
          }
        }

        setWords(rematchWords);
        setProgressMap(progMap);
      } else {
        const chapterId = parseInt(trackId || '1');
        const chapter = getChapter(chapterId);

        if (!chapter) {
          navigate('/tracks');
          return;
        }

        setWords(chapter.words);

        const progress = await getChapterProgress(chapterId);
        const progMap = new Map<string, ChapterWordProgress>();
        progress.forEach(p => {
          progMap.set(`${p.chapterId}-${p.wordId}`, p);
        });
        setProgressMap(progMap);
      }

      setIsLoading(false);
    };
    loadData();
  }, [trackId, isRematch, navigate]);

  // Get progress for a word
  const getWordProgress = useCallback((word: ChapterWord): ChapterWordProgress | undefined => {
    if (isRematch) {
      const chapterId = Math.floor(word.id / 1000);
      const wordId = word.id % 1000;
      return progressMap.get(`${chapterId}-${wordId}`);
    }
    const chapterId = parseInt(trackId || '1');
    return progressMap.get(`${chapterId}-${word.id}`);
  }, [progressMap, trackId, isRematch]);

  // Build session words once when data loads (not on every render)
  const BATCH_SIZE = 10;

  useEffect(() => {
    if (isLoading || words.length === 0 || sessionWords.length > 0) return;

    // Get words in the target stage
    const stageWords = words.filter(word => {
      const prog = getWordProgress(word);
      if (!prog) return selectedStage === 'qualifying';
      return prog.stage === selectedStage;
    });

    let finalWords = stageWords;

    // If we need more words, fill with review words
    if (stageWords.length < BATCH_SIZE) {
      const needed = BATCH_SIZE - stageWords.length;
      const stageWordIds = new Set(stageWords.map(w => w.id));

      // Get words from other stages (words user has seen before)
      const reviewWords = words.filter(word => {
        if (stageWordIds.has(word.id)) return false;
        const prog = getWordProgress(word);
        if (!prog) return false;
        return prog.stage !== 'mastered';
      });

      // Shuffle and take what we need
      const shuffled = [...reviewWords].sort(() => Math.random() - 0.5);
      const fillWords = shuffled.slice(0, needed);
      finalWords = [...stageWords, ...fillWords];
    }

    // Cap at batch size
    const sessionBatch = finalWords.slice(0, BATCH_SIZE);
    setSessionWords(sessionBatch);
    setSessionWordCount(sessionBatch.length);
  }, [isLoading, words, getWordProgress, selectedStage, sessionWords.length]);

  // Use the fixed session words
  const filteredWords = sessionWords;

  const currentWord = filteredWords[currentIndex];
  const isTypingMode = selectedStage === 'pitradio' || selectedStage === 'victorylap';

  // Mode styles
  const modeStyles = {
    qualifying: { border: '#1CB0F6', label: 'Learn', labelColor: '#1CB0F6', btnColor: '#1CB0F6' },
    pitradio: { border: '#CE82FF', label: 'Listen', labelColor: '#CE82FF', btnColor: '#CE82FF' },
    victorylap: { border: '#58CC02', label: 'Produce', labelColor: '#58CC02', btnColor: '#58CC02' },
  };
  const style = modeStyles[selectedStage];

  // Auto-play audio when card appears (only once per card)
  // - Learn mode: play Dutch word on card entry (while seeing the word)
  // - Listen mode: play Dutch word on card entry (audio-only exercise)
  useEffect(() => {
    if (enterAnimation === 'visible' && (selectedStage === 'qualifying' || selectedStage === 'pitradio')) {
      const word = filteredWords[currentIndex];
      if (word) {
        speakDutch(word.dutch);
      }
    }
    // Only trigger on card change or animation state change
  }, [currentIndex, enterAnimation]);

  // Replay audio handler for Listen mode
  const handleReplayAudio = () => {
    if (currentWord) {
      speakDutch(currentWord.dutch);
    }
  };

  // Reset state and animate when moving to next card
  useEffect(() => {
    setEnterAnimation('entering');
    setIsFlipped(false);
    setTypedAnswer('');
    setShowResult(null);
    const timer = setTimeout(() => setEnterAnimation('visible'), 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Focus input for typing modes
  useEffect(() => {
    if (isTypingMode && inputRef.current && enterAnimation === 'visible') {
      inputRef.current.focus();
    }
  }, [currentIndex, isTypingMode, enterAnimation]);

  const handleFlip = () => {
    if (!isTypingMode) {
      const willFlip = !isFlipped;
      setIsFlipped(willFlip);
      // Speak when flipping BACK to front (Dutch side), not when flipping to back (English)
      if (!willFlip && currentWord) {
        speakDutch(currentWord.dutch);
      }
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentWord || exitAnimation) return;

    // Track session stats
    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setMissedWords(prev => [...prev, currentWord]);
    }

    // Trigger exit animation
    setExitAnimation(correct ? 'right' : 'left');

    // Wait for animation, then process
    setTimeout(async () => {
      const chapterId = isRematch ? Math.floor(currentWord.id / 1000) : parseInt(trackId || '1');
      const wordId = isRematch ? currentWord.id % 1000 : currentWord.id;
      const key = `${chapterId}-${wordId}`;

      const existing = progressMap.get(key);
      const wordStage = existing?.stage || 'qualifying';

      // Words only move UP, never back down
      let newStage: Stage = wordStage;
      if (correct) {
        if (wordStage === 'qualifying') newStage = 'pitradio';
        else if (wordStage === 'pitradio') newStage = 'victorylap';
        else if (wordStage === 'victorylap') newStage = 'mastered';
      }
      // Wrong answers: stay in current stage (no demotion)

      const newProgress: ChapterWordProgress = {
        chapterId,
        wordId,
        stage: newStage,
        correctCount: (existing?.correctCount || 0) + (correct ? 1 : 0),
        wrongCount: (existing?.wrongCount || 0) + (correct ? 0 : 1),
        lastSeen: new Date().toISOString(),
      };

      await saveChapterWordProgress(newProgress);

      const newMap = new Map(progressMap);
      newMap.set(key, newProgress);
      setProgressMap(newMap);

      setExitAnimation(null);

      // Move to next word
      if (currentIndex < filteredWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
      }
    }, 400);
  };

  // Check typed answer (Practice requires article, Master just the word)
  const handleSubmitTyping = () => {
    if (!currentWord) return;

    const normalized = typedAnswer.trim().toLowerCase();
    let expectedAnswer: string;
    let correct: boolean;

    if (selectedStage === 'pitradio' && currentWord.gender) {
      // Practice: require article + word for nouns
      expectedAnswer = `${currentWord.gender} ${currentWord.dutch}`.toLowerCase();
      correct = normalized === expectedAnswer;
    } else {
      // Master or words without gender: just the word
      expectedAnswer = currentWord.dutch.toLowerCase();
      correct = normalized === expectedAnswer;
    }

    setShowResult(correct ? 'correct' : 'wrong');
    speakDutch(currentWord.dutch);

    // Auto-advance after delay
    setTimeout(() => {
      handleAnswer(correct);
    }, 1500);
  };

  // Get expected answer format for display
  const getExpectedAnswer = () => {
    if (!currentWord) return '';
    if (selectedStage === 'pitradio' && currentWord.gender) {
      return `${currentWord.gender} ${currentWord.dutch}`;
    }
    return currentWord.dutch;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      // Typing modes use input field, so don't intercept those keys
      if (isTypingMode) {
        if (e.key === 'Enter' && typedAnswer && !showResult) {
          e.preventDefault();
          handleSubmitTyping();
        }
        return;
      }

      // Space/Enter to flip card
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!isFlipped) {
          e.preventDefault();
          handleFlip();
        }
        return;
      }

      // Only allow answer keys after flip
      if (isFlipped) {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'n') {
          handleAnswer(false);
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'y') {
          handleAnswer(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentWord, sessionComplete, isTypingMode, typedAnswer, showResult]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duo-green"></div>
      </div>
    );
  }

  // Show completion screen when session is done OR when all words moved to next stage
  const showCompletion = sessionComplete || (sessionWordCount > 0 && filteredWords.length === 0);
  const noWordsAvailable = sessionWordCount === 0 && filteredWords.length === 0 && !isLoading;

  if (showCompletion || noWordsAvailable) {
    const wrongCount = sessionWordCount - correctCount;
    const isPerfect = wrongCount === 0 && sessionWordCount > 0;

    // Build next session: missed words + new words to fill to 10
    const handlePracticeAgain = () => {
      const BATCH_SIZE = 10;

      // Start with missed words
      let nextSession = [...missedWords];

      // Fill remaining slots with words from the stage
      if (nextSession.length < BATCH_SIZE) {
        const missedIds = new Set(missedWords.map(w => w.id));
        const sessionIds = new Set(sessionWords.map(w => w.id));

        // Get more words from the stage that weren't in this session
        const moreWords = words.filter(word => {
          if (missedIds.has(word.id) || sessionIds.has(word.id)) return false;
          const prog = getWordProgress(word);
          if (!prog) return selectedStage === 'qualifying';
          return prog.stage === selectedStage;
        });

        const shuffled = [...moreWords].sort(() => Math.random() - 0.5);
        nextSession = [...nextSession, ...shuffled.slice(0, BATCH_SIZE - nextSession.length)];
      }

      // Reset for new session
      setSessionWords(nextSession);
      setSessionWordCount(nextSession.length);
      setCurrentIndex(0);
      setSessionComplete(false);
      setCorrectCount(0);
      setMissedWords([]);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{noWordsAvailable ? '📚' : isPerfect ? '🏆' : '🎉'}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {noWordsAvailable ? 'No words in this stage' : isPerfect ? 'Perfect!' : 'Session complete!'}
        </h2>

        {!noWordsAvailable && sessionWordCount > 0 && (
          <div className="mb-6">
            <p className="text-4xl font-bold mb-2" style={{ color: isPerfect ? '#58CC02' : correctCount > wrongCount ? '#58CC02' : '#FF4B4B' }}>
              {correctCount} / {sessionWordCount}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {isPerfect ? 'All correct!' : `${wrongCount} to review`}
            </p>
          </div>
        )}

        {noWordsAvailable && (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Complete earlier stages to unlock this one
          </p>
        )}

        <div className="flex gap-4">
          <Link
            to={isRematch ? '/tracks' : `/tracks/${trackId}`}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Back to Chapter
          </Link>
          {!noWordsAvailable && (
            <button
              onClick={handlePracticeAgain}
              className="px-6 py-3 bg-duo-green text-white rounded-xl font-bold hover:bg-duo-green-dark transition-all"
            >
              {wrongCount > 0 ? `Review ${wrongCount} + New` : 'Practice More'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={isRematch ? '/tracks' : `/tracks/${trackId}`}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: style.labelColor }}>{style.label}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {filteredWords.length}
          </span>
        </div>

        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%`, backgroundColor: '#58CC02' }}
          />
        </div>
      </div>

      {/* Typing Mode - Listen (audio only) or Produce (see English) */}
      {isTypingMode ? (
        <div
          className="flex-1 flex flex-col items-center justify-center mb-6"
          style={{
            transform: enterAnimation === 'entering' ? 'translateY(250px)' : 'translateY(0)',
            opacity: enterAnimation === 'entering' ? 0 : 1,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
          }}
        >
          {/* LISTEN MODE: Simple white card with speaker icon */}
          {selectedStage === 'pitradio' ? (
            <>
              {/* White flashcard with speaker icon */}
              <div
                onClick={handleReplayAudio}
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer flex items-center justify-center hover:shadow-md transition-all active:scale-[0.98]"
                style={{ minHeight: '180px' }}
              >
                <svg className="w-16 h-16" fill="none" stroke="#CE82FF" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>

              {/* Compact input with inline check button */}
              <div className="w-full max-w-md mt-4">
                {showResult ? (
                  <div className="text-center py-3">
                    <p className="text-lg font-bold" style={{ color: showResult === 'correct' ? '#58CC02' : '#FF4B4B' }}>
                      {showResult === 'correct' ? 'Correct!' : `It was: ${getExpectedAnswer()}`}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && typedAnswer.trim() && handleSubmitTyping()}
                      placeholder={currentWord.gender ? 'de/het + word...' : 'Type what you hear...'}
                      className="w-full py-3 px-4 pr-12 text-lg rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:border-purple-400 transition-all"
                    />
                    <button
                      onClick={handleSubmitTyping}
                      disabled={!typedAnswer.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                      style={{ backgroundColor: typedAnswer.trim() ? '#CE82FF' : '#e5e7eb' }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* PRODUCE MODE: Show English word on card */
            <>
              <div
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
                style={{ minHeight: '180px' }}
              >
                <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{currentWord.english}</p>
              </div>

              {/* Compact input with inline check button */}
              <div className="w-full max-w-md mt-4">
                {showResult ? (
                  <div className="text-center py-3">
                    <p className="text-lg font-bold" style={{ color: showResult === 'correct' ? '#58CC02' : '#FF4B4B' }}>
                      {showResult === 'correct' ? 'Correct!' : `It was: ${getExpectedAnswer()}`}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && typedAnswer.trim() && handleSubmitTyping()}
                      placeholder="Type Dutch word..."
                      className="w-full py-3 px-4 pr-12 text-lg rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:border-green-400 transition-all"
                    />
                    <button
                      onClick={handleSubmitTyping}
                      disabled={!typedAnswer.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                      style={{ backgroundColor: typedAnswer.trim() ? '#58CC02' : '#e5e7eb' }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Regular Flip Card Mode */
        <>
          <div className="flex-1 flex items-center justify-center mb-6 overflow-hidden" style={{ perspective: '1000px' }}>
            <div
              onClick={() => handleFlip()}
              className="w-full max-w-md cursor-pointer relative"
              style={{
                transformStyle: 'preserve-3d',
                transform: `
                  ${enterAnimation === 'entering' ? 'translateY(250px)' : 'translateY(0)'}
                  ${exitAnimation === 'left' ? 'translateX(-250px) rotate(-15deg)' : ''}
                  ${exitAnimation === 'right' ? 'translateX(250px) rotate(15deg)' : ''}
                `.trim(),
                opacity: enterAnimation === 'entering' || exitAnimation ? 0 : 1,
                transition: exitAnimation
                  ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out'
                  : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
              }}
            >
              {/* Card inner wrapper for flip */}
              <div
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: enterAnimation === 'entering' ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Front of card - Dutch word */}
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    backgroundColor: exitAnimation === 'left' ? '#fecaca' : exitAnimation === 'right' ? '#bbf7d0' : undefined,
                    transition: 'background-color 0.15s ease',
                    minHeight: '180px'
                  }}
                >
                  <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{currentWord.dutch}</p>
                </div>

                {/* Back of card - English answer (index card style) */}
                <div
                  className="rounded-2xl p-12 shadow-sm absolute inset-0 flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: exitAnimation === 'left'
                      ? 'repeating-linear-gradient(transparent, transparent 23px, #fca5a5 23px, #fca5a5 24px), #fecaca'
                      : exitAnimation === 'right'
                        ? 'repeating-linear-gradient(transparent, transparent 23px, #86efac 23px, #86efac 24px), #bbf7d0'
                        : 'repeating-linear-gradient(transparent, transparent 23px, #e5e5e5 23px, #e5e5e5 24px), white',
                    transition: 'background 0.15s ease',
                    minHeight: '180px',
                    borderBottom: '4px solid #d1d5db'
                  }}
                >
                  <p className="text-4xl font-bold text-gray-900 text-center">{currentWord.english}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Buttons - Always rendered, visible after flip */}
          <div style={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-5 text-white font-bold text-xl rounded-2xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: '#FF4B4B' }}
              >
                ✗
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-5 text-white font-bold text-xl rounded-2xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: '#58CC02' }}
              >
                ✓
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TrackReview;
