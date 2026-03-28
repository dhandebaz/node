const fs = require('fs');

const log = fs.readFileSync('ts_errors.log', 'utf16le');
const lines = log.split('\n');

const fileErrors = {};

let currentFile = null;

for (const line of lines) {
  const match = line.match(/^([a-zA-Z0-9_\-\.\/\\]+\.tsx?)\(\d+,\d+\): error (TS\d+):/);
  if (match) {
    const file = match[1];
    const code = match[2];
    fileErrors[file] = (fileErrors[file] || 0) + 1;
  }
}

const sortedFiles = Object.entries(fileErrors)
  .sort((a, b) => b[1] - a[1])
  .map(([file, count]) => `${count} errors: ${file}`);

console.log(`Total files with errors: ${Object.keys(fileErrors).length}`);
console.log(sortedFiles.join('\n'));
