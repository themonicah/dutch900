import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { initDutchVoice } from './lib/audio';
import Layout from './components/Layout';
import Today from './pages/Today';
import Journey from './pages/Journey';
import Review from './pages/Review';
import Tracks from './pages/Tracks';
import TrackReview from './pages/TrackReview';
import WordList from './pages/WordList';

function App() {
  const { loadData, isLoaded, settings } = useStore();

  useEffect(() => {
    // Load data from IndexedDB
    loadData();

    // Initialize Dutch voice for TTS
    initDutchVoice();
  }, [loadData]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="journey" element={<Journey />} />
        <Route path="review/:mode" element={<Review />} />
        <Route path="tracks" element={<Tracks />} />
        <Route path="tracks/:trackId" element={<Tracks />} />
        <Route path="tracks/:trackId/review/:stage" element={<TrackReview />} />
        <Route path="words" element={<WordList />} />
        {/* Redirect old routes */}
        <Route path="learn" element={<Navigate to="/" replace />} />
        <Route path="review" element={<Navigate to="/" replace />} />
        <Route path="progress" element={<Navigate to="/journey" replace />} />
        <Route path="settings" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
