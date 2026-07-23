const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard';

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
      let count = 0;
      try {
        count = countFiles(fullPath);
      } catch (e) {}
      console.log(`${indent}[DIR] ${item.name} (${count} files total recursive)`);
      if (depth < 2) {
        explore(fullPath, depth + 1);
      }
    } else {
      // console.log(`${indent}[FILE] ${item.name}`);
    }
  }
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

console.log(`Scanning base directory: ${baseDir}`);
explore(baseDir);
