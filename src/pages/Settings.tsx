import { useStore } from '../store';

function Settings() {
  const { settings, updateSettings } = useStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Learning Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Learning</h2>

        <div className="space-y-4">
          {/* New cards per day */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New cards per day</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How many new words to learn each day
              </p>
            </div>
            <select
              value={settings.newCardsPerDay}
              onChange={(e) => updateSettings({ newCardsPerDay: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          {/* Reviews per session */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reviews per session</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum reviews in one session
              </p>
            </div>
            <select
              value={settings.reviewsPerSession}
              onChange={(e) => updateSettings({ reviewsPerSession: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>No limit</option>
            </select>
          </div>

          {/* Daily goal */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily goal</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Target reviews per day
              </p>
            </div>
            <select
              value={settings.dailyGoal}
              onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Audio</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-play pronunciation</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Automatically play audio when showing a card
            </p>
          </div>
          <button
            onClick={() => updateSettings({ autoPlayAudio: !settings.autoPlayAudio })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoPlayAudio ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred color scheme
            </p>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Dutch900</strong> - Learn the 900 most common Dutch words</p>
          <p>Using spaced repetition (SM-2 algorithm) for optimal memorization.</p>
          <p className="mt-4">
            Data stored locally in your browser. Your progress is private.
          </p>
        </div>
      </div>

      {/* Reset Progress (dangerous) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 border-red-200 dark:border-red-900">
        <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
              // Clear IndexedDB
              indexedDB.deleteDatabase('dutch900');
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Reset All Progress
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This will delete all your learning progress and start fresh.
        </p>
      </div>
    </div>
  );
}

export default Settings;
