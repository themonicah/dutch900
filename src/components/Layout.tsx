import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import SettingsModal from './SettingsModal';

function Layout() {
  const { stats } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Clean Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇱</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dutch<span className="text-duo-green">900</span>
              </h1>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation - Clean Style */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-duo-green bg-duo-green/10'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span className="text-xs mt-1 font-medium">Home</span>
            </NavLink>

            <NavLink
              to="/tracks"
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-duo-green bg-duo-green/10'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
              </svg>
              <span className="text-xs mt-1 font-medium">Chapters</span>
            </NavLink>

            <NavLink
              to="/journey"
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-duo-green bg-duo-green/10'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              <span className="text-xs mt-1 font-medium">Stats</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default Layout;
