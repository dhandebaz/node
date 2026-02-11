import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window === "undefined") {
      console.warn("Supabase env vars missing during server render/build. Using placeholders.");
      return { 
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co", 
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder" 
      };
    }
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
