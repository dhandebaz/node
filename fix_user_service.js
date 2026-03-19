const fs = require('fs');

const userFile = 'src/lib/services/userService.ts';
let userContent = fs.readFileSync(userFile, 'utf8');

userContent = userContent.replace(
  '        kyc: "pending", // Default for now',
  '        kyc: tenant?.kyc_status || "pending",'
);

userContent = userContent.replace(
  '        earlyAccess: tenant.early_access,',
  '        earlyAccess: tenant.early_access,\n        kyc_status: tenant.kyc_status,'
);

fs.writeFileSync(userFile, userContent);
console.log('Fixed User Service.');

