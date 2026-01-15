import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import SettingsModal from './SettingsModal';

function Layout() {
  const { stats } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇱</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dutch<span className="text-duo-green">900</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-duo-yellow/10 px-3 py-1.5 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="font-bold text-duo-yellow">{stats.currentStreak}</span>
              </div>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Top Navigation - Home & Chapters */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
                `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-duo-green text-duo-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              Chapters
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default Layout;
