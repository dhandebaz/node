const fs = require('fs');
const log = fs.readFileSync('ts_errors.log', 'utf16le');
const lines = log.split('\n');
const printErrors = (file) => {
  console.log(`\n--- ${file} ---`);
  lines.forEach((line, i) => {
    if (line.includes(file)) {
      console.log(line);
      for(let j=1; j<5; j++) {
         if (lines[i+j] && !lines[i+j].includes('.ts(') && !lines[i+j].includes('.tsx(')) console.log('  ' + lines[i+j].trim());
         else break;
      }
    }
  });
};
['src/lib/services/adminService.ts', 'src/lib/services/aiManagerPricingService.ts', 'src/lib/services/analyticsService.ts', 'src/lib/services/billingService.ts'].forEach(printErrors);
