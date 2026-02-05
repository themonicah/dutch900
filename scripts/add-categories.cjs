const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '..', 'src', 'data', 'words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

const adjSubcats = {
  emotions: ['blij','boos','bang','trots','moe','ziek','bezorgd','opgewonden','tevreden','teleurgesteld','dankbaar','verdrietig','jaloers','verbaasd','nerveus','eenzaam','gefrustreerd','gezond'],
  colors: ['rood','blauw','groen','geel','wit','zwart','oranje','paars','roze','grijs','bruin'],
  size: ['groot','klein','lang','kort','breed','smal','dik','dun','zwaar','licht'],
};

const nounSubcats = {
  people: ['man','vrouw','kind','vader','moeder','zoon','dochter','vriend','broer','zus','oom','tante','buur','dokter','baas','collega','leraar','lerares','student','leerling','klant'],
  body: ['hoofd','hand','voet','oog','oor','mond','neus','hart','lichaam','gezicht','haar','rug','been','arm','vinger','tand'],
  food: ['water','koffie','thee','brood','melk','kaas','ei','vlees','vis','groente','fruit','appel','sinaasappel','banaan','aardappel','rijst','pasta','soep','salade','boter','suiker','zout','peper','ontbijt','lunch','avondeten','taart','ijs','café','restaurant'],
  home: ['huis','deur','raam','kamer','keuken','tuin','badkamer','toilet','douche','woonkamer','slaapkamer','balkon','trap','lift','verdieping','muur','vloer','plafond','dak','bank','kast','lamp','televisie','koelkast','oven','magnetron','spiegel','handdoek','zeep','tandenborstel','tafel','stoel','bed','vork','mes','lepel','bord','kopje','glas','fles','pan','pot'],
  clothing: ['kleding','broek','overhemd','shirt','trui','jas','rok','jurk','schoen','laars','sok','muts','handschoen','sjaal','paraplu','bril','horloge','ring','ketting','hemd'],
  time: ['dag','week','maand','jaar','tijd','uur','minuut','ochtend','middag','avond','nacht','weekend','seizoen','eeuw','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag','januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december','lente','zomer','herfst','winter'],
  nature: ['zon','maan','regen','wind','sneeuw','boom','bloem','zee','berg','bos','ster','lucht','wolk','storm','temperatuur','graad','natuur','plant','gras','blad','zand','hout','strand','rivier','eiland','vuur','steen','stof','hond','kat','dier','vogel','koe','paard','slang','muis','spin'],
  transport: ['auto','fiets','trein','bus','vliegtuig','tram','metro','boot','luchthaven','halte','kaartje','paspoort','bagage','koffer','tas','richting','station'],
  places: ['stad','land','straat','weg','brug','plein','hoek','dorp','wijk','centrum','plek','hotel','winkel','supermarkt','markt'],
};

// Build reverse lookup maps
const adjLookup = {};
for (const [cat, list] of Object.entries(adjSubcats)) {
  for (const w of list) adjLookup[w] = cat;
}
const nounLookup = {};
for (const [cat, list] of Object.entries(nounSubcats)) {
  for (const w of list) nounLookup[w] = cat;
}

const counts = {};

for (const word of words) {
  let category;
  const dutch = word.dutch.toLowerCase();

  if (word.partOfSpeech === 'adjective') {
    category = adjLookup[dutch] || 'adjective';
  } else if (word.partOfSpeech === 'noun') {
    category = nounLookup[dutch] || 'noun';
  } else {
    category = word.partOfSpeech;
  }

  // Insert category after partOfSpeech by rebuilding the object
  const newWord = {};
  for (const [key, val] of Object.entries(word)) {
    newWord[key] = val;
    if (key === 'partOfSpeech') {
      newWord.category = category;
    }
  }
  // Replace in array
  Object.keys(word).forEach(k => delete word[k]);
  Object.assign(word, newWord);

  counts[category] = (counts[category] || 0) + 1;
}

fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2) + '\n');

console.log('Category counts:');
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sorted) {
  console.log(`  ${cat}: ${count}`);
}
console.log(`  TOTAL: ${words.length}`);
