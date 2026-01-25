import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { chapters, getChapter } from '../data/chapters';
import { getAllModeProgress, getAllTroubledWordCounts } from '../lib/db';
import type { PracticeMode, WordModeProgress } from '../types';

interface ModeStats {
  green: number;
  yellow: number;
  red: number;
}

function Tracks() {
  const navigate = useNavigate();
  const { trackId } = useParams<{ trackId: string }>();

  // Only show chapters that have content
  const availableChapters = chapters.filter(c => c.words.length > 0);

  // Default to first available chapter if none selected
  const [selectedChapter, setSelectedChapter] = useState<number>(
    trackId ? parseInt(trackId) : availableChapters[0]?.id || 1
  );

  const [isLoading, setIsLoading] = useState(true);
  const [modeStats, setModeStats] = useState<Record<PracticeMode, ModeStats>>({
    learn: { green: 0, yellow: 0, red: 0 },
    listen: { green: 0, yellow: 0, red: 0 },
    produce: { green: 0, yellow: 0, red: 0 },
  });
  const [troubledCounts, setTroubledCounts] = useState<Record<PracticeMode, number>>({
    learn: 0,
    listen: 0,
    produce: 0,
  });

  const chapter = getChapter(selectedChapter);
  const totalWords = chapter?.words.length || 0;

  // Update URL when chapter changes
  useEffect(() => {
    if (selectedChapter && trackId !== String(selectedChapter)) {
      navigate(`/tracks/${selectedChapter}`, { replace: true });
    }
  }, [selectedChapter, trackId, navigate]);

  // Load mode stats for selected chapter
  useEffect(() => {
    const loadStats = async () => {
      if (!chapter) return;

      setIsLoading(true);
      const wordIds = new Set(chapter.words.map(w => w.id));

      const [learnProgress, listenProgress, produceProgress, troubled] = await Promise.all([
        getAllModeProgress('learn'),
        getAllModeProgress('listen'),
        getAllModeProgress('produce'),
        getAllTroubledWordCounts(),
      ]);

      const calcStats = (progress: WordModeProgress[]): ModeStats => {
        const filtered = progress.filter(p => wordIds.has(p.wordId));
        return {
          green: filtered.filter(p => p.status === 'green').length,
          yellow: filtered.filter(p => p.status === 'yellow').length,
          red: filtered.filter(p => p.status === 'red').length,
        };
      };

      setModeStats({
        learn: calcStats(learnProgress),
        listen: calcStats(listenProgress),
        produce: calcStats(produceProgress),
      });

      setTroubledCounts(troubled);

      setIsLoading(false);
    };

    loadStats();
  }, [selectedChapter, chapter]);

  const handleStartMode = (mode: PracticeMode) => {
    navigate(`/tracks/${selectedChapter}/review/${mode}`);
  };

  const modes = [
    { id: 'learn' as PracticeMode, name: 'Learn', icon: '📖', color: '#1CB0F6', desc: 'See Dutch, type English' },
    { id: 'listen' as PracticeMode, name: 'Listen', icon: '🔊', color: '#CE82FF', desc: 'Hear Dutch, type Dutch' },
    { id: 'produce' as PracticeMode, name: 'Translate', icon: '🎯', color: '#58CC02', desc: 'See English, type Dutch' },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col justify-center space-y-6">
      {/* Explanation */}
      <p className="text-center text-sm text-gray-400 dark:text-gray-500 px-4">
        Vocabulary organized by chapter from the green textbook
      </p>

      {/* Chapter Pills */}
      <div className="flex justify-center gap-2 flex-wrap">
        {availableChapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChapter(ch.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedChapter === ch.id
                ? 'bg-duo-green text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-duo-green'
            }`}
          >
            Ch {ch.id}
          </button>
        ))}
      </div>

      {/* Chapter Info */}
      {chapter && (
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Chapter {chapter.id}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalWords} words</p>
        </div>
      )}

      {/* Practice Mode Tiles */}
      {!isLoading && chapter && (
        <div className="grid grid-cols-3 gap-3">
          {modes.map((mode) => {
            const stats = modeStats[mode.id];
            const practiced = stats.green + stats.yellow + stats.red;
            const troubledCount = troubledCounts[mode.id];

            return (
              <div key={mode.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleStartMode(mode.id)}
                  className="w-full flex flex-col items-center p-4 rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-sm hover:scale-105 hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: mode.color }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <span className="text-2xl">{mode.icon}</span>
                  </div>

                  {/* Mode Name */}
                  <p className="font-bold text-white text-sm mb-1">{mode.name}</p>

                  {/* Progress indicator */}
                  <p className="text-xs text-white/70 mb-2">{practiced}/{totalWords}</p>

                  {/* Stats row with colored circles */}
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#22c55e"/>
                      </svg>
                      {stats.green}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#eab308"/>
                      </svg>
                      {stats.yellow}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#ef4444"/>
                      </svg>
                      {stats.red}
                    </span>
                  </div>
                </button>

                {/* Review troubled words link - only show when 5+ words */}
                {troubledCount >= 5 && (
                  <Link
                    to={`/review-troubled/${mode.id}`}
                    className="mt-2 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Review {troubledCount}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-duo-green"></div>
        </div>
      )}
    </div>
  );
}

export default Tracks;
