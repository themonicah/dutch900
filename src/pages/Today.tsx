import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

function Today() {
  const navigate = useNavigate();
  const { words, progress, stats, startReview, getStageCounts } = useStore();
  const [isStarting, setIsStarting] = useState(false);

  // Calculate what's available
  const totalWords = words.length;
  const wordsStarted = progress.size;
  const progressPercent = Math.round((wordsStarted / totalWords) * 100);

  // Get stage counts
  const stageCounts = getStageCounts();

  // Count cards in each stage
  const readingCount = stageCounts.inReading;
  const listeningCount = stageCounts.inListening;
  const productionCount = stageCounts.inProduction;
  const masteredCount = stageCounts.fullyMastered;
  const notStartedCount = stageCounts.notStarted;

  // Check if each mode has words available
  const canStartLearn = (readingCount + notStartedCount) > 0;

  // Handle starting a specific mode
  const handleStartMode = async (mode: 'reading' | 'listening' | 'production') => {
    setIsStarting(true);
    try {
      await startReview(mode);
      navigate(`/review/${mode}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Practice Modes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Practice</h2>

        <div className="space-y-3">
          {/* Learn (Reading) - See Dutch, flip to English */}
          <button
            onClick={() => handleStartMode('reading')}
            disabled={isStarting || !canStartLearn}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: canStartLearn ? '#1CB0F6' : '#f3f4f6',
              opacity: canStartLearn ? 1 : 0.6,
              cursor: canStartLearn ? 'pointer' : 'not-allowed',
              border: canStartLearn ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: canStartLearn ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-2xl">📖</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg" style={{ color: canStartLearn ? '#ffffff' : '#6b7280' }}>Learn</p>
              <p className="text-sm" style={{ color: canStartLearn ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>See Dutch, flip to English</p>
            </div>
          </button>

          {/* Listen - Hear Dutch audio, type what you heard */}
          <button
            onClick={() => handleStartMode('listening')}
            disabled={isStarting || listeningCount === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: listeningCount > 0 ? '#CE82FF' : '#f3f4f6',
              opacity: listeningCount > 0 ? 1 : 0.6,
              cursor: listeningCount > 0 ? 'pointer' : 'not-allowed',
              border: listeningCount > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: listeningCount > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-2xl">🔊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg" style={{ color: listeningCount > 0 ? '#ffffff' : '#6b7280' }}>Listen</p>
              <p className="text-sm" style={{ color: listeningCount > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>Hear Dutch, type it</p>
            </div>
          </button>

          {/* Produce - See English, type Dutch */}
          <button
            onClick={() => handleStartMode('production')}
            disabled={isStarting || productionCount === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: productionCount > 0 ? '#58CC02' : '#f3f4f6',
              opacity: productionCount > 0 ? 1 : 0.6,
              cursor: productionCount > 0 ? 'pointer' : 'not-allowed',
              border: productionCount > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: productionCount > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg" style={{ color: productionCount > 0 ? '#ffffff' : '#6b7280' }}>Produce</p>
              <p className="text-sm" style={{ color: productionCount > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>See English, type Dutch</p>
            </div>
          </button>
        </div>

        {/* All mastered! */}
        {masteredCount === totalWords && (
          <div className="mt-6 text-center py-6 bg-duo-yellow/10 rounded-xl">
            <span className="text-5xl">🏆</span>
            <p className="font-bold text-duo-yellow text-xl mt-2">Champion!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">All 900 words mastered!</p>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-5">
          {/* Multi-segment Donut Chart */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {(() => {
              const circumference = 2 * Math.PI * 38; // r=38 for larger donut
              const newPct = notStartedCount / totalWords;
              const learnPct = readingCount / totalWords;
              const listenPct = listeningCount / totalWords;
              const producePct = productionCount / totalWords;
              const masteredPct = masteredCount / totalWords;

              // Calculate stroke dash arrays and offsets for each segment
              const segments = [
                { pct: masteredPct, color: '#FFC800', offset: 0 },
                { pct: producePct, color: '#58CC02', offset: masteredPct },
                { pct: listenPct, color: '#CE82FF', offset: masteredPct + producePct },
                { pct: learnPct, color: '#1CB0F6', offset: masteredPct + producePct + listenPct },
                { pct: newPct, color: '#E5E5E5', offset: masteredPct + producePct + listenPct + learnPct },
              ];

              return (
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  {/* Background circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                    className="dark:stroke-gray-700"
                  />
                  {/* Colored segments */}
                  {segments.map((seg, i) => seg.pct > 0 && (
                    <circle
                      key={i}
                      cx="48"
                      cy="48"
                      r="38"
                      stroke={seg.color}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${seg.pct * circumference} ${circumference}`}
                      strokeDashoffset={-seg.offset * circumference}
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>
              );
            })()}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {masteredCount} <span className="text-gray-400 font-normal text-lg">/ {totalWords}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Words mastered</p>

            {/* Stage breakdown with colored dots */}
            <div className="flex gap-3 mt-3 flex-wrap">
              {notStartedCount > 0 && (
                <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  {notStartedCount} new
                </span>
              )}
              {readingCount > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#1CB0F6' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1CB0F6' }}></span>
                  {readingCount} learn
                </span>
              )}
              {listeningCount > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#CE82FF' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CE82FF' }}></span>
                  {listeningCount} listen
                </span>
              )}
              {productionCount > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#58CC02' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#58CC02' }}></span>
                  {productionCount} produce
                </span>
              )}
              {masteredCount > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#FFC800' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFC800' }}></span>
                  {masteredCount} done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-duo-yellow">{stats.currentStreak}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Day streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-duo-blue">{stats.totalReviewsCompleted}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reviews</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-duo-green">{masteredCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mastered</p>
        </div>
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
                <p className="text-gray-500 dark:text-gray-400">See Dutch word, flip to see English</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">10 words per session. Missed words return next round!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Today;
