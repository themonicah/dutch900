/**
 * Fuzzy matching utility for scoring user answers
 * Returns 'green' (correct), 'yellow' (close), or 'red' (wrong)
 */

export type ScoreColor = 'green' | 'yellow' | 'red';

/**
 * Common spelling variants (American vs British, etc.)
 * Each array contains words that should be considered equivalent
 */
const SPELLING_VARIANTS: string[][] = [
  ['gray', 'grey'],
  ['color', 'colour'],
  ['favor', 'favour'],
  ['neighbor', 'neighbour'],
  ['center', 'centre'],
  ['theater', 'theatre'],
  ['realize', 'realise'],
  ['organize', 'organise'],
  ['analyze', 'analyse'],
  ['traveling', 'travelling'],
  ['canceled', 'cancelled'],
  ['labeled', 'labelled'],
  ['modeling', 'modelling'],
  ['defense', 'defence'],
  ['offense', 'offence'],
  ['license', 'licence'],
  ['practice', 'practise'],
  ['catalog', 'catalogue'],
  ['dialog', 'dialogue'],
  ['program', 'programme'],
  ['check', 'cheque'],
  ['mom', 'mum'],
  ['airplane', 'aeroplane'],
  ['donut', 'doughnut'],
];

// Build a map for quick lookup
const variantMap = new Map<string, string[]>();
for (const variants of SPELLING_VARIANTS) {
  for (const word of variants) {
    variantMap.set(word.toLowerCase(), variants.map(v => v.toLowerCase()));
  }
}

/**
 * Common synonyms that should be accepted as correct
 * Each array contains words/phrases that mean the same thing
 */
const SYNONYMS: string[][] = [
  ['bike', 'bicycle', 'cycle', 'to cycle', 'to bike'],
  ['car', 'automobile', 'auto'],
  ['mom', 'mother', 'mum'],
  ['dad', 'father'],
  ['kid', 'child'],
  ['kids', 'children'],
  ['big', 'large'],
  ['small', 'little'],
  ['happy', 'glad'],
  ['sad', 'unhappy'],
  ['fast', 'quick'],
  ['slow', 'slowly'],
  ['start', 'begin', 'to start', 'to begin'],
  ['end', 'finish', 'to end', 'to finish'],
  ['buy', 'purchase', 'to buy', 'to purchase'],
  ['sell', 'to sell'],
  ['speak', 'talk', 'to speak', 'to talk'],
  ['see', 'to see', 'look', 'to look'],
  ['hear', 'to hear', 'listen', 'to listen'],
  ['eat', 'to eat'],
  ['drink', 'to drink'],
  ['walk', 'to walk'],
  ['run', 'to run'],
  ['sleep', 'to sleep'],
  ['work', 'to work'],
  ['play', 'to play'],
  ['read', 'to read'],
  ['write', 'to write'],
  ['give', 'to give'],
  ['take', 'to take'],
  ['come', 'to come'],
  ['go', 'to go'],
  ['make', 'to make'],
  ['get', 'to get'],
  ['want', 'to want'],
  ['need', 'to need'],
  ['know', 'to know'],
  ['think', 'to think'],
  ['feel', 'to feel'],
  ['try', 'to try'],
  ['leave', 'to leave'],
  ['call', 'to call'],
  ['ask', 'to ask'],
  ['tell', 'to tell'],
  ['say', 'to say'],
  ['help', 'to help'],
  ['show', 'to show'],
  ['turn', 'to turn'],
  ['move', 'to move'],
  ['live', 'to live'],
  ['believe', 'to believe'],
  ['hold', 'to hold'],
  ['bring', 'to bring'],
  ['happen', 'to happen'],
  ['must', 'have to'],
  ['should', 'ought to'],
  ['can', 'to be able to'],
  ['maybe', 'perhaps'],
  ['also', 'too', 'as well'],
  ['very', 'really'],
  ['now', 'right now'],
  ['then', 'at that time'],
  ['here', 'over here'],
  ['there', 'over there'],
  ['hi', 'hello'],
  ['bye', 'goodbye'],
  ['yeah', 'yes'],
  ['nope', 'no'],
  ['ok', 'okay', 'alright'],
  ['fall', 'autumn'],
  ['scarf', 'shawl'],
  ['sofa', 'couch'],
  ['pants', 'trousers'],
  ['apartment', 'flat'],
  ['elevator', 'lift'],
  ['trash', 'garbage', 'rubbish'],
  ['cookie', 'biscuit'],
  ['fries', 'chips'],
  ['movie', 'film'],
  ['store', 'shop'],
  ['sidewalk', 'pavement'],
  ['line', 'queue'],
  ['couch', 'sofa'],
  ['hello', 'hi', 'goodbye', 'bye'],
  ['stupid', 'dumb'],
  ['certain', 'sure', 'certainly'],
  ['below', 'beneath', 'underneath', 'downstairs'],
];

// Build synonym map
const synonymMap = new Map<string, string[]>();
for (const synonyms of SYNONYMS) {
  for (const word of synonyms) {
    synonymMap.set(word.toLowerCase(), synonyms.map(s => s.toLowerCase()));
  }
}

/**
 * Check if two words/phrases are synonyms
 */
function areSynonyms(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  if (w1 === w2) return true;

  const synonyms = synonymMap.get(w1);
  return synonyms ? synonyms.includes(w2) : false;
}

/**
 * Check if two words are equivalent spelling variants
 */
function areSpellingVariants(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  if (w1 === w2) return true;

  const variants = variantMap.get(w1);
  return variants ? variants.includes(w2) : false;
}

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
 * - remove accents/diacritics (café -> cafe)
 * - remove parenthetical context like "(common)", "(formal)", "(plural)"
 * - remove common articles and prefixes (the, a, an, de, het, to) - but only if there's more content after
 */
function normalize(str: string): string {
  let result = str
    .toLowerCase()
    .trim()
    .normalize('NFD')                     // Decompose accented characters (é -> e + ́)
    .replace(/[\u0300-\u036f]/g, '')      // Remove diacritical marks
    .replace(/\s*\([^)]*\)\s*/g, ' ')     // Remove parenthetical content
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
    .normalize('NFD')                     // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')      // Remove diacritical marks
    .replace(/\s*\([^)]*\)\s*/g, ' ');    // Remove parenthetical content
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
    .split(/[,;\/]/)
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

  // Check for spelling variants (gray/grey, color/colour, etc.)
  for (const correct of correctAnswers) {
    if (areSpellingVariants(normalizedInput, correct)) {
      return 'green';
    }
  }

  // Check for synonyms (bike/cycle, big/large, etc.)
  for (const correct of correctAnswers) {
    if (areSynonyms(normalizedInput, correct)) {
      return 'green';
    }
  }

  // Check if input matches any core word from the correct answer (e.g., "search" matches "to search")
  const inputCoreWords = extractCoreWords(userInput);
  const correctCoreWords = extractCoreWords(correctAnswer);

  for (const inputWord of inputCoreWords) {
    for (const correctWord of correctCoreWords) {
      if (inputWord === correctWord || areSpellingVariants(inputWord, correctWord) || areSynonyms(inputWord, correctWord)) {
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
