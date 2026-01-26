// Creative mnemonics with puns, pop culture, and absurd imagery

const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../src/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

// Much better mnemonics - funny, memorable, creative
const creativeMnemonics = {
  // Pop culture gold
  'vader': 'Darth VADER: "I am your FATHER"',
  'zoon': 'Luke is Vader\'s ZOON (son) - "ZOON, I am your father"',
  'donker': 'The DARK side has DONKER cookies',
  'kracht': 'May the KRACHT (force/power) be with you',

  // Puns and wordplay
  'krijgen': 'Babies CRY-gen until they GET what they want',
  'ongeveer': 'An OGRE VEERed APPROXIMATELY off the road',
  'boom': 'The TREE fell down - BOOM!',
  'kat': 'A KAT always lands on its feet',
  'hond': 'Sherlock\'s HOUND of the Baskervilles (dog)',
  'muis': 'Mickey MUIS (mouse) says hi',
  'vis': 'Finding Nemo is about a FISH who goes MIA - VIS-iting the ocean',
  'vogel': 'FOGEL from Superbad is a total BIRD-brain',
  'slapen': 'SLAP yourself awake - stop SLEEPING!',
  'eten': 'E.T. phoned home, then ATE-en his Reese\'s Pieces',
  'drinken': 'Don\'t DRINK-en and drive',
  'lopen': 'Forest Gump just kept LOPE-ing (walking/running)',
  'rennen': 'Run, Forrest, REN-nen!',

  // Absurd imagery
  'groot': 'I am GROOT = I am BIG (Guardians of the Galaxy)',
  'klein': 'Calvin KLEIN makes clothes for SMALL people... wait',
  'geld': 'GELD the golden goose for MONEY',
  'brood': 'Inbread cats love BREAD - they\'re BROOD',
  'kaas': 'Say KAAS! (cheese) for the photo',
  'melk': 'Got MELK? (milk)',
  'bier': 'Hold my BIER (beer)',
  'wijn': 'WINE not have some WIJN?',
  'koffie': 'But first, KOFFIE (coffee)',

  // Mini stories
  'vergeten': 'I For-GET things because I FORGET-en',
  'beginnen': 'Let\'s BEGIN-nen this party!',
  'stoppen': 'Hammertime! Can\'t touch this - STOP-pen!',
  'wachten': 'WATCH-ten the clock while you WAIT',
  'zoeken': 'Playing hide and SEEK-en',
  'vinden': 'Finders keepers - FIND-en it, keep it',
  'kopen': 'Can\'t COPE-en with how much I want to BUY this',
  'verkopen': 'The FAIR-kopen (sell) price at the market',
  'betalen': '"Pay the TAAL-en!" (Pay the toll/bill)',
  'werken': 'Rihanna: "WERK-en, werk, werk, werk"',

  // Food puns
  'appel': 'An APPLE a day - APPEL',
  'sinaasappel': 'CHINA-sappel - they thought oranges came from CHINA (orange)',
  'banaan': 'This is BANANAS - B-A-N-A-A-N',
  'aardappel': 'Earth-apple? AARDAPPEL is a POTATO (literally "earth apple")',
  'soep': 'No SOUP for you! (Seinfeld)',

  // Body parts with imagery
  'hoofd': 'Wear a HOOD on your HEAD',
  'oog': 'OOH, look at that with your EYE',
  'oor': 'Lend me your EAR - "OOR you listening?"',
  'neus': 'Pinocchio\'s NEWS travels through his NOSE',
  'mond': 'Watch your MOUTH - it\'s your MOND-ey maker',
  'hand': 'Talk to the HAND',
  'voet': 'FOOT fetish - VOET',
  'been': 'BONE in your LEG - shake a leg, BEEN there',
  'hart': 'Have a HEART - HART',

  // Time-related
  'dag': 'Seize the DAG (day)! Carpe DAG!',
  'nacht': 'Good NACHT (night) - German style',
  'week': 'WEAK from working all WEEK',
  'maand': 'To the MOON and back - MAAND (month)',
  'jaar': 'Happy New JAAR! (year)',
  'uur': 'OUR finest HOUR - UUR',
  'minuut': 'Wait a MINUTE - MINUUT',

  // Weather
  'zon': 'Here comes the ZON (sun)',
  'maan': 'Fly me to the MAAN (moon)',
  'ster': 'Twinkle twinkle little STER (star)',
  'regen': 'Purple RAIN, purple REGEN',
  'sneeuw': 'Let it SNOW, let it SNEEUW',
  'wind': 'Blowin\' in the WIND',
  'wolk': 'Head in the CLOUDS - I\'m on WOLK nine',

  // Feelings
  'blij': 'Don\'t worry, be BLIJ (happy)!',
  'boos': 'The BOSS is ANGRY - boos',
  'bang': 'BANG! Scared? You should be AFRAID',
  'moe': 'MOE from the Simpsons is always TIRED',
  'ziek': 'Calling in SICK - "I\'m too ZIEK to work"',

  // Actions with pop culture
  'dansen': 'Footloose - everybody cut DANCE-en!',
  'zingen': 'SING-en in the rain',
  'spelen': 'Game of Thrones: "When you PLAY the game..." SPEL-en',
  'zwemmen': 'Just keep SWIMMING, ZWEM-men',
  'vliegen': 'I believe I can FLY - VLIEG-en',
  'rijden': 'RIDE or die - RIJD-en',
  'fietsen': 'Tour de France - FIETS-en (cycling) through France',

  // Common verbs reimagined
  'hebben': 'HAVE-ben a nice day!',
  'zijn': 'To BE or not to BE - that is the ZIJN',
  'gaan': 'Let it GO, let it GAAN',
  'komen': 'Winter is COMING - winter is KOMEN',
  'zien': 'I\'ve SEEN things - I\'ve ZIEN things',
  'horen': 'Can you HEAR me now? HOREN?',
  'voelen': 'Feelings, nothing more than FEEL-ings... VOEL-en',
  'denken': 'The Thinker is DENK-ing',
  'weten': 'Jon Snow: "You know nothing" - you WEET-en nothing',
  'kennen': 'Do you KEN this person? (Scottish: do you KNOW)',
  'zeggen': 'SAY-gen what? SAY it again!',
  'spreken': 'Do you SPEAK-en English?',
  'lezen': 'Reading Rainbow: LEES (read) a book today',
  'schrijven': 'Dear diary... SCHRIJF-en (write) it down',

  // Numbers as memorable phrases
  'een': 'ONE is the loneliest number - EEN',
  'twee': 'It takes TWEE to tango',
  'drie': 'DRIE strikes and you\'re out',
  'tien': 'Perfect TEN - TIEN',

  // House and home
  'huis': 'HOUSE sounds like HUIS - Dr. House',
  'kamer': 'Lights, CAMERA, action! (room)',
  'deur': 'Jim Morrison & The DOORS - DEUR',
  'raam': 'RAM into the WINDOW - RAAM',
  'trap': 'It\'s a TRAP! (stairs) - Admiral Ackbar',
  'bed': 'BED-time - same word!',
  'stoel': 'Musical CHAIRS - grab a STOEL',
  'tafel': 'Flip the TABLE - TAFEL',

  // Transport
  'auto': 'AUTO-bots, roll out! (car)',
  'fiets': 'FEATS of cycling - FIETS (bike)',
  'trein': 'Soul TRAIN - TREIN',
  'bus': 'Magic School BUS',
  'vliegtuig': 'FLYING THING - vliegtuig (airplane)',
  'boot': 'I\'m on a BOAT - BOOT',

  // Adjectives with flair
  'mooi': 'MOO-y cow is BEAUTIFUL (what a beauty!)',
  'lekker': 'Finger LICK-er good - LEKKER (tasty)',
  'warm': 'WARM is universal',
  'koud': 'That\'s COLD - KOUD',
  'snel': 'SNAIL? No! SNEL means FAST!',
  'langzaam': 'LONG-zaam journey - SLOW and steady',
  'duur': 'That\'s DEAR-ly EXPENSIVE - DUUR',
  'goedkoop': 'GOOD-cheap = CHEAP deal',
  'nieuw': 'What\'s NEW? NIEUW!',
  'oud': 'OUT with the OLD',

  // Relationship words
  'vriend': 'FRIEND sounds like VRIEND',
  'vriendin': 'Girlfriend is VRIEND-in (friend-in your heart)',
  'man': 'MAN up! (man/husband)',
  'vrouw': 'FROW-n? No, SMILE at your WIFE',
  'kind': 'Be KIND to the CHILD',
  'moeder': 'How I Met Your MOEDER (mother)',
  'dochter': 'DOCTOR\'s DAUGHTER - DOCHTER',

  // Work related
  'werk': 'Back to WORK - WERK',
  'baas': 'Like a BOSS - like a BAAS',
  'kantoor': 'The Office - KANTOOR edition',

  // Places
  'stad': 'Sex and the CITY - STAD',
  'land': 'This LAND is your LAND',
  'straat': 'Sesame STREET - STRAAT',
  'school': 'Old SCHOOL - same word',
  'winkel': 'WINK-el at the SHOP clerk',
  'ziekenhuis': 'SICK-house = HOSPITAL',

  // Question words
  'wat': 'WAT? WHAT did you say?',
  'wie': 'Doctor WHO - Doctor WIE',
  'waar': 'WHERE wolf - WAAR',
  'wanneer': 'Shakira: WHENEVER, WHEREVER - WANNEER',
  'waarom': 'Y tho? WAAROM (why)',
  'hoe': 'Santa\'s HOE HOE HOE - HOW funny!',

  // Misc creative ones
  'probleem': 'Houston, we have a PROBLEEM',
  'telefoon': 'ET PHONE home - TELEFOON',
  'computer': 'COMPUTER says no (Little Britain)',
  'internet': 'The INTERNET is a series of tubes',
  'boek': 'Don\'t judge a BOOK by its cover - BOEK',
  'brief': 'Keep it BRIEF - short LETTER',
  'foto': 'Say FOTO for the camera! (photo)',
  'muziek': 'The Sound of MUSIC - MUZIEK',
  'film': 'Lights, camera, FILM!',

  // More verbs with personality
  'koken': 'What\'s COOK-en? KOKEN',
  'bakken': 'BAKE-en a cake',
  'wassen': 'WASH-en your hands',
  'helpen': 'HELP-en! I need somebody!',
  'geven': 'Never gonna GIVE you up - GEVEN',
  'nemen': 'Take it or leave it - NEEM-en it!',
  'brengen': 'BRING-en it on!',
  'houden': 'HOLD-en on for dear life',
  'laten': 'Let It Be - LAAT it be',
  'pakken': 'PACK-en your bags',
  'leggen': 'LAY-gen it down gently',
  'zitten': 'SIT-ten down and relax',
  'staan': 'STAND and deliver - STAAN',
  'liggen': 'LIE-gen down on the couch',

  // More nouns
  'water': 'WATER you doing? (same word)',
  'lucht': 'Up in the air - LUCHT (sky/air)',
  'vuur': 'This mix is FIRE - VUUR',
  'aarde': 'Planet EARTH - AARDE',
  'zee': 'From SEA to shining ZEE',

  // Misc
  'ja': 'JA, you betcha! (yes)',
  'nee': 'NAY means NO - NEE',
  'misschien': 'Call Me MAYBE - MISSCHIEN',
  'altijd': 'After ALL this TIME? ALWAYS - ALTIJD',
  'nooit': 'Never say NEVER - NOOIT',
  'nu': 'Do it NOW - NU',
  'hier': 'HERE boy! HIER!',
  'daar': 'Over THERE - DAAR',

  // Overwrite the boring ones
  'plicht': 'With great power comes great responsibility - it\'s your PLIGHT/DUTY (plicht)',
  'ongeveer': 'The OGRE VEERs APPROXIMATELY left',
  'reden': 'Everything happens for a REASON - REDEN',
  'bericht': 'You\'ve got MAIL - a MESSAGE (bericht)',
  'liefde': 'All you need is LOVE - LIEFDE',
  'geluk': 'Good LUCK with your HAPPINESS - GELUK means both!',
  'succes': 'SUCCESS! We did it - SUCCES',
};

// Replace ALL mnemonics with creative ones
let updated = 0;
for (const word of words) {
  const mnemonic = creativeMnemonics[word.dutch];
  if (mnemonic) {
    word.mnemonic = mnemonic;
    updated++;
  }
}

// Write back
fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2));
console.log(`Updated ${updated} mnemonics with creative versions`);

// Count total
const total = words.filter(w => w.mnemonic).length;
console.log(`Total words with mnemonics: ${total}/${words.length}`);
