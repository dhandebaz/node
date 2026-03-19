const fs = require('fs');

const file = 'src/lib/supabase/server.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix getSupabaseServer
content = content.replace(
  'return createServerClient(url, key, {',
  'return createServerClient(url, key, {\n    global: {\n      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),\n    },'
);

// Fix getSupabaseAdmin
content = content.replace(
  'return createClient(url, key, {',
  'return createClient(url, key, {\n    global: {\n      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),\n    },'
);

fs.writeFileSync(file, content);
console.log('Fixed supabase caching.');
