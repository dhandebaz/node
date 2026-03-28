const fs = require('fs');
const content = fs.readFileSync('src/types/supabase.ts', 'utf8');
const lines = content.split('\n');
let inTables = false;
const tables = [];
lines.forEach(line => {
  if (line.includes('Tables: {')) inTables = true;
  if (inTables && line.match(/^ {6}[a-zA-Z_]+: \{/)) {
    tables.push(line.trim().slice(0, -3));
  }
  if (inTables && line.includes('Views: {')) inTables = false;
});
console.log(tables);
