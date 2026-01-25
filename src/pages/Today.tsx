import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { getModeStats, getAllTroubledWordCounts } from '../lib/db';
import type { ModeStats, PracticeMode } from '../types';

function Today() {
  const navigate = useNavigate();
  const { words } = useStore();

  const [modeStats, setModeStats] = useState<Record<PracticeMode, ModeStats>>({
    learn: { green: 0, yellow: 0, red: 0, new: 0 },
    listen: { green: 0, yellow: 0, red: 0, new: 0 },
    produce: { green: 0, yellow: 0, red: 0, new: 0 },
  });
  const [troubledCounts, setTroubledCounts] = useState<Record<PracticeMode, number>>({
    learn: 0,
    listen: 0,
    produce: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const totalWords = words.length;

  // Load mode stats
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const [learnStats, listenStats, produceStats, troubled] = await Promise.all([
        getModeStats('learn', totalWords),
        getModeStats('listen', totalWords),
        getModeStats('produce', totalWords),
        getAllTroubledWordCounts(),
      ]);
      setModeStats({
        learn: learnStats,
        listen: listenStats,
        produce: produceStats,
      });
      setTroubledCounts(troubled);
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

  const modes = [
    { id: 'learn' as PracticeMode, name: 'Learn', icon: '📖', color: '#1CB0F6', desc: 'See Dutch, type English' },
    { id: 'listen' as PracticeMode, name: 'Listen', icon: '🔊', color: '#CE82FF', desc: 'Hear Dutch, type Dutch' },
    { id: 'produce' as PracticeMode, name: 'Translate', icon: '🎯', color: '#58CC02', desc: 'See English, type Dutch' },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col justify-center space-y-6">
      {/* Intro */}
      <div className="text-center px-4">
        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Master the 900 most common Dutch words
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          3 modes to practice
        </p>
      </div>

      {/* Practice Mode Tiles - Side by Side */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const stats = modeStats[mode.id];
          const practiced = stats.green + stats.yellow + stats.red;
          const troubledCount = troubledCounts[mode.id];

          return (
            <div key={mode.id} className="flex flex-col items-center">
              <button
                onClick={() => handleStartMode(mode.id)}
                className="w-full flex flex-col items-center p-4 rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-sm hover:scale-105 hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: mode.color }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-2xl">{mode.icon}</span>
                </div>

                {/* Mode Name */}
                <p className="font-bold text-white text-sm mb-1">{mode.name}</p>

                {/* Progress indicator */}
                <p className="text-xs text-white/70 mb-2">{practiced}/{totalWords}</p>

                {/* Stats row with colored circles */}
                {!isLoading && (
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#22c55e"/>
                      </svg>
                      {stats.green}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#eab308"/>
                      </svg>
                      {stats.yellow}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#ef4444"/>
                      </svg>
                      {stats.red}
                    </span>
                  </div>
                )}
              </button>

              {/* Review troubled words link - only show when 5+ words */}
              {troubledCount >= 5 && (
                <Link
                  to={`/review-troubled/${mode.id}`}
                  className="mt-2 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Review {troubledCount}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* All words mastered celebration */}
      {totalGreens >= totalWords * 3 && (
        <div className="text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <span className="text-5xl">🏆</span>
          <p className="font-bold text-yellow-600 dark:text-yellow-400 text-xl mt-2">Champion!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">All 900 words mastered in all modes!</p>
        </div>
      )}
    </div>
  );
}

export default Today;
