const fs = require('fs');
const inputFile = 'C:/Users/hudav/.gemini/antigravity/brain/a27fd31d-3ba6-4a7f-8373-4e1c8ff6d593/.system_generated/steps/389/output.txt';
const outputFile = 'c:/Users/hudav/Documents/trae_projects/node/src/types/supabase.ts';
try {
  const content = fs.readFileSync(inputFile, 'utf8');
  const parsed = JSON.parse(content);
  fs.writeFileSync(outputFile, parsed.types);
  console.log('Successfully wrote Supabase TS types to ' + outputFile);
} catch (e) {
  console.error('Error parsing/writing types:', e);
}
