import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getModeStats, getAllModeProgress } from '../lib/db';
import type { ModeStats, PracticeMode, WordModeProgress } from '../types';

function Today() {
  const navigate = useNavigate();
  const { words } = useStore();

  const [modeStats, setModeStats] = useState<Record<PracticeMode, ModeStats>>({
    learn: { green: 0, yellow: 0, red: 0, new: 0 },
    listen: { green: 0, yellow: 0, red: 0, new: 0 },
    produce: { green: 0, yellow: 0, red: 0, new: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showWordList, setShowWordList] = useState(false);
  const [wordProgress, setWordProgress] = useState<Map<number, { correct: number; wrong: number; status: string }>>(new Map());

  const totalWords = words.length;
  const validWordIds = new Set(words.map(w => w.id));

  // Load mode stats
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const [learnStats, listenStats, produceStats] = await Promise.all([
        getModeStats('learn', totalWords, validWordIds),
        getModeStats('listen', totalWords, validWordIds),
        getModeStats('produce', totalWords, validWordIds),
      ]);
      setModeStats({
        learn: learnStats,
        listen: listenStats,
        produce: produceStats,
      });
      setIsLoading(false);
    };
    loadStats();
  }, [totalWords]);

  // Load word progress when modal opens
  useEffect(() => {
    if (!showWordList) return;
    const load = async () => {
      const [learn, listen, produce] = await Promise.all([
        getAllModeProgress('learn'),
        getAllModeProgress('listen'),
        getAllModeProgress('produce'),
      ]);
      const map = new Map<number, { correct: number; wrong: number; status: string }>();
      const merge = (list: WordModeProgress[]) => {
        for (const p of list) {
          const existing = map.get(p.wordId);
          if (existing) {
            existing.correct += (p.correctCount || 0);
            existing.wrong += (p.wrongCount || 0);
          } else {
            map.set(p.wordId, {
              correct: p.correctCount || 0,
              wrong: p.wrongCount || 0,
              status: p.status,
            });
          }
        }
      };
      merge(learn);
      merge(listen);
      merge(produce);
      setWordProgress(map);
    };
    load();
  }, [showWordList]);

  // Handle starting a practice mode
  const handleStartMode = (mode: PracticeMode) => {
    navigate(`/review/${mode}`);
  };

  // Calculate total greens across all modes (for overall progress)
  const totalGreens = modeStats.learn.green + modeStats.listen.green + modeStats.produce.green;

  const modes = [
    { id: 'learn' as PracticeMode, name: 'Learn', icon: '📖', color: '#1CB0F6', desc: 'See Dutch, type English' },
    { id: 'listen' as PracticeMode, name: 'Listen', icon: '🔊', color: '#CE82FF', desc: 'Hear Dutch, type Dutch' },
    { id: 'produce' as PracticeMode, name: 'Translate', icon: '🎯', color: '#58CC02', desc: 'See English, type Dutch' },
  ];

  // Sort words for the modal: seen words by most missed, unseen at bottom
  const sortedWords = [...words].sort((a, b) => {
    const pa = wordProgress.get(a.id);
    const pb = wordProgress.get(b.id);
    const seenA = pa && (pa.correct + pa.wrong > 0);
    const seenB = pb && (pb.correct + pb.wrong > 0);
    if (seenA && !seenB) return -1;
    if (!seenA && seenB) return 1;
    if (!seenA && !seenB) return a.rank - b.rank;
    return (pb!.wrong - pb!.correct) - (pa!.wrong - pa!.correct);
  });

  return (
    <div className="min-h-[70vh] flex flex-col justify-center space-y-6">
      {/* Intro */}
      <div className="text-center px-4">
        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Master the most common Dutch words
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          3 modes to practice
        </p>
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
              className="flex flex-col items-center p-4 rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-sm hover:scale-105 hover:shadow-lg hover:-translate-y-1"
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
              {!isLoading && (
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
              )}
            </button>
          );
        })}
      </div>

      {/* All words mastered celebration */}
      {totalGreens >= totalWords * 3 && (
        <div className="text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <span className="text-5xl">🏆</span>
          <p className="font-bold text-yellow-600 dark:text-yellow-400 text-xl mt-2">Champion!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">All {totalWords} words mastered in all modes!</p>
        </div>
      )}

      {/* Word List Link */}
      <div className="text-center">
        <button
          onClick={() => setShowWordList(true)}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          View all words
        </button>
      </div>

      {/* Word List Modal */}
      {showWordList && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-8 pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Words</h2>
              <button
                onClick={() => setShowWordList(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Word List */}
            <div className="overflow-y-auto flex-1 p-2">
              {sortedWords.map((word) => {
                const prog = wordProgress.get(word.id);
                const seen = prog && (prog.correct + prog.wrong > 0);

                return (
                  <div
                    key={word.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      seen ? '' : 'opacity-40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{word.dutch}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">{word.english}</span>
                    </div>
                    {seen && (
                      <div className="flex items-center gap-3 text-xs ml-2 shrink-0">
                        <span className="text-green-500">{prog!.correct}</span>
                        <span className="text-red-500">{prog!.wrong}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Today;
