import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve('./public/assets/min_max/min_max_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const enemies = manifest.enemies || [];
console.log(`Total enemies in manifest: ${enemies.length}`);
const names = enemies.map(e => e.id);
console.log(JSON.stringify(names, null, 2));
