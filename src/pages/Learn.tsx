import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { speakDutch } from '../lib/audio';

function Learn() {
  const navigate = useNavigate();
  const { words, progress, settings, learnNewCards } = useStore();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [learnedWordIds, setLearnedWordIds] = useState<number[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get new words (not yet started)
  const newWords = words.filter((w) => !progress.has(w.id));
  const wordsToLearn = newWords.slice(0, settings.newCardsPerDay);

  const handleStartLearning = async () => {
    if (wordsToLearn.length === 0) return;

    // Add words to progress as "learning"
    const wordIds = await learnNewCards(settings.newCardsPerDay);
    setLearnedWordIds(wordIds);
    setIsLearning(true);
    setCurrentWordIndex(0);
  };

  const handlePlayAudio = async (word: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakDutch(word);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentWordIndex < learnedWordIds.length - 1) {
      setCurrentWordIndex((i) => i + 1);
    } else {
      // Done learning, go to review
      navigate('/review/reading');
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((i) => i - 1);
    }
  };

  // Show start screen
  if (!isLearning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {wordsToLearn.length > 0 ? (
          <>
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">Learn New Words</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              You have <span className="font-semibold text-primary-500">{wordsToLearn.length}</span> new words to learn today.
            </p>
            <button
              onClick={handleStartLearning}
              className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors"
            >
              Start Learning
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {newWords.length} total words remaining
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">All Words Started!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              You've started learning all {words.length} words. Keep reviewing to master them!
            </p>
            <button
              onClick={() => navigate('/review')}
              className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors"
            >
              Go to Review
            </button>
          </>
        )}
      </div>
    );
  }

  // Learning mode
  const currentWord = words.find((w) => w.id === learnedWordIds[currentWordIndex]);
  if (!currentWord) return null;

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsLearning(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentWordIndex + 1} / {learnedWordIds.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((currentWordIndex + 1) / learnedWordIds.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {currentWord.dutch}
          </p>
          {currentWord.gender && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              ({currentWord.gender})
            </p>
          )}

          <button
            onClick={() => handlePlayAudio(currentWord.dutch)}
            className={`mx-auto mt-2 p-3 rounded-full transition-all ${
              isPlaying
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>

          <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 mx-auto my-4" />

          <p className="text-2xl text-primary-500 font-medium mb-1">
            {currentWord.english}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {currentWord.partOfSpeech}
          </p>

          {/* Example sentence */}
          {currentWord.sentences.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-left">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{currentWord.sentences[0].dutch}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                "{currentWord.sentences[0].english}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentWordIndex === 0}
          className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          {currentWordIndex === learnedWordIds.length - 1 ? 'Start Review' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default Learn;
