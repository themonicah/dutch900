import { useStore } from '../store';

function Progress() {
  const { words, progress, stats } = useStore();

  // Calculate stats
  const totalWords = words.length;
  const wordsStarted = progress.size;
  const wordsLearning = Array.from(progress.values()).filter(
    (p) => p.reading.status === 'learning'
  ).length;
  const wordsReview = Array.from(progress.values()).filter(
    (p) => p.reading.status === 'review'
  ).length;
  const wordsMastered = Array.from(progress.values()).filter(
    (p) => p.reading.status === 'mastered'
  ).length;

  // Listening stats
  const listeningUnlocked = Array.from(progress.values()).filter(
    (p) => p.listening.unlocked
  ).length;
  const listeningMastered = Array.from(progress.values()).filter(
    (p) => p.listening.status === 'mastered'
  ).length;

  // Calculate accuracy
  const totalReviews = stats.totalReviewsCompleted;
  const allProgress = Array.from(progress.values());
  const totalCorrect = allProgress.reduce(
    (sum, p) => sum + p.reading.correctCount + (p.listening.unlocked ? p.listening.correctCount : 0),
    0
  );
  const totalAttempts = allProgress.reduce(
    (sum, p) => sum + p.reading.totalReviews + (p.listening.unlocked ? p.listening.totalReviews : 0),
    0
  );
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Progress</h1>

      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{stats.currentStreak}</p>
            <p className="text-sm opacity-90">Current Streak</p>
          </div>
          <span className="text-5xl">🔥</span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm opacity-90">
            Best streak: <span className="font-semibold">{stats.longestStreak} days</span>
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Reading Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{wordsStarted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Words Started</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-green-500">{wordsMastered}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mastered</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-500">{wordsLearning}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Learning</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-blue-500">{wordsReview}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reviewing</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((wordsStarted / totalWords) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(wordsMastered / totalWords) * 100}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(wordsReview / totalWords) * 100}%` }}
              />
              <div
                className="bg-yellow-500 transition-all"
                style={{ width: `${(wordsLearning / totalWords) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Mastered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Reviewing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Learning
            </span>
          </div>
        </div>
      </div>

      {/* Listening Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">🎧 Listening Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-purple-500">{listeningUnlocked}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unlocked</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-green-500">{listeningMastered}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mastered</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Listening mode unlocks after 3+ successful reading reviews for each word.
        </p>
      </div>

      {/* Accuracy & Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Performance</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-primary-500">{accuracy}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalReviews}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Word List</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {words.slice(0, 50).map((word) => {
            const p = progress.get(word.id);
            const status = p?.reading.status || 'new';
            const statusColors = {
              new: 'bg-gray-200 dark:bg-gray-600',
              learning: 'bg-yellow-200 dark:bg-yellow-700',
              review: 'bg-blue-200 dark:bg-blue-700',
              mastered: 'bg-green-200 dark:bg-green-700',
            };

            return (
              <div
                key={word.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-400 w-6">
                    {word.rank}
                  </span>
                  <span className="font-medium">{word.dutch}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {word.english}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
        {words.length > 50 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Showing first 50 of {words.length} words
          </p>
        )}
      </div>
    </div>
  );
}

export default Progress;
