const fs = require('fs');
const path = require('path');

const verifiedDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard\\verified\\verified enemies';
const noRenderDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard\\no render\\no render enemies';

console.log('Checking directory exists:', fs.existsSync(verifiedDir));
if (!fs.existsSync(verifiedDir)) process.exit(1);

const files = fs.readdirSync(verifiedDir);
console.log('Total files found in verified enemies:', files.length);

let validPngs = 0;
let corruptedFiles = [];
let dimensionMap = {};
let gridCategories = {
  '64x64': [],
  '64xN (multi-row 64w)': [],
  'Nx64 (multi-col 64h)': [],
  'Multi-sprite grid (e.g. 128x128, 256x256, etc)': [],
  'Other / Non-standard': []
};

files.forEach(file => {
  const filePath = path.join(verifiedDir, file);
  try {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      corruptedFiles.push({ file, reason: '0 byte size' });
      return;
    }
    const buf = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);

    // PNG signature check: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
      corruptedFiles.push({ file, reason: 'Invalid PNG header signature' });
      return;
    }

    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const dimKey = width + 'x' + height;
    dimensionMap[dimKey] = (dimensionMap[dimKey] || 0) + 1;
    validPngs++;

    if (width === 64 && height === 64) {
      gridCategories['64x64'].push(file);
    } else if (width === 64 && height > 64) {
      gridCategories['64xN (multi-row 64w)'].push(file);
    } else if (width > 64 && height === 64) {
      gridCategories['Nx64 (multi-col 64h)'].push(file);
    } else if (width % 64 === 0 && height % 64 === 0) {
      gridCategories['Multi-sprite grid (e.g. 128x128, 256x256, etc)'].push(file);
    } else {
      gridCategories['Other / Non-standard'].push({ file, dim: dimKey });
    }
  } catch (err) {
    corruptedFiles.push({ file, reason: err.message });
  }
});

console.log('Valid PNGs:', validPngs);
console.log('Corrupted / Broken count:', corruptedFiles.length);
console.log('Corrupted / Broken files:', JSON.stringify(corruptedFiles, null, 2));
console.log('Dimension summary:', JSON.stringify(dimensionMap, null, 2));
console.log('Grid categories summary:', Object.keys(gridCategories).map(k => ({ category: k, count: gridCategories[k].length })));
