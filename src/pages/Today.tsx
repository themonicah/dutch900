import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

function Today() {
  const navigate = useNavigate();
  const { words, progress, startReview, getStageCounts } = useStore();
  const [isStarting, setIsStarting] = useState(false);

  // Calculate what's available
  const totalWords = words.length;
  const wordsStarted = progress.size;

  // Get stage counts
  const stageCounts = getStageCounts();

  // Count cards in each stage (current location)
  const inReadingCount = stageCounts.inReading;
  const inListeningCount = stageCounts.inListening;
  const inProductionCount = stageCounts.inProduction;
  const masteredCount = stageCounts.fullyMastered;
  const notStartedCount = stageCounts.notStarted;

  // Check if each mode has words available
  const canStartLearn = (inReadingCount + notStartedCount) > 0;

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
            disabled={isStarting || inListeningCount === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: inListeningCount > 0 ? '#CE82FF' : '#f3f4f6',
              opacity: inListeningCount > 0 ? 1 : 0.6,
              cursor: inListeningCount > 0 ? 'pointer' : 'not-allowed',
              border: inListeningCount > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: inListeningCount > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-2xl">🔊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg" style={{ color: inListeningCount > 0 ? '#ffffff' : '#6b7280' }}>Listen</p>
              <p className="text-sm" style={{ color: inListeningCount > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>Hear Dutch, type it</p>
            </div>
          </button>

          {/* Produce - See English, type Dutch */}
          <button
            onClick={() => handleStartMode('production')}
            disabled={isStarting || inProductionCount === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: inProductionCount > 0 ? '#58CC02' : '#f3f4f6',
              opacity: inProductionCount > 0 ? 1 : 0.6,
              cursor: inProductionCount > 0 ? 'pointer' : 'not-allowed',
              border: inProductionCount > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: inProductionCount > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg" style={{ color: inProductionCount > 0 ? '#ffffff' : '#6b7280' }}>Produce</p>
              <p className="text-sm" style={{ color: inProductionCount > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>See English, type Dutch</p>
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

      {/* Progress toward 900 words */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Main goal: 900 words */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your journey to fluency</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {wordsStarted} <span className="text-gray-400 font-normal text-xl">/ 900</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">words started</p>
        </div>

        {/* Progress bar showing started vs remaining */}
        <div className="mb-4">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {/* Mastered */}
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(masteredCount / totalWords) * 100}%`,
                backgroundColor: '#FFC800'
              }}
            />
            {/* In production */}
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(inProductionCount / totalWords) * 100}%`,
                backgroundColor: '#58CC02'
              }}
            />
            {/* In listening */}
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(inListeningCount / totalWords) * 100}%`,
                backgroundColor: '#CE82FF'
              }}
            />
            {/* In reading/learning */}
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(inReadingCount / totalWords) * 100}%`,
                backgroundColor: '#1CB0F6'
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>{notStartedCount} words remaining</span>
            <span>900</span>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(28, 176, 246, 0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#1CB0F6' }}>{inReadingCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Learning</p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(206, 130, 255, 0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#CE82FF' }}>{inListeningCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Listening</p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(88, 204, 2, 0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#58CC02' }}>{inProductionCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Producing</p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 200, 0, 0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#FFC800' }}>{masteredCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mastered</p>
          </div>
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
