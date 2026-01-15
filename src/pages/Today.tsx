import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getModeStats } from '../lib/db';
import type { ModeStats, PracticeMode } from '../types';

function Today() {
  const navigate = useNavigate();
  const { words, progress } = useStore();

  const [modeStats, setModeStats] = useState<Record<PracticeMode, ModeStats>>({
    learn: { green: 0, yellow: 0, red: 0, new: 0 },
    listen: { green: 0, yellow: 0, red: 0, new: 0 },
    produce: { green: 0, yellow: 0, red: 0, new: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  const totalWords = words.length;
  const wordsStarted = progress.size;

  // Load mode stats
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const [learnStats, listenStats, produceStats] = await Promise.all([
        getModeStats('learn', totalWords),
        getModeStats('listen', totalWords),
        getModeStats('produce', totalWords),
      ]);
      setModeStats({
        learn: learnStats,
        listen: listenStats,
        produce: produceStats,
      });
      setIsLoading(false);
    };
    loadStats();
  }, [totalWords]);

  // Handle starting a practice mode
  const handleStartMode = (mode: PracticeMode) => {
    navigate(`/review/${mode}`);
  };

  // Calculate total greens across all modes (for overall progress)
  const totalGreens = modeStats.learn.green + modeStats.listen.green + modeStats.produce.green;

  return (
    <div className="space-y-6">
      {/* Progress toward 900 words */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your journey to fluency</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {wordsStarted} <span className="text-gray-400 font-normal text-xl">/ 900</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">words started</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(wordsStarted / totalWords) * 100}%`,
                backgroundColor: '#58CC02'
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>{totalWords - wordsStarted} words remaining</span>
            <span>900</span>
          </div>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Practice</h2>

        <div className="space-y-3">
          {/* Learn - See Dutch, type English */}
          <button
            onClick={() => handleStartMode('learn')}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#1CB0F6' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <span className="text-2xl">📖</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg text-white">Learn</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>See Dutch, type English</p>
              {!isLoading && (
                <div className="flex gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟢 {modeStats.learn.green}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟡 {modeStats.learn.yellow}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🔴 {modeStats.learn.red}
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* Listen - Hear Dutch, type Dutch */}
          <button
            onClick={() => handleStartMode('listen')}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#CE82FF' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <span className="text-2xl">🔊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg text-white">Listen</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Hear Dutch, type Dutch</p>
              {!isLoading && (
                <div className="flex gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟢 {modeStats.listen.green}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟡 {modeStats.listen.yellow}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🔴 {modeStats.listen.red}
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* Produce - See English, type Dutch */}
          <button
            onClick={() => handleStartMode('produce')}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#58CC02' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg text-white">Produce</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>See English, type Dutch</p>
              {!isLoading && (
                <div className="flex gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟢 {modeStats.produce.green}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🟡 {modeStats.produce.yellow}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    🔴 {modeStats.produce.red}
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* All words mastered celebration */}
        {totalGreens >= totalWords * 3 && (
          <div className="mt-6 text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <span className="text-5xl">🏆</span>
            <p className="font-bold text-yellow-600 dark:text-yellow-400 text-xl mt-2">Champion!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">All 900 words mastered in all modes!</p>
          </div>
        )}
      </div>

      {/* How It Works - Only show when starting out */}
      {wordsStarted < 20 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">How it works</h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#1CB0F6' }}>1</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Learn</p>
                <p className="text-gray-500 dark:text-gray-400">See Dutch word, type English translation</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#CE82FF' }}>2</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Listen</p>
                <p className="text-gray-500 dark:text-gray-400">Hear Dutch audio, type what you heard</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#58CC02' }}>3</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Produce</p>
                <p className="text-gray-500 dark:text-gray-400">See English, type the Dutch translation</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-green-500">🟢 Green</span> = correct,
              <span className="text-yellow-500 ml-2">🟡 Yellow</span> = close,
              <span className="text-red-500 ml-2">🔴 Red</span> = practice more
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Today;
