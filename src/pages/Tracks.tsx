import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { getChapterProgress } from '../lib/db';

function Tracks() {
  const navigate = useNavigate();
  const [chapterStats, setChapterStats] = useState<Map<number, { started: number; mastered: number; total: number }>>(new Map());
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

      setChapterStats(stats);
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const handleSelectTrack = (chapterId: number) => {
    navigate(`/tracks/${chapterId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-duo-green"></div>
      </div>
    );
  }

  // Only show chapters that have content
  const availableChapters = chapters.filter(c => c.words.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {availableChapters.length} chapters available
        </p>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-3 gap-3">
        {availableChapters.map((chapter) => {
          const stats = chapterStats.get(chapter.id);
          const progress = stats ? Math.round((stats.mastered / stats.total) * 100) : 0;
          const isComplete = progress === 100;
          const hasStarted = stats && stats.started > 0;

          return (
            <button
              key={chapter.id}
              onClick={() => handleSelectTrack(chapter.id)}
              className={`relative p-4 rounded-xl transition-all active:scale-[0.98] ${
                isComplete
                  ? 'bg-duo-green'
                  : hasStarted
                    ? ''
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-duo-green'
              }`}
              style={hasStarted && !isComplete ? { backgroundColor: '#1CB0F6' } : undefined}
            >
              {/* Chapter Number */}
              <p
                className="font-bold text-2xl"
                style={{
                  color: (isComplete || hasStarted) ? '#ffffff' : '#111827'
                }}
              >
                {chapter.id}
              </p>

              {/* Progress indicator */}
              {hasStarted && (
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
    </div>
  );
}

export default Tracks;
