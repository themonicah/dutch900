import { useStore } from '../store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal - Racing Style */}
      <div className="relative bg-racing-black rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto border-2 border-racing-yellow/30">
        {/* Header */}
        <div className="sticky top-0 bg-racing-black px-5 py-4 border-b border-racing-yellow/30 flex items-center justify-between">
          <h2 className="text-lg font-racing text-racing-yellow tracking-wider">⚙️ PIT SETTINGS</h2>
          <button
            onClick={onClose}
            className="p-1 text-white/50 hover:text-racing-yellow transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Wave Size */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-racing text-white text-sm tracking-wider">🏎️ WAVE SIZE</p>
              <p className="text-xs text-white/50">Words to master before adding new ones</p>
            </div>
            <select
              value={settings.waveSize}
              onChange={(e) => updateSettings({ waveSize: Number(e.target.value) })}
              className="px-3 py-1.5 text-sm rounded-lg border border-racing-yellow/30 bg-gray-800 text-white font-racing"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* New cards per day */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-racing text-white text-sm tracking-wider">📥 NEW WORDS/DAY</p>
            </div>
            <select
              value={settings.newCardsPerDay}
              onChange={(e) => updateSettings({ newCardsPerDay: Number(e.target.value) })}
              className="px-3 py-1.5 text-sm rounded-lg border border-racing-yellow/30 bg-gray-800 text-white font-racing"
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
              <p className="font-racing text-white text-sm tracking-wider">🔄 REVIEWS/SESSION</p>
            </div>
            <select
              value={settings.reviewsPerSession}
              onChange={(e) => updateSettings({ reviewsPerSession: Number(e.target.value) })}
              className="px-3 py-1.5 text-sm rounded-lg border border-racing-yellow/30 bg-gray-800 text-white font-racing"
            >
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Auto-play audio */}
          <div className="flex items-center justify-between">
            <p className="font-racing text-white text-sm tracking-wider">🔊 AUTO-PLAY AUDIO</p>
            <button
              onClick={() => updateSettings({ autoPlayAudio: !settings.autoPlayAudio })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoPlayAudio ? 'bg-racing-green' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <p className="font-racing text-white text-sm tracking-wider">🎨 THEME</p>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
              className="px-3 py-1.5 text-sm rounded-lg border border-racing-yellow/30 bg-gray-800 text-white font-racing"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Divider */}
          <hr className="border-racing-yellow/20" />

          {/* Reset */}
          <div>
            <button
              onClick={() => {
                if (window.confirm('Reset all progress? This cannot be undone.')) {
                  indexedDB.deleteDatabase('dutch900');
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-2 text-sm text-racing-red border border-racing-red/50 rounded-lg hover:bg-racing-red/10 transition-colors font-racing tracking-wider"
            >
              🚨 RESET ALL PROGRESS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
