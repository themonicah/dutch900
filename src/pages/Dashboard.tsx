import { Link } from 'react-router-dom';
import { useStore } from '../store';

function Dashboard() {
  const { words, progress, stats, settings } = useStore();

  // Calculate stats
  const totalWords = words.length;
  const wordsStarted = progress.size;
  // A word is truly mastered when it's completed all three levels
  const wordsMastered = Array.from(progress.values()).filter(
    (p) => p.production?.status === 'mastered'
  ).length;

  // Count due cards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const readingDue = Array.from(progress.values()).filter(
    (p) => p.reading.dueDate <= todayStr && p.reading.status !== 'new'
  ).length;

  const listeningDue = Array.from(progress.values()).filter(
    (p) => p.listening.unlocked && p.listening.dueDate <= todayStr
  ).length;

  const productionDue = Array.from(progress.values()).filter(
    (p) => p.production?.unlocked && p.production.dueDate <= todayStr
  ).length;

  // Count unlocked modes
  const listeningUnlocked = Array.from(progress.values()).filter(
    (p) => p.listening.unlocked
  ).length;

  const productionUnlocked = Array.from(progress.values()).filter(
    (p) => p.production?.unlocked
  ).length;

  const newCardsAvailable = totalWords - wordsStarted;

  // Progress percentage
  const progressPercent = Math.round((wordsStarted / totalWords) * 100);

  return (
    <div className="space-y-6">
      {/* Streak Banner */}
      {stats.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak} Day Streak!</p>
              <p className="text-sm opacity-90">Keep it going!</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Your Progress</h2>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{wordsStarted} / {totalWords} words</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-500">{wordsStarted}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Learning</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{wordsMastered}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mastered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500">{stats.totalReviewsCompleted}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
          </div>
        </div>
      </div>

      {/* Learning Modes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Practice Modes</h2>

        {/* Learn New Words */}
        <Link
          to="/learn"
          className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📚</div>
            <div className="flex-1">
              <h3 className="font-semibold">Learn New Words</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {newCardsAvailable > 0
                  ? `${Math.min(newCardsAvailable, settings.newCardsPerDay)} new words available`
                  : 'All 900 words started!'}
              </p>
            </div>
            <div className="text-primary-500">→</div>
          </div>
        </Link>

        {/* Level 1: Reading */}
        <Link
          to="/review/reading"
          className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📖</div>
            <div className="flex-1">
              <h3 className="font-semibold">Level 1: Reading</h3>
              <p className="text-xs text-blue-500 mb-1">Dutch → English</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {readingDue > 0 ? `${readingDue} cards due` : 'All caught up!'}
              </p>
            </div>
            {readingDue > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {readingDue}
              </span>
            )}
          </div>
        </Link>

        {/* Level 2: Listening */}
        <Link
          to="/review/listening"
          className={`block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-shadow border-l-4 ${
            listeningUnlocked > 0
              ? 'border-purple-500 hover:shadow-md'
              : 'border-gray-300 dark:border-gray-600 opacity-60'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎧</div>
            <div className="flex-1">
              <h3 className="font-semibold">Level 2: Listening</h3>
              <p className="text-xs text-purple-500 mb-1">Audio → Dutch recall</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {listeningUnlocked > 0
                  ? listeningDue > 0
                    ? `${listeningDue} cards due`
                    : `${listeningUnlocked} words unlocked`
                  : 'Complete 3+ reading reviews to unlock'}
              </p>
            </div>
            {listeningDue > 0 && (
              <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {listeningDue}
              </span>
            )}
          </div>
        </Link>

        {/* Level 3: Production */}
        <Link
          to="/review/production"
          className={`block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-shadow border-l-4 ${
            productionUnlocked > 0
              ? 'border-green-500 hover:shadow-md'
              : 'border-gray-300 dark:border-gray-600 opacity-60'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">✏️</div>
            <div className="flex-1">
              <h3 className="font-semibold">Level 3: Production</h3>
              <p className="text-xs text-green-500 mb-1">English → Dutch recall + audio</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {productionUnlocked > 0
                  ? productionDue > 0
                    ? `${productionDue} cards due`
                    : `${productionUnlocked} words unlocked`
                  : 'Complete 3+ listening reviews to unlock'}
              </p>
            </div>
            {productionDue > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {productionDue}
              </span>
            )}
          </div>
        </Link>

        {/* Stats */}
        <Link
          to="/progress"
          className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📊</div>
            <div className="flex-1">
              <h3 className="font-semibold">Statistics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View detailed progress
              </p>
            </div>
            <div className="text-primary-500">→</div>
          </div>
        </Link>
      </div>

      {/* Daily Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Today's Goal</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 * (1 - Math.min(1, stats.totalReviewsCompleted / settings.dailyGoal))}
                className="text-primary-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {Math.min(100, Math.round((stats.totalReviewsCompleted / settings.dailyGoal) * 100))}%
            </span>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {Math.min(stats.totalReviewsCompleted, settings.dailyGoal)}
              </span>
              {' '}/{' '}{settings.dailyGoal} reviews
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {stats.totalReviewsCompleted >= settings.dailyGoal
                ? 'Goal reached!'
                : `${settings.dailyGoal - stats.totalReviewsCompleted} more to go`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
