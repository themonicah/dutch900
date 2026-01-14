import { useState, useEffect } from 'react';
import type { Word, ReviewMode } from '../types';
import { speakDutch, stopSpeaking } from '../lib/audio';

interface FlashCardProps {
  word: Word;
  mode: ReviewMode;
  autoPlayAudio: boolean;
  onReveal: () => void;
  revealed: boolean;
}

function FlashCard({ word, mode, autoPlayAudio, onReveal, revealed }: FlashCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play audio based on mode:
  // - Listening: play immediately (user listens to guess)
  // - Reading: play if autoPlayAudio enabled (helps with pronunciation)
  // - Production: play AFTER reveal (confirms the Dutch word)
  useEffect(() => {
    if (mode === 'listening') {
      handlePlayAudio();
    } else if (mode === 'reading' && autoPlayAudio) {
      handlePlayAudio();
    }
    return () => stopSpeaking();
  }, [word.id, mode, autoPlayAudio]);

  // Auto-play audio when revealing in production mode
  useEffect(() => {
    if (mode === 'production' && revealed) {
      handlePlayAudio();
    }
  }, [revealed, mode]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await speakDutch(word.dutch);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClick = () => {
    if (!revealed) {
      onReveal();
    }
  };

  return (
    <div
      className={`flip-card w-full max-w-sm mx-auto ${revealed ? 'flipped' : ''}`}
      onClick={handleClick}
    >
      <div className="flip-card-inner relative w-full" style={{ minHeight: '280px' }}>
        {/* Front of card */}
        <div className="flip-card-front absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center">
          {mode === 'listening' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio();
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-500 scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900'
                }`}
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </button>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Listen and guess the word
              </p>
            </>
          ) : mode === 'production' ? (
            <>
              <p className="text-4xl font-bold text-primary-500 mb-2">
                {word.english}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {word.partOfSpeech}
              </p>
              <div className="mt-2 p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Think of the Dutch word
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {word.dutch}
              </p>
              {word.gender && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  ({word.gender})
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio();
                }}
                className={`mt-2 p-3 rounded-full transition-all ${
                  isPlaying
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
            </>
          )}
          <p className="mt-6 text-gray-400 dark:text-gray-500 text-sm">
            Tap to reveal answer
          </p>
        </div>

        {/* Back of card */}
        <div className="flip-card-back absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {word.dutch}
            </p>
            {word.gender && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                ({word.gender})
              </p>
            )}
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 my-3" />
            <p className="text-2xl text-primary-500 font-medium mb-1">
              {word.english}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {word.partOfSpeech}
            </p>

            {/* Audio button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAudio();
              }}
              className={`p-3 rounded-full transition-all ${
                isPlaying
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </button>
          </div>

          {/* Example sentence */}
          {word.sentences.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{word.sentences[0].dutch}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                "{word.sentences[0].english}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashCard;
