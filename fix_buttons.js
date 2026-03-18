const fs = require('fs');
let file = 'src/app/(customer)/dashboard/verification/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Button\n\s*onClick=\{handleKycConfirm\}\n\s*disabled=\{loading\}\n\s*>/g, 
  `<Button\n                onClick={handleKycConfirm}\n                disabled={loading}\n                className="public-button w-full"\n              >`);
content = content.replace(/<Button\n\s*onClick=\{handleAgreementSign\}\n\s*disabled=\{loading\}\n\s*>/g,
  `<Button\n            onClick={handleAgreementSign}\n            disabled={loading}\n            className="public-button w-full"\n          >`);
fs.writeFileSync(file, content);
