const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard';

function countFiles(dir) {
  let count = 0;
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
  } catch (e) {
    console.error(`Error reading ${dir}:`, e.message);
  }
  return count;
}

function explore(dir, depth = 0) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const indent = '  '.repeat(depth);
    if (item.isDirectory()) {
      const count = countFiles(fullPath);
      console.log(`${indent}[DIR] ${item.name} (${count} files total recursive)`);
      if (depth < 3) {
        explore(fullPath, depth + 1);
      }
    } else {
      if (depth === 0) console.log(`${indent}[FILE] ${item.name}`);
    }
  }
}

console.log(`Scanning base directory: ${baseDir}`);
explore(baseDir);
