import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapter } from '../data/chapters';
import { getAllModeProgress } from '../lib/db';
import type { PracticeMode, WordModeProgress } from '../types';

interface ModeStats {
  green: number;
  yellow: number;
  red: number;
}

function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const chapterId = parseInt(trackId || '1');

  const [isLoading, setIsLoading] = useState(true);
  const [chapterName, setChapterName] = useState('');
  const [totalWords, setTotalWords] = useState(0);
  const [modeStats, setModeStats] = useState<Record<PracticeMode, ModeStats>>({
    learn: { green: 0, yellow: 0, red: 0 },
    listen: { green: 0, yellow: 0, red: 0 },
    produce: { green: 0, yellow: 0, red: 0 },
  });

  useEffect(() => {
    const loadData = async () => {
      const chapter = getChapter(chapterId);
      if (!chapter) {
        navigate('/tracks');
        return;
      }

      setChapterName(chapter.name || `Chapter ${chapter.id}`);
      setTotalWords(chapter.words.length);

      // Get word IDs for this chapter
      const wordIds = new Set(chapter.words.map(w => w.id));

      // Load stats for each mode, filtered by chapter words
      const [learnProgress, listenProgress, produceProgress] = await Promise.all([
        getAllModeProgress('learn'),
        getAllModeProgress('listen'),
        getAllModeProgress('produce'),
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

      setIsLoading(false);
    };

    loadData();
  }, [chapterId, navigate]);

  const handleStartMode = (mode: PracticeMode) => {
    navigate(`/tracks/${chapterId}/review/${mode}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duo-green"></div>
      </div>
    );
  }

  const modes = [
    { id: 'learn' as PracticeMode, name: 'Learn', icon: '📖', color: '#1CB0F6', desc: 'See Dutch, type English' },
    { id: 'listen' as PracticeMode, name: 'Listen', icon: '🔊', color: '#CE82FF', desc: 'Hear Dutch, type Dutch' },
    { id: 'produce' as PracticeMode, name: 'Produce', icon: '🎯', color: '#58CC02', desc: 'See English, type Dutch' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/tracks"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {chapterName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalWords} words</p>
        </div>
      </div>

      {/* Practice Mode Tiles - Side by Side */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const stats = modeStats[mode.id];
          const practiced = stats.green + stats.yellow + stats.red;

          return (
            <button
              key={mode.id}
              onClick={() => handleStartMode(mode.id)}
              className="flex flex-col items-center p-4 rounded-2xl transition-all active:scale-[0.97] shadow-sm"
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
              <div className="flex items-center gap-3 text-xs text-white/90">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="#22c55e"/>
                  </svg>
                  {stats.green}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="#eab308"/>
                  </svg>
                  {stats.yellow}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="#ef4444"/>
                  </svg>
                  {stats.red}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TrackDetail;
