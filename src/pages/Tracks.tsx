import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapters, TOTAL_CHAPTERS } from '../data/chapters';
import { getChapterProgress, getRematchWords } from '../lib/db';

function Tracks() {
  const navigate = useNavigate();
  const [chapterStats, setChapterStats] = useState<Map<number, { started: number; mastered: number; total: number }>>(new Map());
  const [rematchCount, setRematchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load chapter progress stats
  useEffect(() => {
    const loadStats = async () => {
      const stats = new Map<number, { started: number; mastered: number; total: number }>();

      for (const chapter of chapters) {
        const progress = await getChapterProgress(chapter.id);
        const mastered = progress.filter(p => p.stage === 'mastered').length;
        stats.set(chapter.id, {
          started: progress.length,
          mastered,
          total: chapter.words.length,
        });
      }

      // Get rematch count
      const rematch = await getRematchWords();
      setRematchCount(rematch.length);

      setChapterStats(stats);
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const handleSelectTrack = (chapterId: number) => {
    navigate(`/tracks/${chapterId}`);
  };

  const handleRematch = () => {
    navigate('/tracks/rematch');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duo-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Chapters
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          42 chapters from your textbook
        </p>
      </div>

      {/* Rematch Button - if there are wrong words */}
      {rematchCount > 0 && (
        <button
          onClick={handleRematch}
          className="w-full p-4 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ backgroundColor: '#FFC800' }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-lg" style={{ color: '#ffffff' }}>Review Mistakes</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Words you missed from all chapters</p>
          </div>
          <div className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span className="font-bold text-lg" style={{ color: '#ffffff' }}>{rematchCount}</span>
          </div>
        </button>
      )}

      {/* Chapter Grid */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).map((trackNum) => {
          const chapter = chapters.find(c => c.id === trackNum);
          const stats = chapterStats.get(trackNum);
          const isAvailable = !!chapter;
          const progress = stats ? Math.round((stats.mastered / stats.total) * 100) : 0;
          const isComplete = progress === 100;

          return (
            <button
              key={trackNum}
              onClick={() => isAvailable && handleSelectTrack(trackNum)}
              disabled={!isAvailable}
              className={`relative p-4 rounded-xl transition-all ${
                isAvailable
                  ? isComplete
                    ? 'bg-duo-green hover:bg-duo-green-dark active:scale-[0.98]'
                    : stats && stats.started > 0
                      ? 'active:scale-[0.98]'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-duo-green active:scale-[0.98]'
                  : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
              }`}
              style={isAvailable && stats && stats.started > 0 && !isComplete ? { backgroundColor: '#1CB0F6' } : undefined}
            >
              {/* Chapter Number */}
              <p
                className="font-bold text-2xl"
                style={{
                  color: isAvailable
                    ? (isComplete || (stats && stats.started > 0))
                      ? '#ffffff'
                      : '#111827'
                    : '#9ca3af'
                }}
              >
                {trackNum}
              </p>

              {/* Progress indicator */}
              {isAvailable && stats && stats.started > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.9)' }}
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {stats.mastered}/{stats.total}
                  </p>
                </div>
              )}

              {/* Locked indicator */}
              {!isAvailable && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">🔒</p>
              )}

              {/* Complete badge */}
              {isComplete && (
                <div className="absolute -top-1 -right-1 bg-duo-yellow text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                  <span className="text-sm">⭐</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
          <span>Not started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-duo-blue" />
          <span>In progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-duo-green" />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}

export default Tracks;
