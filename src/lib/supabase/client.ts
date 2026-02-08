import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase browser env vars.");
  }

  return { url, anonKey };
};

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
