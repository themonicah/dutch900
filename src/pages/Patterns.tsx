import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patterns, categoryInfo, type PatternCategory } from '../data/patterns';
import { getPatternProgressMap } from '../lib/db';
import type { PatternProgress } from '../types';

function Patterns() {
  const navigate = useNavigate();
  const [progressMap, setProgressMap] = useState<Map<number, PatternProgress>>(new Map());

  useEffect(() => {
    const loadProgress = async () => {
      const map = await getPatternProgressMap();
      setProgressMap(map);
    };
    loadProgress();
  }, []);

  // Calculate overall stats
  const totalPatterns = patterns.length;
  let masteredPatterns = 0;
  let totalVariations = 0;
  let masteredVariations = 0;
  let practicedVariations = 0;

  for (const pattern of patterns) {
    totalVariations += pattern.variations.length;
    const progress = progressMap.get(pattern.id);
    if (progress) {
      masteredVariations += progress.masteredCount;
      // Count variations that have been practiced at least once
      practicedVariations += progress.variationProgress.filter(vp => vp.attempts > 0).length;
      if (progress.masteredCount >= progress.totalVariations) {
        masteredPatterns++;
      }
    }
  }

  // Group patterns by category
  const categories: PatternCategory[] = ['commands', 'questions', 'daily', 'emotions'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Parent Dutch
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Master {totalPatterns} patterns to talk to your kids
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {masteredPatterns}/{totalPatterns} patterns mastered
          </span>
        </div>
        {/* Stacked progress bar: practiced (light) + mastered (dark) */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className="absolute h-full bg-duo-green/30 rounded-full transition-all duration-500"
            style={{ width: `${(practicedVariations / totalVariations) * 100}%` }}
          />
          <div
            className="absolute h-full bg-duo-green rounded-full transition-all duration-500"
            style={{ width: `${(masteredVariations / totalVariations) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{practicedVariations}/{totalVariations} practiced</span>
          <span>{masteredVariations}/{totalVariations} mastered (3x correct)</span>
        </div>
      </div>

      {/* Category sections */}
      {categories.map((category) => {
        const info = categoryInfo[category];
        const categoryPatterns = patterns.filter((p) => p.category === category);

        // Calculate category stats
        let categoryMastered = 0;
        for (const pattern of categoryPatterns) {
          const progress = progressMap.get(pattern.id);
          if (progress && progress.masteredCount >= progress.totalVariations) {
            categoryMastered++;
          }
        }

        return (
          <div key={category} className="space-y-3">
            {/* Category header */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{info.icon}</span>
              <h2 className="font-bold text-gray-900 dark:text-white">
                {info.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({categoryMastered}/{categoryPatterns.length})
              </span>
            </div>

            {/* Pattern list */}
            <div className="space-y-2">
              {categoryPatterns.map((pattern) => {
                const progress = progressMap.get(pattern.id);
                const mastered = progress?.masteredCount || 0;
                const practiced = progress?.variationProgress.filter(vp => vp.attempts > 0).length || 0;
                const total = pattern.variations.length;
                const isMastered = mastered >= total;
                const practicedPercent = (practiced / total) * 100;
                const masteredPercent = (mastered / total) * 100;

                return (
                  <button
                    key={pattern.id}
                    onClick={() => navigate(`/patterns/${pattern.id}`)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                      isMastered
                        ? 'bg-duo-green/10 border-2 border-duo-green'
                        : practiced > 0
                        ? 'bg-white dark:bg-gray-800 border-2 border-duo-blue/30'
                        : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    } shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isMastered && <span className="text-duo-green">✓</span>}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {pattern.template}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {practiced > 0 ? `${mastered}/${total} mastered` : `${total} to learn`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {pattern.english}
                    </p>
                    {/* Stacked progress bar */}
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      <div
                        className="absolute h-full bg-duo-blue/30 rounded-full transition-all duration-300"
                        style={{ width: `${practicedPercent}%` }}
                      />
                      <div
                        className={`absolute h-full rounded-full transition-all duration-300 ${
                          isMastered ? 'bg-duo-green' : 'bg-duo-blue'
                        }`}
                        style={{ width: `${masteredPercent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Completion celebration */}
      {masteredPatterns >= totalPatterns && (
        <div className="text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <span className="text-5xl">🎉</span>
          <p className="font-bold text-yellow-600 dark:text-yellow-400 text-xl mt-2">
            Parent Dutch Complete!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've mastered all {totalPatterns} patterns!
          </p>
        </div>
      )}
    </div>
  );
}

export default Patterns;
