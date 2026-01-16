/**
 * Fuzzy matching utility for scoring user answers
 * Returns 'green' (correct), 'yellow' (close), or 'red' (wrong)
 */

export type ScoreColor = 'green' | 'yellow' | 'red';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalize a string for comparison
 * - lowercase
 * - trim whitespace
 * - remove parenthetical context like "(common)", "(formal)", "(plural)"
 * - remove common articles and prefixes (the, a, an, de, het, to) - but only if there's more content after
 */
function normalize(str: string): string {
  let result = str
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)\s*/g, ' ')  // Remove parenthetical content
    .trim();

  // Only strip article prefix if there's more content after it
  const withoutArticle = result.replace(/^(the|a|an|de|het|to)\s+/i, '').trim();
  if (withoutArticle.length > 0) {
    result = withoutArticle;
  }

  return result;
}

/**
 * Extract core words from a phrase (for matching "search" to "to search, look for")
 */
function extractCoreWords(str: string): string[] {
  const normalized = str
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)\s*/g, ' ');  // Remove parenthetical content
  const words = normalized
    .split(/[\s,;]+/)
    .filter(w => !['the', 'a', 'an', 'de', 'het', 'to', 'for'].includes(w) && w.length > 0);
  return words;
}

/**
 * Check if user input matches any of the correct answers
 * Handles comma-separated alternatives (e.g., "house, home")
 */
function getCorrectAnswers(correctAnswer: string): string[] {
  return correctAnswer
    .split(/[,;]/)
    .map(s => normalize(s))
    .filter(s => s.length > 0);
}

/**
 * Score a user's answer against the correct answer
 *
 * @param userInput - What the user typed
 * @param correctAnswer - The correct answer(s), comma-separated for alternatives
 * @returns 'green' if exact match, 'yellow' if close, 'red' if wrong
 */
export function scoreAnswer(userInput: string, correctAnswer: string): ScoreColor {
  const normalizedInput = normalize(userInput);
  const correctAnswers = getCorrectAnswers(correctAnswer);

  // Empty input is always wrong
  if (!normalizedInput) {
    return 'red';
  }

  // Check for exact match with any correct answer
  for (const correct of correctAnswers) {
    if (normalizedInput === correct) {
      return 'green';
    }
  }

  // Check if input matches any core word from the correct answer (e.g., "search" matches "to search")
  const inputCoreWords = extractCoreWords(userInput);
  const correctCoreWords = extractCoreWords(correctAnswer);

  for (const inputWord of inputCoreWords) {
    for (const correctWord of correctCoreWords) {
      if (inputWord === correctWord) {
        return 'green';
      }
    }
  }

  // Check for close match (Levenshtein distance)
  for (const correct of correctAnswers) {
    const distance = levenshteinDistance(normalizedInput, correct);

    // Allow more tolerance for longer words
    const maxDistance = correct.length <= 4 ? 1 : 2;

    if (distance <= maxDistance) {
      return 'yellow';
    }
  }

  // Check core word similarity
  for (const inputWord of inputCoreWords) {
    for (const correctWord of correctCoreWords) {
      const distance = levenshteinDistance(inputWord, correctWord);
      const maxDistance = correctWord.length <= 4 ? 1 : 2;
      if (distance <= maxDistance) {
        return 'yellow';
      }
    }
  }

  return 'red';
}

/**
 * Get encouraging message based on score
 */
export function getScoreMessage(score: ScoreColor): string {
  const messages = {
    green: ['Nice!', 'Perfect!', 'Excellent!', 'Got it!', 'Well done!'],
    yellow: ['Almost!', 'So close!', 'Nearly there!', 'Good try!', 'Almost got it!'],
    red: ['Keep trying!', 'Not quite...', 'Try again next time!', 'You\'ll get it!']
  };

  const options = messages[score];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get background color class for score
 */
export function getScoreBackground(score: ScoreColor): string {
  switch (score) {
    case 'green':
      return 'bg-green-100 dark:bg-green-900/30';
    case 'yellow':
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'red':
      return 'bg-red-100 dark:bg-red-900/30';
  }
}

/**
 * Get text color for score
 */
export function getScoreTextColor(score: ScoreColor): string {
  switch (score) {
    case 'green':
      return 'text-green-700 dark:text-green-300';
    case 'yellow':
      return 'text-yellow-700 dark:text-yellow-300';
    case 'red':
      return 'text-red-700 dark:text-red-300';
  }
}
