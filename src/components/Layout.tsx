import { useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { exportAllData, importAllData } from '../lib/db';

function Layout() {
  const { stats, settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showGearMenu, setShowGearMenu] = useState(false);

  const handleExportData = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dutch900-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importAllData(text);
      alert(`Restored ${result.imported} progress records!`);
      window.location.reload();
    } catch {
      alert('Failed to restore backup. Make sure the file is a valid Dutch900 backup.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Top row with settings button */}
          <div className="flex items-center justify-between">
            <div className="w-10" /> {/* Spacer for balance */}
            <div className="flex items-center gap-2">
              {/* Cute tulip icon */}
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <path d="M16 8c-3 0-5 3-5 6 0 2 1 4 3 5v8h4v-8c2-1 3-3 3-5 0-3-2-6-5-6z" fill="#FF6B6B"/>
                <path d="M13 19v8h6v-8" fill="#58CC02"/>
                <path d="M16 4c-1.5 0-2.5 1.5-2.5 3 0 1 .5 2 1.5 2.5V8c0-1 .5-2 1-2s1 1 1 2v1.5c1-.5 1.5-1.5 1.5-2.5 0-1.5-1-3-2.5-3z" fill="#FF6B6B"/>
                <ellipse cx="11" cy="11" rx="3" ry="4" fill="#FF8E8E"/>
                <ellipse cx="21" cy="11" rx="3" ry="4" fill="#FF8E8E"/>
              </svg>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dutch<span className="text-duo-green">900</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 w-10 justify-end">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-duo-yellow/10 px-2 py-1 rounded-full">
                  <span className="text-sm">🔥</span>
                  <span className="font-bold text-duo-yellow text-sm">{stats.currentStreak}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation bar - sits on border */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 flex justify-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-duo-green text-duo-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/tracks"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-duo-green text-duo-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              Chapters
            </NavLink>

            <NavLink
              to="/sentences"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-duo-green text-duo-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              Sentences
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 space-y-3">
        {/* Links */}
        <div className="text-center space-x-4">
          <button
            onClick={handleExportData}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Backup my learning
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Restore from backup
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all progress? This cannot be undone.')) {
                indexedDB.deleteDatabase('dutch900');
                window.location.reload();
              }
            }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </div>

        {/* Build timestamp */}
        <div className="text-right pr-4">
          <span className="text-xs text-gray-400">
            {new Date(__BUILD_TIME__).toLocaleString()}
          </span>
        </div>
      </footer>

      {/* Gear button - fixed bottom left */}
      <button
        onClick={() => setShowGearMenu(!showGearMenu)}
        className="fixed bottom-4 left-4 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-40"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Gear menu popup */}
      {showGearMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowGearMenu(false)} />

          {/* Menu */}
          <div className="fixed bottom-16 left-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[180px]">
            {/* Hints toggle */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Hints</span>
              <button
                onClick={() => updateSettings({ showMnemonics: !settings.showMnemonics })}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings.showMnemonics ? 'bg-duo-green' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.showMnemonics ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            {/* View all words */}
            <button
              onClick={() => {
                setShowGearMenu(false);
                navigate('/words');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              View all words
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Layout;
