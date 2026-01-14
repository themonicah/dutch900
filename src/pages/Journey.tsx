import { useState } from 'react';
import { useStore } from '../store';

type ViewMode = 'grid' | 'stats';

function Journey() {
  const { words, progress, stats } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedWord, setSelectedWord] = useState<number | null>(null);

  // Calculate level stats
  const levelStats = {
    notStarted: 0,
    reading: { learning: 0, review: 0, mastered: 0 },
    listening: { locked: 0, learning: 0, review: 0, mastered: 0 },
    production: { locked: 0, learning: 0, review: 0, mastered: 0 },
  };

  words.forEach((word) => {
    const prog = progress.get(word.id);
    if (!prog) {
      levelStats.notStarted++;
      return;
    }

    // Reading status
    if (prog.reading.status === 'learning' || prog.reading.status === 'new') {
      levelStats.reading.learning++;
    } else if (prog.reading.status === 'review') {
      levelStats.reading.review++;
    } else if (prog.reading.status === 'mastered') {
      levelStats.reading.mastered++;
    }

    // Listening status
    if (!prog.listening.unlocked) {
      levelStats.listening.locked++;
    } else if (prog.listening.status === 'learning' || prog.listening.status === 'new') {
      levelStats.listening.learning++;
    } else if (prog.listening.status === 'review') {
      levelStats.listening.review++;
    } else if (prog.listening.status === 'mastered') {
      levelStats.listening.mastered++;
    }

    // Production status
    if (!prog.production?.unlocked) {
      levelStats.production.locked++;
    } else if (prog.production?.status === 'learning' || prog.production?.status === 'new') {
      levelStats.production.learning++;
    } else if (prog.production?.status === 'review') {
      levelStats.production.review++;
    } else if (prog.production?.status === 'mastered') {
      levelStats.production.mastered++;
    }
  });

  // Get color for a word based on its highest unlocked level
  const getWordColor = (wordId: number) => {
    const prog = progress.get(wordId);
    if (!prog) return 'bg-gray-300 dark:bg-gray-600';

    // Check production first (Master - highest level)
    if (prog.production?.unlocked) {
      if (prog.production.status === 'mastered') return 'bg-duo-green';
      return 'bg-duo-green/70';
    }

    // Then listening (Practice)
    if (prog.listening.unlocked) {
      if (prog.listening.status === 'mastered') return 'bg-duo-purple';
      return 'bg-duo-purple/70';
    }

    // Then reading (Learn)
    if (prog.reading.status === 'mastered') return 'bg-duo-blue';
    return 'bg-duo-blue/70';
  };

  const selectedWordData = selectedWord ? words.find(w => w.id === selectedWord) : null;
  const selectedProgress = selectedWord ? progress.get(selectedWord) : null;

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your learning journey</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
              viewMode === 'stats'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <>
          {/* Word Grid Visualization */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-1">
              {words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(selectedWord === word.id ? null : word.id)}
                  className={`w-3 h-3 rounded-sm transition-all ${getWordColor(word.id)} ${
                    selectedWord === word.id ? 'ring-2 ring-duo-green ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-150' : 'hover:scale-125 hover:brightness-110'
                  }`}
                  title={word.dutch}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
                <span className="text-gray-500 dark:text-gray-400">Not started</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-duo-blue" />
                <span className="text-duo-blue">Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-duo-purple" />
                <span className="text-duo-purple">Practicing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-duo-green" />
                <span className="text-duo-green">Mastering</span>
              </div>
            </div>
          </div>

          {/* Selected Word Details */}
          {selectedWordData && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedWordData.dutch}</p>
                  <p className="text-duo-green font-medium">{selectedWordData.english}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedWordData.partOfSpeech}
                    {selectedWordData.gender && ` • ${selectedWordData.gender}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedProgress ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-duo-blue/10 px-3 py-2 rounded-lg">
                    <span>📖</span>
                    <span className="font-medium text-duo-blue capitalize">{selectedProgress.reading.status}</span>
                    <span className="text-gray-400 ml-auto">{selectedProgress.reading.totalReviews} reviews</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedProgress.listening.unlocked ? 'bg-duo-purple/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <span>{selectedProgress.listening.unlocked ? '✍️' : '🔒'}</span>
                    <span className={`font-medium capitalize ${selectedProgress.listening.unlocked ? 'text-duo-purple' : 'text-gray-400'}`}>
                      {selectedProgress.listening.unlocked ? selectedProgress.listening.status : 'Locked'}
                    </span>
                    {selectedProgress.listening.unlocked && (
                      <span className="text-gray-400 ml-auto">{selectedProgress.listening.totalReviews} reviews</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedProgress.production?.unlocked ? 'bg-duo-green/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <span>{selectedProgress.production?.unlocked ? '🎯' : '🔒'}</span>
                    <span className={`font-medium capitalize ${selectedProgress.production?.unlocked ? 'text-duo-green' : 'text-gray-400'}`}>
                      {selectedProgress.production?.unlocked ? selectedProgress.production.status : 'Locked'}
                    </span>
                    {selectedProgress.production?.unlocked && (
                      <span className="text-gray-400 ml-auto">{selectedProgress.production.totalReviews} reviews</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Not started yet</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Stats View */}
          <div className="space-y-4">
            {/* Overview Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-duo-blue/10 rounded-xl">
                  <p className="text-3xl font-bold text-duo-blue">{progress.size}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Words started</p>
                </div>
                <div className="text-center p-4 bg-duo-green/10 rounded-xl">
                  <p className="text-3xl font-bold text-duo-green">
                    {Array.from(progress.values()).filter(p => p.production?.status === 'mastered').length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fully mastered</p>
                </div>
                <div className="text-center p-4 bg-duo-yellow/10 rounded-xl">
                  <p className="text-3xl font-bold text-duo-yellow">{stats.currentStreak}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Day streak</p>
                </div>
                <div className="text-center p-4 bg-duo-purple/10 rounded-xl">
                  <p className="text-3xl font-bold text-duo-purple">{stats.totalReviewsCompleted}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total reviews</p>
                </div>
              </div>
            </div>

            {/* Stage Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Stage Breakdown</h3>

              {/* Learn (Reading) */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📖</span>
                  <span className="font-medium text-duo-blue">Learn</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-duo-blue/50"
                    style={{ width: `${(levelStats.reading.learning / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-blue/70"
                    style={{ width: `${(levelStats.reading.review / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-blue"
                    style={{ width: `${(levelStats.reading.mastered / 900) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{levelStats.reading.learning + levelStats.reading.review + levelStats.reading.mastered} in stage</span>
                  <span>{levelStats.reading.mastered} complete</span>
                </div>
              </div>

              {/* Practice (Listening) */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✍️</span>
                  <span className="font-medium text-duo-purple">Practice</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-duo-purple/50"
                    style={{ width: `${(levelStats.listening.learning / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-purple/70"
                    style={{ width: `${(levelStats.listening.review / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-purple"
                    style={{ width: `${(levelStats.listening.mastered / 900) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{levelStats.listening.learning + levelStats.listening.review + levelStats.listening.mastered} in stage</span>
                  <span>{levelStats.listening.mastered} complete</span>
                </div>
              </div>

              {/* Master (Production) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium text-duo-green">Master</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-duo-green/50"
                    style={{ width: `${(levelStats.production.learning / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-green/70"
                    style={{ width: `${(levelStats.production.review / 900) * 100}%` }}
                  />
                  <div
                    className="h-full bg-duo-green"
                    style={{ width: `${(levelStats.production.mastered / 900) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{levelStats.production.learning + levelStats.production.review + levelStats.production.mastered} in stage</span>
                  <span>{levelStats.production.mastered} complete</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {[
                  { count: 10, label: 'First Steps', emoji: '👣', desc: 'Start 10 words' },
                  { count: 50, label: 'Getting Started', emoji: '🌱', desc: 'Start 50 words' },
                  { count: 100, label: 'Century', emoji: '💯', desc: 'Start 100 words' },
                  { count: 250, label: 'Quarter Way', emoji: '🎯', desc: 'Start 250 words' },
                  { count: 500, label: 'Halfway There', emoji: '⭐', desc: 'Start 500 words' },
                  { count: 750, label: 'Almost There', emoji: '🚀', desc: 'Start 750 words' },
                  { count: 900, label: 'Champion', emoji: '🏆', desc: 'Complete all words!' },
                ].map(({ count, label, emoji, desc }) => {
                  const achieved = progress.size >= count;
                  return (
                    <div
                      key={count}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        achieved
                          ? 'bg-duo-green/10 border-duo-green/30'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${achieved ? 'text-duo-green' : 'text-gray-500 dark:text-gray-400'}`}>
                          {label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                      </div>
                      {achieved && (
                        <div className="w-8 h-8 bg-duo-green rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Journey;
