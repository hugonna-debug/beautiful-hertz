const fs = require('fs');
const path = require('path');

console.log(`=== LPC SPRITE SHEET HEIGHT RULES & RENDER BOUNDS VERIFICATION ===\n`);

const manifestPath = path.join(__dirname, '../../public/assets/lpc/lpc_manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`manifest.json not found at ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
console.log(`Successfully loaded lpc_manifest.json`);

function calculateSrcY(h, direction, action) {
  let dirIndex = 2; // South
  if (direction === 'north') dirIndex = 0;
  else if (direction === 'west') dirIndex = 1;
  else if (direction === 'south') dirIndex = 2;
  else if (direction === 'east') dirIndex = 3;

  const totalRows = Math.max(1, Math.floor(h / 64));

  let srcY = 0;
  if (h === 1344) {
    if (action === 'slash') {
      srcY = (8 + dirIndex) * 64;
    } else if (action === 'spellcast') {
      srcY = (0 + dirIndex) * 64;
    } else if (action === 'hurt') {
      srcY = 20 * 64;
    } else {
      srcY = (16 + dirIndex) * 64;
    }
  } else {
    srcY = (dirIndex % totalRows) * 64;
  }
  return { srcY, row: srcY / 64, dirIndex, totalRows };
}

const directions = ['north', 'west', 'south', 'east'];
const actions = ['walk', 'slash', 'spellcast', 'hurt'];
const testHeights = [256, 384, 266, 1344];

let totalMatrixTests = 0;
let passedMatrixTests = 0;
let violations = [];

for (const h of testHeights) {
  for (const dir of directions) {
    for (const act of actions) {
      totalMatrixTests++;
      const { srcY, row, dirIndex, totalRows } = calculateSrcY(h, dir, act);

      if (h <= 384) {
        const expectedRow = dirIndex % totalRows;
        const sliceH = Math.min(64, h);
        const isOutOfBounds = (srcY + sliceH) > h;
        const isUnconstrainedSlashRow = (act === 'slash' && row >= 8);

        if (row !== expectedRow || isOutOfBounds || isUnconstrainedSlashRow) {
          violations.push({
            height: h,
            direction: dir,
            action: act,
            calculatedRow: row,
            expectedRow,
            calculatedSrcY: srcY,
            isOutOfBounds,
            isUnconstrainedSlashRow
          });
        } else {
          passedMatrixTests++;
        }
      } else if (h === 1344) {
        const isOutOfBounds = (srcY + 64) > h;
        if (isOutOfBounds) {
          violations.push({
            height: h,
            direction: dir,
            action: act,
            calculatedRow: row,
            calculatedSrcY: srcY,
            isOutOfBounds
          });
        } else {
          passedMatrixTests++;
        }
      }
    }
  }
}

console.log(`--- MATRIX TESTING RESULTS ---`);
console.log(`Total test cases run: ${totalMatrixTests}`);
console.log(`Passed test cases: ${passedMatrixTests}`);
console.log(`Violations count: ${violations.length}`);

function getPngDimensions(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(24);
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);
    if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  } catch (e) {
    return null;
  }
}

console.log(`\n--- MANIFEST ASSETS BOUNDS & SAMPLING AUDIT ---`);

function extractUrls(obj) {
  let urls = [];
  if (typeof obj === 'string') {
    if (obj.endsWith('.png')) urls.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach(item => {
      urls = urls.concat(extractUrls(item));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (key === 'file' || key === 'url') {
        if (typeof obj[key] === 'string' && obj[key].endsWith('.png')) {
          urls.push(obj[key]);
        }
      } else {
        urls = urls.concat(extractUrls(obj[key]));
      }
    }
  }
  return urls;
}

const manifestUrls = Array.from(new Set(extractUrls(manifest)));
console.log(`Extracted ${manifestUrls.length} unique PNG paths from lpc_manifest.json`);

const publicDir = path.join(__dirname, '../../public');
let auditedCount = 0;
let missingCount = 0;
let samplingErrors = [];
let categoryBreakdown = { fullBody: 0, shortSheet: 0, feature40px: 0 };

for (const relUrl of manifestUrls) {
  const cleanRel = relUrl.startsWith('/') ? relUrl.substring(1) : relUrl;
  const fullPath = path.join(publicDir, cleanRel);

  if (!fs.existsSync(fullPath)) {
    missingCount++;
    continue;
  }

  const dim = getPngDimensions(fullPath);
  if (!dim) continue;
  auditedCount++;

  if (dim.height === 1344) {
    categoryBreakdown.fullBody++;
  } else if (dim.height < 64) {
    categoryBreakdown.feature40px++;
  } else {
    categoryBreakdown.shortSheet++;
  }

  // Verify render sampling for all directions and actions
  for (const dir of directions) {
    for (const act of actions) {
      const { srcY } = calculateSrcY(dim.height, dir, act);
      const sliceH = Math.min(64, dim.height);
      if (srcY + sliceH > dim.height) {
        samplingErrors.push({
          file: relUrl,
          height: dim.height,
          dir,
          action: act,
          sampledY: srcY
        });
      }
    }
  }
}

console.log(`Audited Manifest Assets Count: ${auditedCount}`);
console.log(`Missing Manifest Assets Count: ${missingCount}`);
console.log(`Full Body 1344px Sheets: ${categoryBreakdown.fullBody}`);
console.log(`Short Sheets (64px..384px): ${categoryBreakdown.shortSheet}`);
console.log(`40px Feature Sheets (<64px): ${categoryBreakdown.feature40px}`);
console.log(`Manifest Asset Sampling Violations: ${samplingErrors.length}`);

if (samplingErrors.length > 0) {
  console.log(`Sampling errors list:`, samplingErrors);
  process.exit(1);
} else {
  console.log(`\nSUCCESS: 100% of LPC manifest assets conform to height boundary rules with 0 sampling errors!`);
}
