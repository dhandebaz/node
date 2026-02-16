const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'FIREBASE_PROJECT_ID',
  // 'FIREBASE_CLIENT_EMAIL', // Often handled via google-application-credentials in advanced setups, but good to check if using direct creds
  // 'FIREBASE_PRIVATE_KEY',
  // 'SUPABASE_SERVICE_ROLE_KEY' // Needed for admin actions
];

const missingVars = requiredVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('\n\x1b[31m%s\x1b[0m', '❌ ERROR: Missing required environment variables:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\n\x1b[33m%s\x1b[0m', 'Please add them to your .env.local file or deployment configuration.');
  console.error('\x1b[33m%s\x1b[0m', 'See .env.example for reference.\n');
  process.exit(1);
} else {
  console.log('\n\x1b[32m%s\x1b[0m', '✅ All required environment variables are present.\n');
}
