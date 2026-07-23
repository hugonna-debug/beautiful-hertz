const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const verifiedDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard\\verified\\verified enemies';

function parsePng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    return { valid: false, reason: 'Invalid signature' };
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];

  while (offset < buf.length) {
    if (offset + 8 > buf.length) break;
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    offset += 8;

    if (type === 'IHDR') {
      width = buf.readUInt32BE(offset);
      height = buf.readUInt32BE(offset + 4);
      bitDepth = buf[offset + 8];
      colorType = buf[offset + 9];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.slice(offset, offset + len));
    } else if (type === 'IEND') {
      break;
    }
    offset += len + 4; // length + 4 bytes CRC
  }

  if (!idatChunks.length) {
    return { valid: false, reason: 'No IDAT chunks found' };
  }

  try {
    const compressed = Buffer.concat(idatChunks);
    const decompressed = zlib.inflateSync(compressed);
    
    // Quick transparency / blank check if standard RGBA (colorType 6) or indexed (colorType 3) or RGB (colorType 2)
    // Decompressed size for filter+pixels: height * (1 + width * bytesPerPixel)
    let isFullyBlank = false;
    if (colorType === 6 && bitDepth === 8) {
      // 4 bytes per pixel: R, G, B, A
      let nonZeroAlphaCount = 0;
      const bpp = 4;
      const stride = 1 + width * bpp;
      for (let y = 0; y < height; y++) {
        const rowStart = y * stride + 1; // skip filter byte
        for (let x = 0; x < width; x++) {
          const alpha = decompressed[rowStart + x * bpp + 3];
          if (alpha > 5) {
            nonZeroAlphaCount++;
          }
        }
      }
      if (nonZeroAlphaCount === 0) {
        isFullyBlank = true;
      }
    }

    return { valid: true, width, height, bitDepth, colorType, isFullyBlank };
  } catch (err) {
    return { valid: false, reason: 'IDAT decompression failed: ' + err.message };
  }
}

const files = fs.readdirSync(verifiedDir);
console.log('Auditing', files.length, 'PNG files in verified enemies...');

let corrupted = [];
let fullyBlank = [];
let validCount = 0;

files.forEach(file => {
  const res = parsePng(path.join(verifiedDir, file));
  if (!res.valid) {
    corrupted.push({ file, reason: res.reason });
  } else if (res.isFullyBlank) {
    fullyBlank.push(file);
    validCount++;
  } else {
    validCount++;
  }
});

console.log('--- AUDIT RESULTS ---');
console.log('Total audited:', files.length);
console.log('Valid PNGs:', validCount);
console.log('Corrupted / Decompression Failed:', corrupted.length, corrupted);
console.log('100% Fully Transparent / Blank PNGs:', fullyBlank.length, fullyBlank);
