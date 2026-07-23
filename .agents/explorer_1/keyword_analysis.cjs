const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard\\verified\\verified enemies';
const files = fs.readdirSync(dir);

const keywords = [
  'slime', 'wolf', 'bat', 'skeleton', 'goblin', 'orc', 'demon', 'dragon',
  'zombie', 'lich', 'abomination', 'spider', 'golem', 'gargoyle', 'elemental',
  'minotaur', 'kobold', 'rat', 'worm', 'eye', 'serpent', 'beetle', 'hydra',
  'harpy', 'titan', 'knight', 'mage', 'sorcerer', 'cultist', 'basilisk',
  'centaur', 'gorgon', 'beholder', 'vampire', 'succubus', 'werewolf', 'mimic',
  'treant', 'imp', 'naga', 'sphinx', 'wyvern', 'manticore', 'cyclops', 'drone',
  'ghost', 'spectre', 'wraith', 'ghoul', 'mummy', 'drake', 'wyrm', 'hound',
  'ogre', 'fiend', 'behemoth', 'arachnid', 'cockatrice', 'ent', 'pixie', 'jelly',
  'robot', 'shadow', 'cyber', 'void', 'astral', 'crystal', 'mithril', 'cobalt',
  'lava', 'frost', 'fire', 'poison', 'chaos', 'boss', 'colossus', 'gladiator',
  'griffin', 'crawler', 'sentinel', 'overlord', 'architect', 'devourer'
];

const keywordMap = {};
keywords.forEach(kw => keywordMap[kw] = []);

let unmappedFiles = [];

files.forEach(f => {
  const lower = f.toLowerCase();
  let matched = false;
  keywords.forEach(kw => {
    if (lower.includes(kw)) {
      keywordMap[kw].push(f);
      matched = true;
    }
  });
  if (!matched) {
    unmappedFiles.push(f);
  }
});

console.log('=== KEYWORD MATCH SUMMARY ===');
const summary = Object.keys(keywordMap)
  .map(kw => ({ keyword: kw, count: keywordMap[kw].length }))
  .filter(item => item.count > 0)
  .sort((a, b) => b.count - a.count);

console.log(JSON.stringify(summary, null, 2));
console.log('Unmapped files count:', unmappedFiles.length);
console.log('Sample unmapped files (first 30):', unmappedFiles.slice(0, 30));
