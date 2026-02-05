import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patterns, categoryInfo } from '../data/patterns';
import { getPatternProgress, savePatternProgress } from '../lib/db';
import { scoreAnswer } from '../lib/fuzzyMatch';
import { speakDutch } from '../lib/audio';
import type { PatternProgress } from '../types';

type ScoreStatus = 'green' | 'yellow' | 'red';

function PatternDrill() {
  const { patternId } = useParams<{ patternId: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const pattern = patterns.find((p) => p.id === Number(patternId));

  const [progress, setProgress] = useState<PatternProgress | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<ScoreStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  // Shuffled order of variations for this session
  const [variationOrder, setVariationOrder] = useState<number[]>([]);

  // Load progress on mount
  useEffect(() => {
    if (!pattern) return;

    const loadProgress = async () => {
      let existingProgress = await getPatternProgress(pattern.id);

      if (!existingProgress) {
        // Initialize progress for this pattern
        existingProgress = {
          patternId: pattern.id,
          variationProgress: pattern.variations.map((_, i) => ({
            patternId: pattern.id,
            variationIndex: i,
            correctStreak: 0,
            attempts: 0,
            lastAttempt: null,
          })),
          masteredCount: 0,
          totalVariations: pattern.variations.length,
          lastAttempt: null,
        };
      }

      setProgress(existingProgress);

      // Create shuffled order, prioritizing non-mastered variations
      const notMastered: number[] = [];
      const mastered: number[] = [];

      existingProgress.variationProgress.forEach((vp, i) => {
        if (vp.correctStreak >= 3) {
          mastered.push(i);
        } else {
          notMastered.push(i);
        }
      });

      // Shuffle each group
      const shuffle = (arr: number[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      // Put non-mastered first, then mastered for review
      const order = [...shuffle(notMastered), ...shuffle(mastered)];
      setVariationOrder(order);
    };

    loadProgress();
  }, [pattern]);

  // Focus input when showing a new variation
  useEffect(() => {
    if (!showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, showResult]);

  // Handle Enter key to advance when result is showing
  useEffect(() => {
    if (!showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, currentIndex, variationOrder.length]);

  if (!pattern) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pattern not found</p>
        <button
          onClick={() => navigate('/patterns')}
          className="mt-4 text-duo-blue hover:underline"
        >
          Back to Patterns
        </button>
      </div>
    );
  }

  if (!progress || variationOrder.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-duo-blue" />
      </div>
    );
  }

  const currentVariationIndex = variationOrder[currentIndex];
  const currentVariation = pattern.variations[currentVariationIndex];
  const currentVP = progress.variationProgress[currentVariationIndex];
  const isMastered = currentVP.correctStreak >= 3;
  const info = categoryInfo[pattern.category];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showResult || !userInput.trim()) return;

    const scoreStatus = scoreAnswer(userInput.trim(), currentVariation.dutch);

    setLastScore(scoreStatus);
    setShowResult(true);

    // Update variation progress
    const newVP = { ...currentVP };
    newVP.attempts++;
    newVP.lastAttempt = new Date().toISOString();

    if (scoreStatus === 'green') {
      newVP.correctStreak++;
      setSessionStats((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      newVP.correctStreak = 0; // Reset streak on wrong answer
      setSessionStats((s) => ({ ...s, total: s.total + 1 }));
    }

    // Update overall pattern progress
    const newVariationProgress = [...progress.variationProgress];
    newVariationProgress[currentVariationIndex] = newVP;

    const masteredCount = newVariationProgress.filter((vp) => vp.correctStreak >= 3).length;

    const newProgress: PatternProgress = {
      ...progress,
      variationProgress: newVariationProgress,
      masteredCount,
      lastAttempt: new Date().toISOString(),
    };

    setProgress(newProgress);
    await savePatternProgress(newProgress);

    // Play audio for correct answer
    if (scoreStatus === 'green') {
      speakDutch(currentVariation.dutch);
    }
  };

  const handleNext = () => {
    if (currentIndex < variationOrder.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setShowResult(false);
      setLastScore(null);
    } else {
      setIsComplete(true);
    }
  };

  const handlePlayAudio = () => {
    speakDutch(currentVariation.dutch);
  };

  // Completion screen
  if (isComplete) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;
    const allMastered = progress.masteredCount >= progress.totalVariations;

    return (
      <div className="max-w-md mx-auto text-center py-8 space-y-6">
        <div className="text-6xl mb-4">
          {allMastered ? '🎉' : accuracy >= 80 ? '💪' : '📚'}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {allMastered ? 'Pattern Mastered!' : 'Session Complete!'}
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">This session</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {sessionStats.correct}/{sessionStats.total} correct ({accuracy}%)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Pattern progress</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {progress.masteredCount}/{progress.totalVariations} mastered
            </span>
          </div>

          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-duo-green rounded-full"
              style={{ width: `${(progress.masteredCount / progress.totalVariations) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/patterns')}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
          >
            All Patterns
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSessionStats({ correct: 0, total: 0 });
              setIsComplete(false);
              setUserInput('');
              setShowResult(false);
              setLastScore(null);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-duo-green text-white font-medium"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patterns')}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span>{info.icon}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1}/{variationOrder.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-duo-blue rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / variationOrder.length) * 100}%` }}
        />
      </div>

      {/* Pattern template */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
          {pattern.template}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {pattern.english}
        </p>
      </div>

      {/* Current variation prompt */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Translate:</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {currentVariation.english}
          </p>
          {isMastered && (
            <span className="inline-block mt-2 text-xs bg-duo-green/10 text-duo-green px-2 py-1 rounded-full">
              ✓ Mastered
            </span>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showResult}
            placeholder="Type in Dutch..."
            className={`w-full px-4 py-3 rounded-xl border-2 text-lg ${
              showResult
                ? lastScore === 'green'
                  ? 'border-duo-green bg-duo-green/10'
                  : lastScore === 'yellow'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-white focus:outline-none focus:border-duo-blue`}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        </form>

        {/* Result feedback */}
        {showResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`font-medium ${
                  lastScore === 'green'
                    ? 'text-duo-green'
                    : lastScore === 'yellow'
                    ? 'text-yellow-600'
                    : 'text-red-500'
                }`}
              >
                {lastScore === 'green'
                  ? '✓ Correct!'
                  : lastScore === 'yellow'
                  ? '~ Almost!'
                  : '✗ Not quite'}
              </span>
              <button
                onClick={handlePlayAudio}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                🔊
              </button>
            </div>

            {lastScore !== 'green' && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Correct answer:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentVariation.dutch}
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-duo-green text-white font-medium"
            >
              {currentIndex < variationOrder.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        )}

        {/* Submit button when not showing result */}
        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              userInput.trim()
                ? 'bg-duo-blue text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            Check
          </button>
        )}
      </div>

      {/* Streak indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Streak: {currentVP.correctStreak}/3 correct to master
      </div>
    </div>
  );
}

export default PatternDrill;
