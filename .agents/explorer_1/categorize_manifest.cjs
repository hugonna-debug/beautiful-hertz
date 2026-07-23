const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('public/assets/min_max/min_max_manifest.json'));
const enemyList = manifest.enemies || [];

const CATEGORIES = [
  { name: 'Slimes / Blobs', tokens: ['slime', 'blob', 'jelly', 'ooze'] },
  { name: 'Wolves / Hounds', tokens: ['wolf', 'hound', 'warg', 'dog', 'bear', 'boar'] },
  { name: 'Bats / Flying', tokens: ['bat', 'harpy', 'gargoyle', 'griffin', 'gryphon'] },
  { name: 'Skeletons', tokens: ['skeleton', 'skeletal', 'bone'] },
  { name: 'Goblins', tokens: ['goblin', 'hobgoblin', 'kobold'] },
  { name: 'Orcs / Ogres', tokens: ['orc', 'ogre', 'troll', 'blork'] },
  { name: 'Demons / Imps', tokens: ['demon', 'devil', 'fiend', 'imp', 'succubus'] },
  { name: 'Dragons / Drakes', tokens: ['dragon', 'drake', 'wyrm', 'wyvern'] },
  { name: 'Zombies / Mummies', tokens: ['zombie', 'ghoul', 'mummy', 'undead'] },
  { name: 'Liches / Ghosts', tokens: ['lich', 'necromancer', 'spectre', 'ghost', 'wraith', 'phantom'] },
  { name: 'Abominations', tokens: ['abomination', 'mutant', 'behemoth'] },
  { name: 'Spiders', tokens: ['spider', 'arachnid', 'beetle', 'scorpion'] },
  { name: 'Golems / Elementals', tokens: ['golem', 'colossus', 'elemental', 'gargoyle', 'titan'] },
  { name: 'Eyes / Beholders', tokens: ['eye', 'beholder', 'gazer'] },
  { name: 'Robots / Drones', tokens: ['drone', 'robot', 'mecha', 'sentinel', 'cyber'] },
  { name: 'Ents / Plants', tokens: ['ent', 'treant', 'plant', 'fungus', 'mushroom'] },
  { name: 'Humanoid Warriors / Mages', tokens: ['knight', 'mage', 'sorcerer', 'cultist', 'acolyte', 'gladiator'] },
  { name: 'Serpents / Hydras / Naga', tokens: ['serpent', 'hydra', 'naga', 'snake', 'viper', 'adder'] }
];

const categoryCounts = {};
CATEGORIES.forEach(c => categoryCounts[c.name] = 0);
let uncategorized = [];

enemyList.forEach(e => {
  const idLower = e.id.toLowerCase();
  let matched = false;
  for (const c of CATEGORIES) {
    if (c.tokens.some(t => idLower.includes(t))) {
      categoryCounts[c.name]++;
      matched = true;
      break;
    }
  }
  if (!matched) {
    uncategorized.push(e.id);
  }
});

console.log('=== ENEMY MANIFEST CATEGORIZATION ===');
console.log(JSON.stringify(categoryCounts, null, 2));
console.log('Uncategorized count:', uncategorized.length);
console.log('Uncategorized sample (first 20):', uncategorized.slice(0, 20));
