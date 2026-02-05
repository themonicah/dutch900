// Parent Dutch - Sentence pattern drills for talking to kids

export interface Variation {
  dutch: string;         // Full sentence in Dutch
  english: string;       // Full sentence in English
  blank: string;         // The word that fills the blank
}

export interface Pattern {
  id: number;
  category: 'commands' | 'questions' | 'daily' | 'emotions';
  template: string;      // Pattern with ___ for blank
  english: string;       // English translation of template
  variations: Variation[];
}

export type PatternCategory = Pattern['category'];

export const categoryInfo: Record<PatternCategory, { name: string; color: string; icon: string }> = {
  commands: { name: 'Commands', color: '#FF6B6B', icon: '👋' },
  questions: { name: 'Questions', color: '#4ECDC4', icon: '❓' },
  daily: { name: 'Daily Routines', color: '#FFE66D', icon: '☀️' },
  emotions: { name: 'Feelings', color: '#FF8FA3', icon: '💭' },
};

export const patterns: Pattern[] = [
  // === COMMANDS (10 patterns) ===
  {
    id: 1,
    category: 'commands',
    template: 'Ga naar ___',
    english: 'Go to ___',
    variations: [
      { dutch: 'Ga naar bed', english: 'Go to bed', blank: 'bed' },
      { dutch: 'Ga naar school', english: 'Go to school', blank: 'school' },
      { dutch: 'Ga naar buiten', english: 'Go outside', blank: 'buiten' },
      { dutch: 'Ga naar je kamer', english: 'Go to your room', blank: 'je kamer' },
      { dutch: 'Ga naar de tafel', english: 'Go to the table', blank: 'de tafel' },
      { dutch: 'Ga naar papa', english: 'Go to dad', blank: 'papa' },
      { dutch: 'Ga naar mama', english: 'Go to mom', blank: 'mama' },
    ],
  },
  {
    id: 2,
    category: 'commands',
    template: 'Pak je ___',
    english: 'Get your ___',
    variations: [
      { dutch: 'Pak je jas', english: 'Get your jacket', blank: 'jas' },
      { dutch: 'Pak je tas', english: 'Get your bag', blank: 'tas' },
      { dutch: 'Pak je schoenen', english: 'Get your shoes', blank: 'schoenen' },
      { dutch: 'Pak je boek', english: 'Get your book', blank: 'boek' },
      { dutch: 'Pak je speelgoed', english: 'Get your toy', blank: 'speelgoed' },
      { dutch: 'Pak je beker', english: 'Get your cup', blank: 'beker' },
    ],
  },
  {
    id: 3,
    category: 'commands',
    template: 'Kom ___',
    english: 'Come ___',
    variations: [
      { dutch: 'Kom hier', english: 'Come here', blank: 'hier' },
      { dutch: 'Kom even', english: 'Come for a moment', blank: 'even' },
      { dutch: 'Kom mee', english: 'Come along', blank: 'mee' },
      { dutch: 'Kom eten', english: 'Come eat', blank: 'eten' },
      { dutch: 'Kom kijken', english: 'Come look', blank: 'kijken' },
    ],
  },
  {
    id: 4,
    category: 'commands',
    template: 'Ga ___',
    english: 'Go ___',
    variations: [
      { dutch: 'Ga zitten', english: 'Go sit / Sit down', blank: 'zitten' },
      { dutch: 'Ga staan', english: 'Go stand / Stand up', blank: 'staan' },
      { dutch: 'Ga liggen', english: 'Go lie down', blank: 'liggen' },
      { dutch: 'Ga slapen', english: 'Go sleep', blank: 'slapen' },
      { dutch: 'Ga spelen', english: 'Go play', blank: 'spelen' },
    ],
  },
  {
    id: 5,
    category: 'commands',
    template: 'Wees ___',
    english: 'Be ___',
    variations: [
      { dutch: 'Wees stil', english: 'Be quiet', blank: 'stil' },
      { dutch: 'Wees lief', english: 'Be nice', blank: 'lief' },
      { dutch: 'Wees voorzichtig', english: 'Be careful', blank: 'voorzichtig' },
      { dutch: 'Wees rustig', english: 'Be calm', blank: 'rustig' },
      { dutch: 'Wees braaf', english: 'Be good', blank: 'braaf' },
    ],
  },
  {
    id: 6,
    category: 'commands',
    template: 'Doe je ___ aan',
    english: 'Put on your ___',
    variations: [
      { dutch: 'Doe je jas aan', english: 'Put on your jacket', blank: 'jas' },
      { dutch: 'Doe je schoenen aan', english: 'Put on your shoes', blank: 'schoenen' },
      { dutch: 'Doe je pyjama aan', english: 'Put on your pajamas', blank: 'pyjama' },
      { dutch: 'Doe je muts aan', english: 'Put on your hat', blank: 'muts' },
      { dutch: 'Doe je handschoenen aan', english: 'Put on your gloves', blank: 'handschoenen' },
    ],
  },
  {
    id: 7,
    category: 'commands',
    template: 'Stop met ___',
    english: 'Stop ___',
    variations: [
      { dutch: 'Stop met huilen', english: 'Stop crying', blank: 'huilen' },
      { dutch: 'Stop met rennen', english: 'Stop running', blank: 'rennen' },
      { dutch: 'Stop met schreeuwen', english: 'Stop screaming', blank: 'schreeuwen' },
      { dutch: 'Stop met dat', english: 'Stop that', blank: 'dat' },
      { dutch: 'Stop met vechten', english: 'Stop fighting', blank: 'vechten' },
    ],
  },
  {
    id: 8,
    category: 'commands',
    template: 'Geef mij ___',
    english: 'Give me ___',
    variations: [
      { dutch: 'Geef mij je hand', english: 'Give me your hand', blank: 'je hand' },
      { dutch: 'Geef mij een knuffel', english: 'Give me a hug', blank: 'een knuffel' },
      { dutch: 'Geef mij het boek', english: 'Give me the book', blank: 'het boek' },
      { dutch: 'Geef mij de bal', english: 'Give me the ball', blank: 'de bal' },
      { dutch: 'Geef mij een kus', english: 'Give me a kiss', blank: 'een kus' },
    ],
  },
  {
    id: 9,
    category: 'commands',
    template: 'Niet ___!',
    english: "Don't ___!",
    variations: [
      { dutch: 'Niet rennen!', english: "Don't run!", blank: 'rennen' },
      { dutch: 'Niet duwen!', english: "Don't push!", blank: 'duwen' },
      { dutch: 'Niet slaan!', english: "Don't hit!", blank: 'slaan' },
      { dutch: 'Niet huilen!', english: "Don't cry!", blank: 'huilen' },
      { dutch: 'Niet schreeuwen!', english: "Don't scream!", blank: 'schreeuwen' },
    ],
  },
  {
    id: 10,
    category: 'commands',
    template: 'Luister naar ___',
    english: 'Listen to ___',
    variations: [
      { dutch: 'Luister naar mij', english: 'Listen to me', blank: 'mij' },
      { dutch: 'Luister naar mama', english: 'Listen to mom', blank: 'mama' },
      { dutch: 'Luister naar papa', english: 'Listen to dad', blank: 'papa' },
      { dutch: 'Luister naar de leraar', english: 'Listen to the teacher', blank: 'de leraar' },
    ],
  },

  // === QUESTIONS (8 patterns) ===
  {
    id: 11,
    category: 'questions',
    template: 'Wat wil je ___?',
    english: 'What do you want to ___?',
    variations: [
      { dutch: 'Wat wil je eten?', english: 'What do you want to eat?', blank: 'eten' },
      { dutch: 'Wat wil je drinken?', english: 'What do you want to drink?', blank: 'drinken' },
      { dutch: 'Wat wil je doen?', english: 'What do you want to do?', blank: 'doen' },
      { dutch: 'Wat wil je spelen?', english: 'What do you want to play?', blank: 'spelen' },
      { dutch: 'Wat wil je lezen?', english: 'What do you want to read?', blank: 'lezen' },
      { dutch: 'Wat wil je kijken?', english: 'What do you want to watch?', blank: 'kijken' },
    ],
  },
  {
    id: 12,
    category: 'questions',
    template: 'Waar is ___?',
    english: 'Where is ___?',
    variations: [
      { dutch: 'Waar is je jas?', english: 'Where is your jacket?', blank: 'je jas' },
      { dutch: 'Waar is je tas?', english: 'Where is your bag?', blank: 'je tas' },
      { dutch: 'Waar is papa?', english: 'Where is dad?', blank: 'papa' },
      { dutch: 'Waar is mama?', english: 'Where is mom?', blank: 'mama' },
      { dutch: 'Waar is het speelgoed?', english: 'Where is the toy?', blank: 'het speelgoed' },
      { dutch: 'Waar is de kat?', english: 'Where is the cat?', blank: 'de kat' },
    ],
  },
  {
    id: 13,
    category: 'questions',
    template: 'Heb je ___?',
    english: 'Do you have ___?',
    variations: [
      { dutch: 'Heb je honger?', english: 'Are you hungry?', blank: 'honger' },
      { dutch: 'Heb je dorst?', english: 'Are you thirsty?', blank: 'dorst' },
      { dutch: 'Heb je het koud?', english: 'Are you cold?', blank: 'het koud' },
      { dutch: 'Heb je het warm?', english: 'Are you warm?', blank: 'het warm' },
      { dutch: 'Heb je pijn?', english: 'Are you in pain?', blank: 'pijn' },
      { dutch: 'Heb je je tandenborstel?', english: 'Do you have your toothbrush?', blank: 'je tandenborstel' },
    ],
  },
  {
    id: 14,
    category: 'questions',
    template: 'Kun je ___?',
    english: 'Can you ___?',
    variations: [
      { dutch: 'Kun je helpen?', english: 'Can you help?', blank: 'helpen' },
      { dutch: 'Kun je wachten?', english: 'Can you wait?', blank: 'wachten' },
      { dutch: 'Kun je stil zijn?', english: 'Can you be quiet?', blank: 'stil zijn' },
      { dutch: 'Kun je delen?', english: 'Can you share?', blank: 'delen' },
      { dutch: 'Kun je opruimen?', english: 'Can you clean up?', blank: 'opruimen' },
    ],
  },
  {
    id: 15,
    category: 'questions',
    template: 'Wil je ___?',
    english: 'Do you want ___?',
    variations: [
      { dutch: 'Wil je water?', english: 'Do you want water?', blank: 'water' },
      { dutch: 'Wil je een koekje?', english: 'Do you want a cookie?', blank: 'een koekje' },
      { dutch: 'Wil je spelen?', english: 'Do you want to play?', blank: 'spelen' },
      { dutch: 'Wil je naar buiten?', english: 'Do you want to go outside?', blank: 'naar buiten' },
      { dutch: 'Wil je een knuffel?', english: 'Do you want a hug?', blank: 'een knuffel' },
      { dutch: 'Wil je voorlezen?', english: 'Do you want me to read to you?', blank: 'voorlezen' },
    ],
  },
  {
    id: 16,
    category: 'questions',
    template: 'Wie heeft ___?',
    english: 'Who has ___?',
    variations: [
      { dutch: 'Wie heeft de bal?', english: 'Who has the ball?', blank: 'de bal' },
      { dutch: 'Wie heeft honger?', english: 'Who is hungry?', blank: 'honger' },
      { dutch: 'Wie heeft dat gedaan?', english: 'Who did that?', blank: 'dat gedaan' },
      { dutch: 'Wie heeft gewonnen?', english: 'Who won?', blank: 'gewonnen' },
    ],
  },
  {
    id: 17,
    category: 'questions',
    template: 'Waarom ___?',
    english: 'Why ___?',
    variations: [
      { dutch: 'Waarom huil je?', english: 'Why are you crying?', blank: 'huil je' },
      { dutch: 'Waarom niet?', english: 'Why not?', blank: 'niet' },
      { dutch: 'Waarom doe je dat?', english: 'Why are you doing that?', blank: 'doe je dat' },
      { dutch: 'Waarom ben je boos?', english: 'Why are you angry?', blank: 'ben je boos' },
    ],
  },
  {
    id: 18,
    category: 'questions',
    template: 'Hoe gaat het met ___?',
    english: 'How is ___?',
    variations: [
      { dutch: 'Hoe gaat het met jou?', english: 'How are you?', blank: 'jou' },
      { dutch: 'Hoe gaat het met school?', english: 'How is school?', blank: 'school' },
      { dutch: 'Hoe gaat het met je vriendje?', english: 'How is your friend?', blank: 'je vriendje' },
    ],
  },

  // === DAILY ROUTINES (7 patterns) ===
  {
    id: 19,
    category: 'daily',
    template: 'Het is tijd om te ___',
    english: "It's time to ___",
    variations: [
      { dutch: 'Het is tijd om te eten', english: "It's time to eat", blank: 'eten' },
      { dutch: 'Het is tijd om te slapen', english: "It's time to sleep", blank: 'slapen' },
      { dutch: 'Het is tijd om te gaan', english: "It's time to go", blank: 'gaan' },
      { dutch: 'Het is tijd om op te staan', english: "It's time to get up", blank: 'op te staan' },
      { dutch: 'Het is tijd om te baden', english: "It's time to take a bath", blank: 'baden' },
      { dutch: 'Het is tijd om je tanden te poetsen', english: "It's time to brush your teeth", blank: 'je tanden te poetsen' },
    ],
  },
  {
    id: 20,
    category: 'daily',
    template: 'We gaan ___',
    english: "We're going to ___",
    variations: [
      { dutch: 'We gaan eten', english: "We're going to eat", blank: 'eten' },
      { dutch: 'We gaan naar school', english: "We're going to school", blank: 'naar school' },
      { dutch: 'We gaan naar huis', english: "We're going home", blank: 'naar huis' },
      { dutch: 'We gaan naar de winkel', english: "We're going to the store", blank: 'naar de winkel' },
      { dutch: 'We gaan naar buiten', english: "We're going outside", blank: 'naar buiten' },
      { dutch: 'We gaan slapen', english: "We're going to sleep", blank: 'slapen' },
    ],
  },
  {
    id: 21,
    category: 'daily',
    template: 'Ik moet ___',
    english: 'I have to ___',
    variations: [
      { dutch: 'Ik moet werken', english: 'I have to work', blank: 'werken' },
      { dutch: 'Ik moet gaan', english: 'I have to go', blank: 'gaan' },
      { dutch: 'Ik moet koken', english: 'I have to cook', blank: 'koken' },
      { dutch: 'Ik moet even plassen', english: 'I have to pee', blank: 'even plassen' },
      { dutch: 'Ik moet opruimen', english: 'I have to clean up', blank: 'opruimen' },
    ],
  },
  {
    id: 22,
    category: 'daily',
    template: 'Jij moet ___',
    english: 'You have to ___',
    variations: [
      { dutch: 'Jij moet je tanden poetsen', english: 'You have to brush your teeth', blank: 'je tanden poetsen' },
      { dutch: 'Jij moet je handen wassen', english: 'You have to wash your hands', blank: 'je handen wassen' },
      { dutch: 'Jij moet je aankleden', english: 'You have to get dressed', blank: 'je aankleden' },
      { dutch: 'Jij moet opruimen', english: 'You have to clean up', blank: 'opruimen' },
      { dutch: 'Jij moet luisteren', english: 'You have to listen', blank: 'luisteren' },
    ],
  },
  {
    id: 23,
    category: 'daily',
    template: 'Ik ga ___',
    english: "I'm going to ___",
    variations: [
      { dutch: 'Ik ga koken', english: "I'm going to cook", blank: 'koken' },
      { dutch: 'Ik ga douchen', english: "I'm going to shower", blank: 'douchen' },
      { dutch: 'Ik ga werken', english: "I'm going to work", blank: 'werken' },
      { dutch: 'Ik ga slapen', english: "I'm going to sleep", blank: 'slapen' },
      { dutch: 'Ik ga weg', english: "I'm leaving", blank: 'weg' },
    ],
  },
  {
    id: 24,
    category: 'daily',
    template: 'Heb je al ___?',
    english: 'Have you already ___?',
    variations: [
      { dutch: 'Heb je al gegeten?', english: 'Have you already eaten?', blank: 'gegeten' },
      { dutch: 'Heb je al je tanden gepoetst?', english: 'Have you already brushed your teeth?', blank: 'je tanden gepoetst' },
      { dutch: 'Heb je al je huiswerk gemaakt?', english: 'Have you already done your homework?', blank: 'je huiswerk gemaakt' },
      { dutch: 'Heb je al gedoucht?', english: 'Have you already showered?', blank: 'gedoucht' },
    ],
  },
  {
    id: 25,
    category: 'daily',
    template: 'Straks gaan we ___',
    english: "Later we're going to ___",
    variations: [
      { dutch: 'Straks gaan we eten', english: "Later we're going to eat", blank: 'eten' },
      { dutch: 'Straks gaan we naar oma', english: "Later we're going to grandma's", blank: 'naar oma' },
      { dutch: 'Straks gaan we boodschappen doen', english: "Later we're going shopping", blank: 'boodschappen doen' },
      { dutch: 'Straks gaan we spelen', english: "Later we're going to play", blank: 'spelen' },
    ],
  },

  // === EMOTIONS (5 patterns) ===
  {
    id: 26,
    category: 'emotions',
    template: 'Ik ben ___',
    english: 'I am ___',
    variations: [
      { dutch: 'Ik ben blij', english: 'I am happy', blank: 'blij' },
      { dutch: 'Ik ben moe', english: 'I am tired', blank: 'moe' },
      { dutch: 'Ik ben boos', english: 'I am angry', blank: 'boos' },
      { dutch: 'Ik ben trots op je', english: 'I am proud of you', blank: 'trots op je' },
      { dutch: 'Ik ben verdrietig', english: 'I am sad', blank: 'verdrietig' },
      { dutch: 'Ik ben bezorgd', english: 'I am worried', blank: 'bezorgd' },
    ],
  },
  {
    id: 27,
    category: 'emotions',
    template: 'Ben je ___?',
    english: 'Are you ___?',
    variations: [
      { dutch: 'Ben je boos?', english: 'Are you angry?', blank: 'boos' },
      { dutch: 'Ben je moe?', english: 'Are you tired?', blank: 'moe' },
      { dutch: 'Ben je bang?', english: 'Are you scared?', blank: 'bang' },
      { dutch: 'Ben je verdrietig?', english: 'Are you sad?', blank: 'verdrietig' },
      { dutch: 'Ben je blij?', english: 'Are you happy?', blank: 'blij' },
      { dutch: 'Ben je ziek?', english: 'Are you sick?', blank: 'ziek' },
    ],
  },
  {
    id: 28,
    category: 'emotions',
    template: 'Het is ___',
    english: "It's ___",
    variations: [
      { dutch: 'Het is oké', english: "It's okay", blank: 'oké' },
      { dutch: 'Het is niet erg', english: "It's not a big deal", blank: 'niet erg' },
      { dutch: 'Het is goed', english: "It's good", blank: 'goed' },
      { dutch: 'Het is moeilijk', english: "It's difficult", blank: 'moeilijk' },
      { dutch: 'Het is leuk', english: "It's fun", blank: 'leuk' },
    ],
  },
  {
    id: 29,
    category: 'emotions',
    template: 'Ik hou van ___',
    english: 'I love ___',
    variations: [
      { dutch: 'Ik hou van jou', english: 'I love you', blank: 'jou' },
      { dutch: 'Ik hou van je', english: 'I love you', blank: 'je' },
      { dutch: 'Ik hou van mama', english: 'I love mom', blank: 'mama' },
      { dutch: 'Ik hou van papa', english: 'I love dad', blank: 'papa' },
    ],
  },
  {
    id: 30,
    category: 'emotions',
    template: 'Goed ___!',
    english: 'Good ___!',
    variations: [
      { dutch: 'Goed gedaan!', english: 'Well done!', blank: 'gedaan' },
      { dutch: 'Goed zo!', english: 'Good job!', blank: 'zo' },
      { dutch: 'Goedemorgen!', english: 'Good morning!', blank: 'morgen' },
      { dutch: 'Goedenacht!', english: 'Good night!', blank: 'nacht' },
      { dutch: 'Goedemiddag!', english: 'Good afternoon!', blank: 'middag' },
    ],
  },
];

// Helper to get total variation count
export function getTotalVariations(): number {
  return patterns.reduce((sum, p) => sum + p.variations.length, 0);
}

// Helper to get patterns by category
export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns.filter(p => p.category === category);
}
