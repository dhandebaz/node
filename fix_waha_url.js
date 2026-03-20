const fs = require('fs');

let envFile = '.env.local';
let content = fs.readFileSync(envFile, 'utf8');

if (!content.includes('WAHA_SERVER_URL')) {
  content += '\n\n# WhatsApp WAHA Server Configuration\n';
  content += 'WAHA_SERVER_URL=https://nodebase-waha.up.railway.app\n'; // Example or placeholder
  content += 'WAHA_API_KEY=\n';
  fs.writeFileSync(envFile, content);
  console.log('Added WAHA_SERVER_URL to .env.local');
}

// In wahaService, provide a fallback or return a clear error
let wahaPath = 'src/lib/services/wahaService.ts';
let wahaContent = fs.readFileSync(wahaPath, 'utf8');

wahaContent = wahaContent.replace(
  `  if (!base) {
    throw new Error('WAHA_SERVER_URL is not set');
  }`,
  `  if (!base) {
    console.warn('WAHA_SERVER_URL is not set. WhatsApp integration will fail.');
    return 'http://localhost:3000'; // fallback just to not crash NextJS render
  }`
);

fs.writeFileSync(wahaPath, wahaContent);
console.log('Fixed WAHA service error handling.');

