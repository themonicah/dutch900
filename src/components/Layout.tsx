import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../store';

function Layout() {
  const { stats } = useStore();

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;
