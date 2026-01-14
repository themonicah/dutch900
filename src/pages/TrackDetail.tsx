import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapter } from '../data/chapters';
import { getChapterProgress } from '../lib/db';
import type { ChapterWordProgress } from '../types';

type Stage = 'qualifying' | 'pitradio' | 'victorylap';

function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const chapterId = parseInt(trackId || '1');

  const [stageCounts, setStageCounts] = useState({
    qualifying: 0,
    pitradio: 0,
    victorylap: 0,
    mastered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chapterName, setChapterName] = useState('');
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const chapter = getChapter(chapterId);
      if (!chapter) {
        navigate('/tracks');
        return;
      }

      setChapterName(chapter.name || `Chapter ${chapter.id}`);
      setTotalWords(chapter.words.length);

      const progress = await getChapterProgress(chapterId);
      const progressMap = new Map<number, ChapterWordProgress>();
      progress.forEach(p => progressMap.set(p.wordId, p));

      // Count words in each stage
      let qualifying = 0;
      let pitradio = 0;
      let victorylap = 0;
      let mastered = 0;

      for (const word of chapter.words) {
        const prog = progressMap.get(word.id);
        if (!prog || prog.stage === 'qualifying') {
          qualifying++;
        } else if (prog.stage === 'pitradio') {
          pitradio++;
        } else if (prog.stage === 'victorylap') {
          victorylap++;
        } else if (prog.stage === 'mastered') {
          mastered++;
        }
      }

      setStageCounts({ qualifying, pitradio, victorylap, mastered });
      setIsLoading(false);
    };

    loadData();
  }, [chapterId, navigate]);

  const handleStartMode = (stage: Stage) => {
    navigate(`/tracks/${chapterId}/review/${stage}`);
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
      <div className="flex items-center gap-4">
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
            Chapter {chapterId}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{chapterName}</p>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Practice</h2>

        <div className="space-y-2">
          {/* Learn */}
          <button
            onClick={() => handleStartMode('qualifying')}
            disabled={stageCounts.qualifying === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: stageCounts.qualifying > 0 ? '#1CB0F6' : '#f3f4f6',
              opacity: stageCounts.qualifying > 0 ? 1 : 0.6,
              cursor: stageCounts.qualifying > 0 ? 'pointer' : 'not-allowed',
              border: stageCounts.qualifying > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: stageCounts.qualifying > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-xl">📖</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold" style={{ color: stageCounts.qualifying > 0 ? '#ffffff' : '#6b7280' }}>Learn</p>
              <p className="text-xs" style={{ color: stageCounts.qualifying > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>See Dutch, flip to English</p>
            </div>
            <div className="text-right" style={{ color: stageCounts.qualifying > 0 ? 'rgba(255,255,255,0.9)' : '#9ca3af' }}>
              <p className="text-2xl font-bold">{stageCounts.qualifying}</p>
            </div>
          </button>

          {/* Arrow down */}
          <div className="flex justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Listen */}
          <button
            onClick={() => handleStartMode('pitradio')}
            disabled={stageCounts.pitradio === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: stageCounts.pitradio > 0 ? '#CE82FF' : '#f3f4f6',
              opacity: stageCounts.pitradio > 0 ? 1 : 0.6,
              cursor: stageCounts.pitradio > 0 ? 'pointer' : 'not-allowed',
              border: stageCounts.pitradio > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: stageCounts.pitradio > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-xl">🔊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold" style={{ color: stageCounts.pitradio > 0 ? '#ffffff' : '#6b7280' }}>Listen</p>
              <p className="text-xs" style={{ color: stageCounts.pitradio > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>Hear Dutch, type it</p>
            </div>
            <div className="text-right" style={{ color: stageCounts.pitradio > 0 ? 'rgba(255,255,255,0.9)' : '#9ca3af' }}>
              <p className="text-2xl font-bold">{stageCounts.pitradio}</p>
            </div>
          </button>

          {/* Arrow down */}
          <div className="flex justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Produce */}
          <button
            onClick={() => handleStartMode('victorylap')}
            disabled={stageCounts.victorylap === 0}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: stageCounts.victorylap > 0 ? '#58CC02' : '#f3f4f6',
              opacity: stageCounts.victorylap > 0 ? 1 : 0.6,
              cursor: stageCounts.victorylap > 0 ? 'pointer' : 'not-allowed',
              border: stageCounts.victorylap > 0 ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: stageCounts.victorylap > 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
            >
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold" style={{ color: stageCounts.victorylap > 0 ? '#ffffff' : '#6b7280' }}>Produce</p>
              <p className="text-xs" style={{ color: stageCounts.victorylap > 0 ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>See English, type Dutch</p>
            </div>
            <div className="text-right" style={{ color: stageCounts.victorylap > 0 ? 'rgba(255,255,255,0.9)' : '#9ca3af' }}>
              <p className="text-2xl font-bold">{stageCounts.victorylap}</p>
            </div>
          </button>

          {/* Arrow down */}
          <div className="flex justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Mastered indicator */}
          <div className="p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#FFC800' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <span className="text-xl">⭐</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-white">Mastered</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Complete!</p>
            </div>
            <div className="text-right text-white">
              <p className="text-2xl font-bold">{stageCounts.mastered}</p>
            </div>
          </div>
        </div>

        {/* All mastered! */}
        {stageCounts.mastered === totalWords && (
          <div className="mt-6 text-center py-6 bg-duo-yellow/10 rounded-xl">
            <span className="text-5xl">🏆</span>
            <p className="font-bold text-duo-yellow text-xl mt-2">Chapter Complete!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">All {totalWords} words mastered!</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{stageCounts.mastered} / {totalWords} mastered</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-duo-blue transition-all"
            style={{ width: `${(stageCounts.qualifying / totalWords) * 100}%` }}
          />
          <div
            className="h-full bg-duo-purple transition-all"
            style={{ width: `${(stageCounts.pitradio / totalWords) * 100}%` }}
          />
          <div
            className="h-full bg-duo-green transition-all"
            style={{ width: `${(stageCounts.victorylap / totalWords) * 100}%` }}
          />
          <div
            className="h-full bg-duo-yellow transition-all"
            style={{ width: `${(stageCounts.mastered / totalWords) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>{stageCounts.qualifying} learning</span>
          <span>{stageCounts.pitradio} listening</span>
          <span>{stageCounts.victorylap} producing</span>
          <span>{stageCounts.mastered} done</span>
        </div>
      </div>
    </div>
  );
}

export default TrackDetail;
