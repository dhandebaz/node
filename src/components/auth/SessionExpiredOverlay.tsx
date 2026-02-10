"use client";

import { useRouter } from "next/navigation";

export function SessionExpiredOverlay() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
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
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 font-alfa-slab-one">
          Session Expired
        </h2>
        
        <p className="text-white/60 mb-8">
          Your security session has timed out. Please log in again to continue accessing your dashboard.
        </p>
        
        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Log In Again
        </button>
      </div>
    </div>
  );
}
