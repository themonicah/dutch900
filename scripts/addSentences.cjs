// Script to add additional example sentences to words
// Run with: node scripts/addSentences.js

const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../src/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

// Additional sentence templates based on part of speech and common patterns
const verbSentences = {
  'eten': [
    { dutch: 'We eten samen vanavond.', english: 'We eat together tonight.' },
    { dutch: 'Wat eet je het liefst?', english: 'What do you like to eat most?' }
  ],
  'drinken': [
    { dutch: 'Zij drinkt graag koffie.', english: 'She likes to drink coffee.' },
    { dutch: 'Drink je water of sap?', english: 'Do you drink water or juice?' }
  ],
  'gaan': [
    { dutch: 'We gaan morgen naar het strand.', english: 'We go to the beach tomorrow.' },
    { dutch: 'Waar ga je naartoe?', english: 'Where are you going?' }
  ],
  'komen': [
    { dutch: 'Zij komt uit Nederland.', english: 'She comes from the Netherlands.' },
    { dutch: 'Kom je naar het feest?', english: 'Are you coming to the party?' }
  ],
  'hebben': [
    { dutch: 'Wij hebben twee kinderen.', english: 'We have two children.' },
    { dutch: 'Heb je honger?', english: 'Are you hungry?' }
  ],
  'zijn': [
    { dutch: 'Zij zijn mijn vrienden.', english: 'They are my friends.' },
    { dutch: 'Ben je klaar?', english: 'Are you ready?' }
  ],
  'willen': [
    { dutch: 'Wat wil je doen vandaag?', english: 'What do you want to do today?' },
    { dutch: 'Wij willen een huis kopen.', english: 'We want to buy a house.' }
  ],
  'kunnen': [
    { dutch: 'Kun je me helpen?', english: 'Can you help me?' },
    { dutch: 'Zij kan goed koken.', english: 'She can cook well.' }
  ],
  'moeten': [
    { dutch: 'Je moet op tijd zijn.', english: 'You must be on time.' },
    { dutch: 'Wij moeten nu vertrekken.', english: 'We have to leave now.' }
  ],
  'mogen': [
    { dutch: 'Je mag hier niet roken.', english: 'You may not smoke here.' },
    { dutch: 'Mogen we naar binnen?', english: 'May we come inside?' }
  ],
  'zien': [
    { dutch: 'Ik zie hem elke dag.', english: 'I see him every day.' },
    { dutch: 'Kun je het zien?', english: 'Can you see it?' }
  ],
  'horen': [
    { dutch: 'Hoor je dat geluid?', english: 'Do you hear that sound?' },
    { dutch: 'Ik hoor graag van je.', english: 'I like to hear from you.' }
  ],
  'weten': [
    { dutch: 'Weet je waar hij woont?', english: 'Do you know where he lives?' },
    { dutch: 'Niemand weet het antwoord.', english: 'Nobody knows the answer.' }
  ],
  'kennen': [
    { dutch: 'Ik ken deze stad goed.', english: 'I know this city well.' },
    { dutch: 'Ken je dat restaurant?', english: 'Do you know that restaurant?' }
  ],
  'denken': [
    { dutch: 'Wat denk je ervan?', english: 'What do you think of it?' },
    { dutch: 'Ik denk vaak aan haar.', english: 'I often think of her.' }
  ],
  'zeggen': [
    { dutch: 'Hij zegt altijd de waarheid.', english: 'He always tells the truth.' },
    { dutch: 'Kun je dat nog een keer zeggen?', english: 'Can you say that again?' }
  ],
  'vragen': [
    { dutch: 'Ik wil je iets vragen.', english: 'I want to ask you something.' },
    { dutch: 'Vraag het maar!', english: 'Just ask!' }
  ],
  'geven': [
    { dutch: 'Kun je me een pen geven?', english: 'Can you give me a pen?' },
    { dutch: 'Zij geeft altijd goede adviezen.', english: 'She always gives good advice.' }
  ],
  'nemen': [
    { dutch: 'Neem een koekje!', english: 'Take a cookie!' },
    { dutch: 'Ik neem de bus naar het werk.', english: 'I take the bus to work.' }
  ],
  'maken': [
    { dutch: 'Zij maakt mooie schilderijen.', english: 'She makes beautiful paintings.' },
    { dutch: 'Maak je geen zorgen.', english: "Don't worry." }
  ],
  'werken': [
    { dutch: 'Hij werkt thuis vandaag.', english: 'He works from home today.' },
    { dutch: 'De computer werkt niet.', english: "The computer doesn't work." }
  ],
  'leren': [
    { dutch: 'Zij leert snel.', english: 'She learns quickly.' },
    { dutch: 'Ik leer elke dag nieuwe woorden.', english: 'I learn new words every day.' }
  ],
  'schrijven': [
    { dutch: 'Kun je je naam schrijven?', english: 'Can you write your name?' },
    { dutch: 'Hij schrijft een boek.', english: 'He is writing a book.' }
  ],
  'lezen': [
    { dutch: 'Zij leest graag romans.', english: 'She likes to read novels.' },
    { dutch: 'Kun je dit voor me lezen?', english: 'Can you read this for me?' }
  ],
  'spreken': [
    { dutch: 'Hij spreekt drie talen.', english: 'He speaks three languages.' },
    { dutch: 'Kun je langzamer spreken?', english: 'Can you speak more slowly?' }
  ],
  'begrijpen': [
    { dutch: 'Begrijp je wat ik bedoel?', english: 'Do you understand what I mean?' },
    { dutch: 'Ik begrijp je helemaal.', english: 'I understand you completely.' }
  ],
  'vinden': [
    { dutch: 'Wat vind je van dit boek?', english: 'What do you think of this book?' },
    { dutch: 'Ik kan mijn telefoon niet vinden.', english: "I can't find my phone." }
  ],
  'zoeken': [
    { dutch: 'Wat zoek je?', english: 'What are you looking for?' },
    { dutch: 'Ik zoek een baan.', english: "I'm looking for a job." }
  ],
  'kopen': [
    { dutch: 'Waar kan ik kaartjes kopen?', english: 'Where can I buy tickets?' },
    { dutch: 'Zij koopt nieuwe schoenen.', english: 'She is buying new shoes.' }
  ],
  'betalen': [
    { dutch: 'Kan ik met kaart betalen?', english: 'Can I pay with card?' },
    { dutch: 'Wie betaalt de rekening?', english: 'Who pays the bill?' }
  ],
  'wonen': [
    { dutch: 'Waar woon je?', english: 'Where do you live?' },
    { dutch: 'Wij wonen in het centrum.', english: 'We live in the center.' }
  ],
  'slapen': [
    { dutch: 'Ik slaap graag lang.', english: 'I like to sleep long.' },
    { dutch: 'Slaap je goed?', english: 'Do you sleep well?' }
  ],
  'lopen': [
    { dutch: 'Wij lopen naar de winkel.', english: 'We walk to the store.' },
    { dutch: 'De hond loopt snel.', english: 'The dog walks fast.' }
  ],
  'rijden': [
    { dutch: 'Kun je auto rijden?', english: 'Can you drive a car?' },
    { dutch: 'Hij rijdt naar zijn werk.', english: 'He drives to his work.' }
  ],
  'wachten': [
    { dutch: 'Wacht even op mij!', english: 'Wait for me!' },
    { dutch: 'Ik wacht al een uur.', english: "I've been waiting for an hour." }
  ],
  'blijven': [
    { dutch: 'Blijf hier zitten.', english: 'Stay seated here.' },
    { dutch: 'Wij blijven twee nachten.', english: 'We stay for two nights.' }
  ],
  'vertrekken': [
    { dutch: 'Hoe laat vertrekt de trein?', english: 'What time does the train leave?' },
    { dutch: 'Wij vertrekken morgenochtend.', english: 'We leave tomorrow morning.' }
  ],
  'aankomen': [
    { dutch: 'Hoe laat kom je aan?', english: 'What time do you arrive?' },
    { dutch: 'De trein komt te laat aan.', english: 'The train arrives late.' }
  ],
  'stoppen': [
    { dutch: 'De bus stopt hier.', english: 'The bus stops here.' },
    { dutch: 'Stop met praten!', english: 'Stop talking!' }
  ],
  'beginnen': [
    { dutch: 'De film begint om acht uur.', english: 'The movie starts at eight.' },
    { dutch: 'Laten we beginnen!', english: "Let's begin!" }
  ],
  'eindigen': [
    { dutch: 'Het feest eindigt om middernacht.', english: 'The party ends at midnight.' },
    { dutch: 'Wanneer eindigt de les?', english: 'When does the lesson end?' }
  ],
  'proberen': [
    { dutch: 'Probeer het nog een keer.', english: 'Try it one more time.' },
    { dutch: 'Ik probeer gezond te eten.', english: 'I try to eat healthy.' }
  ],
  'vergeten': [
    { dutch: 'Vergeet je paraplu niet!', english: "Don't forget your umbrella!" },
    { dutch: 'Ik vergeet altijd namen.', english: 'I always forget names.' }
  ],
  'onthouden': [
    { dutch: 'Kun je dit onthouden?', english: 'Can you remember this?' },
    { dutch: 'Ik kan zijn naam niet onthouden.', english: "I can't remember his name." }
  ],
  'bellen': [
    { dutch: 'Ik bel je morgen.', english: "I'll call you tomorrow." },
    { dutch: 'Wie belt er?', english: 'Who is calling?' }
  ],
  'sturen': [
    { dutch: 'Kun je een email sturen?', english: 'Can you send an email?' },
    { dutch: 'Ik stuur je een bericht.', english: "I'll send you a message." }
  ],
  'krijgen': [
    { dutch: 'Wat krijg je voor je verjaardag?', english: 'What do you get for your birthday?' },
    { dutch: 'Ik krijg een cadeau.', english: 'I am getting a present.' }
  ],
  'houden': [
    { dutch: 'Ik houd van muziek.', english: 'I love music.' },
    { dutch: 'Houd je van kaas?', english: 'Do you like cheese?' }
  ],
  'helpen': [
    { dutch: 'Kan ik je helpen?', english: 'Can I help you?' },
    { dutch: 'Zij helpt me altijd.', english: 'She always helps me.' }
  ],
  'kijken': [
    { dutch: 'Kijk naar die vogel!', english: 'Look at that bird!' },
    { dutch: 'Ik kijk graag films.', english: 'I like to watch movies.' }
  ],
  'luisteren': [
    { dutch: 'Luister goed!', english: 'Listen carefully!' },
    { dutch: 'Ik luister naar de radio.', english: "I'm listening to the radio." }
  ],
  'voelen': [
    { dutch: 'Hoe voel je je?', english: 'How do you feel?' },
    { dutch: 'Ik voel me goed vandaag.', english: 'I feel good today.' }
  ],
  'ruiken': [
    { dutch: 'Ruik je dat?', english: 'Do you smell that?' },
    { dutch: 'De bloemen ruiken lekker.', english: 'The flowers smell nice.' }
  ],
  'proeven': [
    { dutch: 'Wil je proeven?', english: 'Do you want to taste?' },
    { dutch: 'Dit proeft heerlijk!', english: 'This tastes delicious!' }
  ],
  'zitten': [
    { dutch: 'Waar zit je?', english: 'Where are you sitting?' },
    { dutch: 'De kat zit op de stoel.', english: 'The cat sits on the chair.' }
  ],
  'staan': [
    { dutch: 'Hij staat bij de deur.', english: 'He stands by the door.' },
    { dutch: 'Sta niet in de weg!', english: "Don't stand in the way!" }
  ],
  'liggen': [
    { dutch: 'De hond ligt op de bank.', english: 'The dog lies on the couch.' },
    { dutch: 'Amsterdam ligt in Nederland.', english: 'Amsterdam is in the Netherlands.' }
  ],
  'vallen': [
    { dutch: 'Pas op dat je niet valt!', english: "Be careful not to fall!" },
    { dutch: 'De bladeren vallen van de boom.', english: 'The leaves fall from the tree.' }
  ],
  'sterven': [
    { dutch: 'De bloemen sterven zonder water.', english: 'The flowers die without water.' },
    { dutch: 'Hij stierf op hoge leeftijd.', english: 'He died at an old age.' }
  ],
  'leven': [
    { dutch: 'Zij leeft alleen.', english: 'She lives alone.' },
    { dutch: 'Lang leve de koning!', english: 'Long live the king!' }
  ],
  'groeien': [
    { dutch: 'Kinderen groeien snel.', english: 'Children grow fast.' },
    { dutch: 'De plant groeit goed.', english: 'The plant grows well.' }
  ],
  'veranderen': [
    { dutch: 'Het weer verandert snel.', english: 'The weather changes quickly.' },
    { dutch: 'Mensen veranderen.', english: 'People change.' }
  ],
  'verliezen': [
    { dutch: 'Ik verlies altijd mijn sleutels.', english: 'I always lose my keys.' },
    { dutch: 'Het team verloor de wedstrijd.', english: 'The team lost the match.' }
  ],
  'winnen': [
    { dutch: 'Zij wint altijd met spelletjes.', english: 'She always wins at games.' },
    { dutch: 'We willen winnen!', english: 'We want to win!' }
  ],
  'spelen': [
    { dutch: 'De kinderen spelen buiten.', english: 'The children play outside.' },
    { dutch: 'Kun je piano spelen?', english: 'Can you play piano?' }
  ],
  'zwemmen': [
    { dutch: 'Wij gaan zwemmen in de zee.', english: 'We go swimming in the sea.' },
    { dutch: 'Kun je goed zwemmen?', english: 'Can you swim well?' }
  ],
  'fietsen': [
    { dutch: 'Ik fiets naar school.', english: 'I cycle to school.' },
    { dutch: 'In Nederland fietst iedereen.', english: 'In the Netherlands everyone cycles.' }
  ],
  'rennen': [
    { dutch: 'De kinderen rennen in het park.', english: 'The children run in the park.' },
    { dutch: 'Ren niet in de gang!', english: "Don't run in the hallway!" }
  ],
  'dansen': [
    { dutch: 'Wil je met me dansen?', english: 'Do you want to dance with me?' },
    { dutch: 'Zij danst heel goed.', english: 'She dances very well.' }
  ],
  'zingen': [
    { dutch: 'Hij zingt onder de douche.', english: 'He sings in the shower.' },
    { dutch: 'Ik kan niet zingen.', english: "I can't sing." }
  ],
  'koken': [
    { dutch: 'Wie kookt vanavond?', english: 'Who is cooking tonight?' },
    { dutch: 'Ik kook graag Italiaans.', english: 'I like to cook Italian.' }
  ],
  'bakken': [
    { dutch: 'Zij bakt een taart.', english: 'She is baking a cake.' },
    { dutch: 'Kun je pannenkoeken bakken?', english: 'Can you make pancakes?' }
  ],
  'wassen': [
    { dutch: 'Ik was mijn handen.', english: 'I wash my hands.' },
    { dutch: 'De was moet gedaan worden.', english: 'The laundry needs to be done.' }
  ],
  'schoonmaken': [
    { dutch: 'Ik maak het huis schoon.', english: "I'm cleaning the house." },
    { dutch: 'Het raam moet schoongemaakt worden.', english: 'The window needs to be cleaned.' }
  ],
  'opruimen': [
    { dutch: 'Ruim je kamer op!', english: 'Clean up your room!' },
    { dutch: 'Ik moet nog opruimen.', english: 'I still need to tidy up.' }
  ],
  'ontmoeten': [
    { dutch: 'Leuk je te ontmoeten!', english: 'Nice to meet you!' },
    { dutch: 'Waar ontmoeten we elkaar?', english: 'Where do we meet?' }
  ],
  'bezoeken': [
    { dutch: 'Ik bezoek mijn oma morgen.', english: "I'm visiting my grandma tomorrow." },
    { dutch: 'Heb je Amsterdam bezocht?', english: 'Have you visited Amsterdam?' }
  ],
  'uitnodigen': [
    { dutch: 'Ik nodig je uit voor mijn feest.', english: "I'm inviting you to my party." },
    { dutch: 'Ben je uitgenodigd?', english: 'Are you invited?' }
  ],
  'bestellen': [
    { dutch: 'Mag ik bestellen?', english: 'May I order?' },
    { dutch: 'Ik bestel een pizza.', english: "I'm ordering a pizza." }
  ],
  'reserveren': [
    { dutch: 'Ik wil een tafel reserveren.', english: 'I want to reserve a table.' },
    { dutch: 'Heb je gereserveerd?', english: 'Did you make a reservation?' }
  ],
  'huren': [
    { dutch: 'Wij huren een appartement.', english: 'We rent an apartment.' },
    { dutch: 'Kun je een auto huren?', english: 'Can you rent a car?' }
  ],
  'verkopen': [
    { dutch: 'Hij verkoopt zijn auto.', english: 'He is selling his car.' },
    { dutch: 'Waar verkopen ze bloemen?', english: 'Where do they sell flowers?' }
  ],
  'verdienen': [
    { dutch: 'Hoeveel verdien je?', english: 'How much do you earn?' },
    { dutch: 'Hij verdient goed geld.', english: 'He earns good money.' }
  ],
  'uitgeven': [
    { dutch: 'Ik geef te veel geld uit.', english: 'I spend too much money.' },
    { dutch: 'Waar geef je je geld aan uit?', english: 'What do you spend your money on?' }
  ],
  'sparen': [
    { dutch: 'Ik spaar voor een vakantie.', english: "I'm saving for a vacation." },
    { dutch: 'Je moet meer sparen.', english: 'You should save more.' }
  ],
  'lenen': [
    { dutch: 'Mag ik je pen lenen?', english: 'May I borrow your pen?' },
    { dutch: 'Ik leen nooit geld.', english: 'I never lend money.' }
  ],
  'dragen': [
    { dutch: 'Wat draag je vandaag?', english: 'What are you wearing today?' },
    { dutch: 'Kun je dit dragen?', english: 'Can you carry this?' }
  ],
  'aantrekken': [
    { dutch: 'Trek je jas aan!', english: 'Put on your coat!' },
    { dutch: 'Wat trek je aan vanavond?', english: 'What are you wearing tonight?' }
  ],
  'uittrekken': [
    { dutch: 'Trek je schoenen uit.', english: 'Take off your shoes.' },
    { dutch: 'Ik trek mijn jas uit.', english: "I'm taking off my coat." }
  ],
  'douchen': [
    { dutch: 'Ik douche elke ochtend.', english: 'I shower every morning.' },
    { dutch: 'Heb je al gedoucht?', english: 'Have you showered yet?' }
  ],
  'ontbijten': [
    { dutch: 'Wij ontbijten om acht uur.', english: 'We have breakfast at eight.' },
    { dutch: 'Heb je al ontbeten?', english: 'Have you had breakfast yet?' }
  ],
  'lunchen': [
    { dutch: 'Waar lunchen we vandaag?', english: 'Where are we having lunch today?' },
    { dutch: 'Ik lunch meestal thuis.', english: 'I usually have lunch at home.' }
  ],
  'parkeren': [
    { dutch: 'Waar kan ik parkeren?', english: 'Where can I park?' },
    { dutch: 'Parkeren is hier verboden.', english: 'Parking is forbidden here.' }
  ],
  'uploaden': [
    { dutch: 'Kun je de foto uploaden?', english: 'Can you upload the photo?' },
    { dutch: "Ik upload het bestand nu.", english: "I'm uploading the file now." }
  ],
  'downloaden': [
    { dutch: 'Download de app.', english: 'Download the app.' },
    { dutch: 'Het duurt lang om te downloaden.', english: 'It takes long to download.' }
  ],
  'printen': [
    { dutch: 'Kun je dit voor me printen?', english: 'Can you print this for me?' },
    { dutch: 'De printer print niet.', english: "The printer isn't printing." }
  ]
};

// Generic templates for nouns
function generateNounSentences(word) {
  const templates = [
    { dutch: `Ik heb een ${word.dutch}.`, english: `I have a ${word.english.split(',')[0].split('/')[0].trim()}.` },
    { dutch: `De ${word.dutch} is mooi.`, english: `The ${word.english.split(',')[0].split('/')[0].trim()} is beautiful.` },
    { dutch: `Waar is de ${word.dutch}?`, english: `Where is the ${word.english.split(',')[0].split('/')[0].trim()}?` },
    { dutch: `Dit is mijn ${word.dutch}.`, english: `This is my ${word.english.split(',')[0].split('/')[0].trim()}.` },
    { dutch: `Ik zie een ${word.dutch}.`, english: `I see a ${word.english.split(',')[0].split('/')[0].trim()}.` }
  ];
  return templates.slice(0, 2);
}

// Generic templates for adjectives
function generateAdjectiveSentences(word) {
  const templates = [
    { dutch: `Het is heel ${word.dutch}.`, english: `It is very ${word.english.split(',')[0].split('/')[0].trim()}.` },
    { dutch: `Dat is niet ${word.dutch}.`, english: `That is not ${word.english.split(',')[0].split('/')[0].trim()}.` },
    { dutch: `Hoe ${word.dutch}!`, english: `How ${word.english.split(',')[0].split('/')[0].trim()}!` },
    { dutch: `Is het ${word.dutch}?`, english: `Is it ${word.english.split(',')[0].split('/')[0].trim()}?` }
  ];
  return templates.slice(0, 2);
}

// Generic templates for adverbs
function generateAdverbSentences(word) {
  const templates = [
    { dutch: `Ik ga ${word.dutch}.`, english: `I go ${word.english.split(',')[0].split('/')[0].trim()}.` },
    { dutch: `Zij komt ${word.dutch}.`, english: `She comes ${word.english.split(',')[0].split('/')[0].trim()}.` }
  ];
  return templates;
}

// Process each word
let updated = 0;
for (const word of words) {
  // Skip if already has multiple sentences
  if (word.sentences && word.sentences.length >= 3) {
    continue;
  }

  let newSentences = [];

  // Check if we have custom sentences for this word
  if (verbSentences[word.dutch]) {
    newSentences = verbSentences[word.dutch];
  } else if (word.partOfSpeech === 'noun') {
    newSentences = generateNounSentences(word);
  } else if (word.partOfSpeech === 'adjective') {
    newSentences = generateAdjectiveSentences(word);
  } else if (word.partOfSpeech === 'adverb') {
    newSentences = generateAdverbSentences(word);
  }

  if (newSentences.length > 0) {
    // Add new sentences, avoiding duplicates
    const existingDutch = new Set((word.sentences || []).map(s => s.dutch));
    for (const sentence of newSentences) {
      if (!existingDutch.has(sentence.dutch)) {
        word.sentences = word.sentences || [];
        word.sentences.push(sentence);
        updated++;
      }
    }
  }
}

// Write back
fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2));
console.log(`Updated ${updated} sentences in ${words.length} words`);
