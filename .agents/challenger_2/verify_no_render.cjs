const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard';
const noRenderDir = path.join(baseDir, 'no render');

function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const allNoRenderFiles = getAllFiles(noRenderDir);
console.log(`Total files in 'no render' directory: ${allNoRenderFiles.length}`);

// Categorize files in 'no render'
let weaponsCount = 0;
let enemyGridCount = 0;
let enemyNonGridCount = 0;
let bodyCount = 0;
let otherCount = 0;

const enemyGridFiles = [];
const weaponFiles = [];
const nonGridEnemyFiles = [];

for (const filePath of allNoRenderFiles) {
  const relPath = path.relative(noRenderDir, filePath);
  const baseName = path.basename(filePath);

  // Check if it's in weapons or weapon filename pattern
  if (relPath.includes('weapons') || relPath.includes('weapon') || baseName.startsWith('WEAPON_')) {
    weaponsCount++;
    weaponFiles.push(relPath);
  } else if (relPath.includes('enemies') || relPath.includes('enemy')) {
    // Check if it's an enemy grid file
    if (baseName.includes('grid') || baseName.match(/\d+x\d+/)) {
      enemyGridCount++;
      enemyGridFiles.push(relPath);
    } else {
      enemyNonGridCount++;
      nonGridEnemyFiles.push(relPath);
    }
  } else if (relPath.includes('body')) {
    bodyCount++;
  } else {
    otherCount++;
  }
}

console.log(`--- No Render Detailed Count Breakdown ---`);
console.log(`Weapons count: ${weaponsCount}`);
console.log(`Enemy grid files count: ${enemyGridCount}`);
console.log(`Enemy non-grid files count: ${enemyNonGridCount}`);
console.log(`Body files count: ${bodyCount}`);
console.log(`Other files count: ${otherCount}`);

console.log(`\nEnemy grid files list:`);
enemyGridFiles.forEach(f => console.log(`  - ${f}`));

console.log(`\nNon-grid enemy files list (first 10):`);
nonGridEnemyFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
