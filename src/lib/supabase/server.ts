import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Standard client for authenticated user actions (Respects RLS)
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder";

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
          // Handled by middleware
        }
      },
    },
  });
}

// Admin client for system actions (Bypasses RLS)
export async function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  
  // Try standard service role key first, then fallback to project-specific prefixed one
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
              process.env.nodebase_SUPABASE_SERVICE_ROLE_KEY || 
              "placeholder";

  if (url.includes("placeholder")) {
    console.error("[Supabase Admin] CRITICAL: SUPABASE_URL is not configured.");
  }
  if (key === "placeholder") {
    console.error("[Supabase Admin] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not configured.");
  } else {
    console.log("[Supabase Admin] Initializing with service role key (length: " + key.length + ")");
  }

  // Use standard createClient for admin/system actions to ensure RLS bypass
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
