const fs = require('fs');

let file = 'src/app/(customer)/dashboard/ai/integrations/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /'bg-black\/20 border-white\/5 opacity-50'/g,
  "'bg-[var(--public-bg-soft)] border-[var(--public-line)]'"
);

content = content.replace(
  /className="w-full bg-white text-black hover:bg-gray-200"/g,
  'className="w-full public-button"'
);

fs.writeFileSync(file, content);
console.log('Fixed Google and IG inner cards.');
