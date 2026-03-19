const fs = require('fs');

const customerFile = 'src/app/actions/customer.ts';
let customerContent = fs.readFileSync(customerFile, 'utf8');

// Remove the early return
customerContent = customerContent.replace(
  '  const user = await userService.getUserById(session.userId);\n  if (user) return user;',
  '  // Bypassing userService.getUserById to use dashboard-specific complete queries'
);

fs.writeFileSync(customerFile, customerContent);
console.log('Fixed Customer profile early return bug.');

