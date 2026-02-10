"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function TenantErrorOverlay() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 font-alfa-slab-one">
          Context Error
        </h2>
        
        <p className="text-white/60 mb-8">
          Unable to determine business context. Your account may not be linked to any active organization.
        </p>
        
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
