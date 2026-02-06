import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Access environment variables securely
const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer Service Role Key for Admin access (standard or custom), fallback to Anon Key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                         process.env.nodebase_SUPABASE_SERVICE_ROLE_KEY || 
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    
    throw new Error(`Server Configuration Error: Missing Supabase env vars: ${missing.join(", ")}`);
  }

  // Warn if running with Anon Key on server (likely insufficient for admin tasks)
  const isAnon = serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isServiceRole = serviceRoleKey === process.env.SUPABASE_SERVICE_ROLE_KEY || serviceRoleKey === process.env.nodebase_SUPABASE_SERVICE_ROLE_KEY;

  if (isAnon && !isServiceRole) {
    console.warn("Supabase Server Client: Running with ANON KEY. Admin privileges (RLS bypass) are DISABLED. Some server actions may fail.");
  }

  return { url, key: serviceRoleKey };
};

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  // Create a server client
  return createServerClient(url, key, {
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
