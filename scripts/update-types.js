const fs = require('fs');
const path = require('path');

const inputPath = "C:\\Users\\hudav\\.gemini\\antigravity\\brain\\a27fd31d-3ba6-4a7f-8373-4e1c8ff6d593\\.system_generated\\steps\\1019\\output.txt";
const outputPath = "c:\\Users\\hudav\\Documents\\trae_projects\\node\\src\\types\\supabase.ts";

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    if (data.types) {
        fs.writeFileSync(outputPath, data.types, 'utf8');
        console.log('Successfully updated src/types/supabase.ts');
    } else {
        console.error('Error: "types" field not found in JSON');
    }
} catch (err) {
    console.error('Error:', err.message);
}
