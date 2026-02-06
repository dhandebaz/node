import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Access environment variables securely
const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    
    throw new Error(`Server Configuration Error: Missing Supabase env vars: ${missing.join(", ")}`);
  }

  return { url, serviceRoleKey };
};

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const { url, serviceRoleKey } = getSupabaseEnv();

  // Create a server client with the Service Role Key
  // This client has admin privileges (bypasses RLS)
  // It also integrates with Next.js cookies for session management if needed
  return createServerClient(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
