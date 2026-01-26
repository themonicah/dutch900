// Fill in ALL remaining mnemonics with creative ones

const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../src/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

// Mnemonics for ALL remaining words
const allMnemonics = {
  // Pronouns & basics
  'ik': 'ICK! I don\'t like that - IK (I)',
  'jij': 'Hey YOU - YAY it\'s JIJ!',
  'hij': 'HEY, HE\'s over there - HIJ',
  'zij': 'ZAY what? SHE said that - ZIJ',
  'wij': 'WE are the champions - WIJ',
  'jullie': 'YOU-LIE! All of YOU (plural) - JULLIE',
  'mijn': 'That\'s MINE - MIJN',
  'jouw': 'Is that YOURS? - JOUW',
  'zijn': 'To BE or not to BE - ZIJN (also: HIS)',
  'haar': 'HAIR belongs to HER - HAAR',
  'ons': 'It\'s ON US - ONS (our)',
  'hun': 'The Huns owned THEIR empire - HUN',

  // Small but mighty words
  'wel': 'Oh WELL, INDEED - WEL',
  'niet': 'This is NOT it - NIET',
  'ook': 'I want one TOO - "Ook ook!" (monkey sounds)',
  'nog': 'NOG another one? STILL/YET more?',
  'al': 'That\'s ALL? ALREADY? - AL',
  'er': 'ER... THERE it is',
  'zo': 'SO what? - ZO',
  'dan': 'THEN what, DAN? - DAN',
  'toch': 'I TOLD you! (yet/still) - TOCH',
  'alleen': 'Home ALONE - ALLEEN',
  'samen': 'We\'re all in the SAME boat TOGETHER - SAMEN',
  'veel': 'I FEEL like I have too MUCH/MANY - VEEL',
  'weinig': 'WHINING about having too FEW - WEINIG',
  'meer': 'I want MORE - MEER (also: lake)',
  'minder': 'MIND-er your own business, LESS of that - MINDER',
  'genoeg': 'Ge-NUFF! ENOUGH already! - GENOEG',
  'te': 'That\'s TOO much TEA - TE',
  'heel': 'I HEEL-ed completely, I\'m VERY better - HEEL',
  'erg': 'ERG! That\'s VERY bad - ERG',

  // Prepositions with personality
  'in': 'IN is IN - same!',
  'op': 'OP-en UP, get ON top - OP',
  'met': 'I MET someone WITH me - MET',
  'naar': 'NAR-rate your journey TO somewhere - NAAR',
  'van': 'VAN Gogh was FROM Netherlands - VAN',
  'aan': 'It\'s ON - turn it AAN',
  'bij': 'Stand BY me, NEAR me - BIJ',
  'uit': 'Get OUT! - UIT',
  'door': 'Walk THROUGH the DOOR - DOOR',
  'over': 'OVER and ABOUT - OVER',
  'tot': 'TOT-ally UNTIL then - TOT',
  'na': 'NA-NA-NA AFTER the song - NA',
  'zonder': 'I SONDER WITHOUT you (wanderlust) - ZONDER',
  'tegen': 'I\'m not AGAINST that - TEGEN',
  'sinds': 'SINCE when? - SINDS',
  'tijdens': 'TIE-dens DURING the game - TIJDENS',
  'tussen': 'TUSS-en BETWEEN us - TUSSEN',
  'achter': 'I\'m AFTER you, BEHIND you - ACHTER',
  'voor': 'FORE! BEFORE the golf ball hits you - VOOR',
  'boven': 'ABOVE and beyond - BOVEN',
  'onder': 'Down UNDER - ONDER',
  'naast': 'NEXT to - NAAST',

  // Conjunctions & connectors
  'want': 'I WANT it BECAUSE I do - WANT',
  'dus': 'THUS, SO therefore - DUS',
  'dat': 'THAT is DAT',
  'toen': 'Back THEN, WHEN I was young - TOEN',
  'terwijl': 'TER-WHILE = WHILE - TERWIJL',
  'hoewel': 'HOE-well? ALTHOUGH I tried - HOEWEL',
  'zodat': 'SO THAT = ZO-DAT',
  'indien': 'IN-DIEN = IF (formal)',
  'tenzij': 'TEN-ZIJ = UNLESS',
  'zodra': 'ZO-DRA = AS SOON AS',
  'voordat': 'VOOR-DAT = BEFORE THAT',
  'nadat': 'NA-DAT = AFTER THAT',
  'omdat': 'OM-DAT = BECAUSE of that',

  // Question words extras
  'welk': 'WHICH one? - WELK',
  'hoe': 'HOE HOE HOE - HOW funny! - HOE',

  // Seasons
  'lente': 'LENT-e comes in SPRING',
  'zomer': 'SUMMER - ZOMER sounds like summer',
  'herfst': 'HARVEST in AUTUMN/FALL - HERFST',
  'winter': 'WINTER is WINTER - same!',

  // Food extras
  'pasta': 'PASTA is PASTA - same!',
  'salade': 'SALAD - SALADE',
  'boter': 'BUTTER - BOTER',
  'peper': 'PEPPER - PEPER',
  'ontbijt': 'ON-BITE your BREAKFAST - ONTBIJT',
  'lunch': 'LUNCH is LUNCH - same!',
  'avondeten': 'AVOND (evening) + ETEN (eat) = DINNER',
  'honger': 'HUNGER - HONGER sounds like HUNGER',
  'dorst': 'I\'m THIRSTY for a DORST-y drink',

  // Body extras
  'gezicht': 'Ge-SIGHT = FACE (you see with it)',
  'rug': 'RUG on your BACK',
  'schouder': 'SHOULDER - SCHOUDER sounds like SHOULDER',
  'vinger': 'FINGER - VINGER sounds like FINGER',
  'teen': 'TEEN-y tiny TOE - TEEN',
  'knie': 'KNEE - KNIE sounds like KNEE',
  'nek': 'NECK - NEK sounds like NECK',
  'buik': 'My BELLY goes BOIK when hungry - BUIK',
  'borst': 'BURST your CHEST with pride - BORST',
  'huid': 'HIDE your SKIN - HUID',
  'bloed': 'BLOOD - BLOED sounds like BLOOD',
  'spier': 'SPEAR through the MUSCLE - SPIER',

  // Medical
  'dokter': 'DOCTOR - DOKTER',
  'medicijn': 'MEDICINE - MEDICIJN',
  'pijn': 'PAIN - PIJN sounds like PAIN',
  'ziekenhuis': 'SICK-en-HOUSE = HOSPITAL',
  'apotheek': 'APOTHECARY = PHARMACY - APOTHEEK',

  // Home extras
  'keuken': 'COOK-en in the KITCHEN - KEUKEN',
  'badkamer': 'BAD-KAMER = BATHROOM (bath room)',
  'slaapkamer': 'SLAAP-KAMER = BEDROOM (sleep room)',
  'woonkamer': 'WOON-KAMER = LIVING ROOM',
  'tuin': 'TUNE into your GARDEN - TUIN',
  'garage': 'GARAGE is GARAGE - same!',
  'balkon': 'BALCONY - BALKON',
  'plafond': 'PLAFOND = CEILING (like platform above)',
  'verdieping': 'DEEP-ing into another FLOOR/STORY - VERDIEPING',

  // Adverbs extras
  'thuis': 'T-HOUSE = AT HOME - THUIS',
  'terug': 'T-RUG pulled you BACK - TERUG',
  'eigenlijk': 'EIGEN-lijk = ACTUALLY (own-ly)',
  'helaas': 'HE-LAAS = UNFORTUNATELY (alas!)',
  'gelukkig': 'Ge-LUCKY = FORTUNATELY/HAPPY',
  'meestal': 'MOST-ly = USUALLY - MEESTAL',
  'gewoonlijk': 'Ge-WOON-lijk = USUALLY (usual-ly)',
  'zelden': 'SELDOM - ZELDEN',
  'ooit': 'OY! Did that EVER happen? - OOIT',
  'ergens': 'ERG-ens = SOMEWHERE',
  'nergens': 'NERD-gens = NOWHERE (nerds are nowhere)',
  'overal': 'OVER-AL = EVERYWHERE',
  'direct': 'DIRECT-ly = IMMEDIATELY - DIRECT',
  'plotseling': 'PLOT twist! SUDDENLY - PLOTSELING',
  'eindelijk': 'END-elijk = FINALLY',
  'langzamerhand': 'LANGZAAM-er-HAND = GRADUALLY (slow hand)',
  'absoluut': 'ABSOLUTE-ly - ABSOLUUT',
  'precies': 'PRECISE-ly = EXACTLY - PRECIES',
  'ongeveer': 'The OGRE VEERs APPROXIMATELY left',
  'bijna': 'BYE-na = ALMOST bye - BIJNA',
  'helemaal': 'HELE-MAAL = COMPLETELY (whole-ly)',
  'totaal': 'TOTAL-ly - TOTAAL',

  // Verbs extras
  'lukken': 'LUCK-en into SUCCESS - LUKKEN',
  'ruiken': 'REEK-en = SMELL - RUIKEN',
  'proeven': 'PROVE-en the TASTE - PROEVEN',
  'ontvangen': 'ON-FANG-en = RECEIVE (grab with fangs)',
  'antwoorden': 'ANSWER-den = ANSWER - ANTWOORDEN',
  'geloven': 'Ge-LOVE = BELIEVE in love - GELOVEN',
  'verwachten': 'For-WATCH-en = EXPECT (watch for it)',
  'schoonmaken': 'SCHOON-MAKEN = CLEAN (make clean)',
  'drogen': 'DROUGHT-en = DRY - DROGEN',
  'invullen': 'IN-FULL-en = FILL IN - INVULLEN',
  'opruimen': 'OP-ROOM-en = TIDY UP the room',
  'bezoeken': 'Be-SEEK-en = VISIT (seek out)',
  'ontmoeten': 'ON-MEET-en = MEET - ONTMOETEN',
  'trouwen': 'TRUE-wen = MARRY truly - TROUWEN',
  'scheiden': 'SHED-en = DIVORCE (shed the marriage)',
  'sterven': 'STARVE-en = DIE - STERVEN',
  'huilen': 'HOWL-en = CRY - HUILEN',
  'lachen': 'LAUGH-en = LAUGH - LACHEN',
  'glimlachen': 'GLEAM-LACH-en = SMILE (gleaming laugh)',
  'schreeuwen': 'SCREAM-wen = SCREAM/SHOUT',
  'fluisteren': 'FLUSTER-en = WHISPER - FLUISTEREN',

  // Adjectives extras
  'breed': 'BREAD is WIDE - BREED',
  'smal': 'SMALL is NARROW - SMAL',
  'dik': 'THICK/FAT - DIK (sounds like thick)',
  'dun': 'DONE being THIN - DUN',
  'heet': 'HEAT = HOT - HEET',
  'klaar': 'All CLEAR! READY/DONE - KLAAR',
  'rustig': 'REST-ig = CALM/QUIET - RUSTIG',
  'trots': 'TROT-s like a PROUD horse - TROTS',
  'lelijk': 'LAYLA is not UGLY - LEL-ijk',
  'dom': 'DUMB = STUPID - DOM',
  'slim': 'SLIM people are SMART - SLIM',
  'dezelfde': 'De-SELF-de = THE SAME',
  'eigen': 'EIGEN = OWN (German origin)',
  'volgend': 'FOLLOWING = NEXT - VOLGEND',
  'vorig': 'FOR-ig = PREVIOUS (before)',
  'huidig': 'HUID-ig = CURRENT (skin of now)',
  'toekomstig': 'TOE-KOMST-ig = FUTURE (to-coming)',
  'recent': 'RECENT - same!',
  'vroeger': 'FROG-er = EARLIER (frog was here earlier)',
  'laatst': 'LAST - LAATST',
  'buitenlands': 'BUITEN-LANDS = FOREIGN (outside lands)',
  'inheems': 'IN-HEEMS = NATIVE (in home)',

  // More nouns
  'naam': 'NAME - NAAM sounds like NAME',
  'taal': 'TALE in your LANGUAGE - TAAL',
  'woord': 'WORD - WOORD sounds like WORD',
  'zin': 'SENSE in a SENTENCE - ZIN',
  'tekst': 'TEXT - TEKST',
  'pagina': 'PAGE-ina = PAGE - PAGINA',
  'hoofdstuk': 'HOOFD-STUK = CHAPTER (head piece)',
  'verhaal': 'For-HALL = STORY told in the hall',
  'gedicht': 'Ge-DICHT = POEM (tightly written)',
  'schrijver': 'SCRIBE-ver = WRITER - SCHRIJVER',
  'lezer': 'LEES-er = READER - LEZER',
  'nieuws': 'NEWS - NIEUWS',
  'krant': 'GRANT me the NEWSPAPER - KRANT',
  'tijdschrift': 'TIJD-SCHRIFT = MAGAZINE (time writing)',
  'artikel': 'ARTICLE - ARTIKEL',

  // Nature extras
  'plant': 'PLANT - same!',
  'gras': 'GRASS - GRAS',
  'blad': 'BLADE of grass / LEAF - BLAD',
  'tak': 'TACK a BRANCH to the wall - TAK',
  'wortel': 'WORT-el = ROOT - WORTEL (also: carrot)',
  'steen': 'STONE - STEEN sounds like STONE',
  'zand': 'SAND - ZAND sounds like SAND',
  'modder': 'MUDDER = MUD - MODDER',
  'rivier': 'RIVER - RIVIER',
  'meer': 'MERE = LAKE (also: more) - MEER',
  'oceaan': 'OCEAN - OCEAAN',
  'golf': 'GOLF on the WAVE - GOLF',
  'kust': 'COAST - KUST',
  'eiland': 'EYE-LAND = ISLAND',
  'bos': 'BOSS of the FOREST - BOS',
  'berg': 'BERG = MOUNTAIN (iceberg)',

  // Animals extras
  'paard': 'PART horse = HORSE - PAARD',
  'koe': 'COW - KOE sounds like COW',
  'varken': 'PORK-en = PIG - VARKEN',
  'schaap': 'SHEEP - SCHAAP',
  'kip': 'CHICKEN - KIP',
  'eend': 'END of the duck - EEND (duck)',
  'konijn': 'CONE-ijn = RABBIT (bunny cone ears)',
  'beer': 'BEAR - BEER',
  'leeuw': 'LION - LEEUW (roar!)',
  'tijger': 'TIGER - TIJGER',
  'olifant': 'ELEPHANT - OLIFANT',
  'aap': 'APE - AAP',
  'slang': 'SLANG is SNAKE talk - SLANG',
  'spin': 'SPIN a web, SPIDER - SPIN',
  'vlinder': 'FLUTTER = BUTTERFLY - VLINDER',
  'bij': 'BEE - BIJ (also: at/near)',
  'mier': 'MIRROR an ANT - MIER',

  // Misc remaining
  'ding': 'DING! That THING - DING',
  'iets': 'IT\'S SOMETHING - IETS',
  'niets': 'NYET, NOTHING - NIETS',
  'iemand': 'I-MAND = SOMEONE I demand',
  'niemand': 'NO-MAND = NOBODY - NIEMAND',
  'alles': 'ALL-es = EVERYTHING',
  'niks': 'NIX = NOTHING - NIKS',
  'fout': 'FOUL! That\'s a MISTAKE - FOUT',
  'juist': 'JUST right = CORRECT - JUIST',
  'waar': 'It\'s TRUE - WHERE\'s the proof? - WAAR',
  'onwaar': 'UN-TRUE = FALSE - ONWAAR',
  'echt': 'ACTUALLY REAL - ECHT',
  'nep': 'NAP on a FAKE bed - NEP',
  'soort': 'SORT of = KIND/TYPE - SOORT',
  'manier': 'MANNER = WAY/METHOD - MANIER',
  'kant': 'CANT tilt to one SIDE - KANT',
  'deel': 'DEAL out the PARTS - DEEL',
  'geheel': 'Ge-WHOLE = WHOLE - GEHEEL',
  'helft': 'HALF-t = HALF - HELFT',
  'rest': 'REST = REMAINDER - same!',
  'begin': 'BEGIN = BEGINNING - same!',
  'einde': 'END-e = END - EINDE',
  'midden': 'MIDDLE-n = MIDDLE - MIDDEN',
  'voorkant': 'VOOR-KANT = FRONT (fore-side)',
  'achterkant': 'ACHTER-KANT = BACK (after-side)',
  'bovenkant': 'BOVEN-KANT = TOP (above-side)',
  'onderkant': 'ONDER-KANT = BOTTOM (under-side)',
  'binnenkant': 'BINNEN-KANT = INSIDE',
  'buitenkant': 'BUITEN-KANT = OUTSIDE',

  // één (one) - the number
  'één': 'ONE and only - ÉÉN',
};

// Add mnemonics
let added = 0;
for (const word of words) {
  if (!word.mnemonic) {
    const mnemonic = allMnemonics[word.dutch];
    if (mnemonic) {
      word.mnemonic = mnemonic;
      added++;
    } else {
      // Generate a simple one for any remaining
      const dutch = word.dutch.toUpperCase();
      const english = word.english.split(',')[0].split('/')[0].trim().toUpperCase();
      word.mnemonic = `${dutch} → ${english}`;
      added++;
    }
  }
}

// Write back
fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2));
console.log(`Added ${added} mnemonics`);

// Count total
const total = words.filter(w => w.mnemonic).length;
console.log(`Total words with mnemonics: ${total}/${words.length}`);

// Show any still missing
const missing = words.filter(w => !w.mnemonic);
if (missing.length > 0) {
  console.log('Still missing:', missing.map(w => w.dutch).join(', '));
}
