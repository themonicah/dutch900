import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { speakDutch } from '../lib/audio';
import type { ReviewMode } from '../types';

function Review() {
  const { mode: modeParam } = useParams<{ mode?: string }>();
  const navigate = useNavigate();

  const {
    startReview,
    getCurrentCard,
    recordReview,
    nextCard,
    currentQueue,
    currentIndex,
  } = useStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enterAnimation, setEnterAnimation] = useState<'entering' | 'visible'>('visible');
  const [exitAnimation, setExitAnimation] = useState<'left' | 'right' | null>(null);

  // Typing mode state
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine review mode from URL
  const mode: ReviewMode = modeParam === 'listening'
    ? 'listening'
    : modeParam === 'production'
      ? 'production'
      : 'reading';

  const isTypingMode = mode === 'listening' || mode === 'production';

  // Start review session on mount or mode change
  useEffect(() => {
    const initReview = async () => {
      setIsLoading(true);
      await startReview(mode);
      setIsLoading(false);
    };
    initReview();
  }, [mode, startReview]);

  // Reset state and animate when moving to next card
  useEffect(() => {
    setEnterAnimation('entering');
    setIsFlipped(false);
    setTypedAnswer('');
    setShowResult(null);
    // Animate in from bottom with slight delay for smoothness
    const timer = setTimeout(() => setEnterAnimation('visible'), 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Focus input for typing modes
  useEffect(() => {
    if (isTypingMode && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [currentIndex, isTypingMode, isLoading]);

  const currentCard = getCurrentCard();

  // Auto-play audio when card appears (only once per card)
  // - Learn mode: play Dutch word on card entry (while seeing the word)
  // - Listen mode: play Dutch word on card entry (audio-only exercise)
  useEffect(() => {
    if (enterAnimation === 'visible' && (mode === 'reading' || mode === 'listening')) {
      const card = getCurrentCard();
      if (card) {
        speakDutch(card.word.dutch);
      }
    }
    // Only trigger on card change or animation state change
  }, [currentIndex, enterAnimation]);

  const handleFlip = () => {
    if (!isTypingMode) {
      const willFlip = !isFlipped;
      setIsFlipped(willFlip);
      // Speak when flipping BACK to front (Dutch side), not when flipping to back (English)
      if (!willFlip && currentCard) {
        speakDutch(currentCard.word.dutch);
      }
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard || exitAnimation) return;

    // Trigger exit animation
    setExitAnimation(correct ? 'right' : 'left');

    // Wait for exit animation to complete, then process
    setTimeout(async () => {
      await recordReview(currentCard.word.id, correct ? 4 : 1);
      setExitAnimation(null);

      if (currentIndex < currentQueue.length - 1) {
        nextCard();
      } else {
        navigate('/');
      }
    }, 400);
  };

  // Check typed answer
  const handleSubmitTyping = () => {
    if (!currentCard) return;

    const normalized = typedAnswer.trim().toLowerCase();
    let expectedAnswer: string;
    let correct: boolean;

    if (mode === 'listening' && currentCard.word.gender) {
      // Practice mode: require article + word for nouns
      expectedAnswer = `${currentCard.word.gender} ${currentCard.word.dutch}`.toLowerCase();
      correct = normalized === expectedAnswer;
    } else {
      // Master mode or words without gender: just the word
      expectedAnswer = currentCard.word.dutch.toLowerCase();
      correct = normalized === expectedAnswer;
    }

    setShowResult(correct ? 'correct' : 'wrong');
    speakDutch(currentCard.word.dutch);

    setTimeout(() => {
      handleAnswer(correct);
    }, 1500);
  };

  const getExpectedAnswer = () => {
    if (!currentCard) return '';
    if (mode === 'listening' && currentCard.word.gender) {
      return `${currentCard.word.gender} ${currentCard.word.dutch}`;
    }
    return currentCard.word.dutch;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard) return;

      if (isTypingMode) {
        if (e.key === 'Enter' && typedAnswer && !showResult) {
          e.preventDefault();
          handleSubmitTyping();
        }
        return;
      }

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
  }, [isFlipped, currentCard, isTypingMode, typedAnswer, showResult]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duo-green"></div>
      </div>
    );
  }

  if (currentQueue.length === 0 || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {currentQueue.length === 0 ? 'No words ready' : 'Session complete!'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {currentQueue.length === 0
            ? 'Complete earlier stages to unlock this one'
            : `You reviewed ${currentQueue.length} words`}
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-duo-green text-white rounded-xl font-bold hover:bg-duo-green-dark transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const { word } = currentCard;

  // Mode-specific styling
  const modeStyles = {
    reading: { border: '#1CB0F6', label: 'Learn', labelColor: '#1CB0F6', btnColor: '#1CB0F6' },
    listening: { border: '#CE82FF', label: 'Listen', labelColor: '#CE82FF', btnColor: '#CE82FF' },
    production: { border: '#58CC02', label: 'Produce', labelColor: '#58CC02', btnColor: '#58CC02' },
  };
  const style = modeStyles[mode];

  // Replay audio handler for Listen mode
  const handleReplayAudio = () => {
    if (currentCard) {
      speakDutch(currentCard.word.dutch);
    }
  };

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
          <span className="font-medium text-sm" style={{ color: style.labelColor }}>{style.label}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {currentQueue.length}
          </span>
        </div>

        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${((currentIndex + 1) / currentQueue.length) * 100}%`, backgroundColor: '#58CC02' }}
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
          {mode === 'listening' ? (
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
                      placeholder={word.gender ? 'de/het + word...' : 'Type what you hear...'}
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
                <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{word.english}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{word.partOfSpeech}</p>
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
        /* Flip Card Mode (Learn) */
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
                  <p className="text-4xl font-bold text-gray-900 dark:text-white text-center">{word.dutch}</p>
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
                  <p className="text-4xl font-bold text-gray-900 text-center">{word.english}</p>
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

export default Review;
