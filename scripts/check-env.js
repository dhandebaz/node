const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local if present.
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const recommendedGroups = [
  {
    label: "app URL",
    keys: ["NEXT_PUBLIC_APP_URL", "APP_URL"],
  },
  {
    label: "Razorpay key ID",
    keys: ["RAZORPAY_KEY_ID", "key_id"],
  },
  {
    label: "Razorpay key secret",
    keys: ["RAZORPAY_KEY_SECRET", "key_secret"],
  },
  {
    label: "Meta App Credentials",
    keys: ["META_APP_ID", "META_APP_SECRET"],
  },
  {
    label: "Meta Webhook Verify Token",
    keys: ["META_VERIFY_TOKEN"],
  },
];

const missingVars = requiredVars.filter((key) => !process.env[key]);
const missingRecommended = recommendedGroups.filter(
  (group) => !group.keys.some((key) => process.env[key]),
);

if (missingVars.length > 0) {
  console.error(
    "\n\x1b[31m%s\x1b[0m",
    "ERROR: Missing required environment variables:",
  );
  missingVars.forEach((key) => console.error(`   - ${key}`));
  console.error(
    "\n\x1b[33m%s\x1b[0m",
    "Please add them to your .env.local file or deployment configuration.",
  );
  console.error(
    "\x1b[33m%s\x1b[0m",
    "See .env.example for reference.\n",
  );
  process.exit(1);
}

console.log(
  "\n\x1b[32m%s\x1b[0m",
  "OK: All required environment variables are present.\n",
);

if (missingRecommended.length > 0) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "Recommended variables not set:",
  );
  missingRecommended.forEach((group) =>
    console.warn(
      `   - ${group.label}: one of ${group.keys.join(", ")}`,
    ),
  );
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "The app has fallbacks for these values, but production behavior is safer when they are configured explicitly.\n",
  );
}
