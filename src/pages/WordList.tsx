import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getAllModeProgress } from '../lib/db';
import type { WordModeProgress } from '../types';

function WordList() {
  const { words } = useStore();
  const [wordProgress, setWordProgress] = useState<Map<number, { correct: number; wrong: number }>>(new Map());

  useEffect(() => {
    const load = async () => {
      const [learn, listen, produce] = await Promise.all([
        getAllModeProgress('learn'),
        getAllModeProgress('listen'),
        getAllModeProgress('produce'),
      ]);
      const map = new Map<number, { correct: number; wrong: number }>();
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
  }, []);

  // Sort: seen words by most missed first, unseen at bottom
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">All Words</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sortedWords.map((word) => {
          const prog = wordProgress.get(word.id);
          const seen = prog && (prog.correct + prog.wrong > 0);

          return (
            <div
              key={word.id}
              className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                seen ? '' : 'opacity-40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{word.dutch}</span>
                <span className="text-gray-400 dark:text-gray-500 text-sm ml-2 truncate">{word.english}</span>
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
  );
}

export default WordList;
