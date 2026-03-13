"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-white font-sans min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <Logo className="w-16 h-16" />
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl backdrop-blur-sm space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-white">System Malfunction</h1>
                <p className="text-zinc-400">
                    Something went wrong within the Nodebase core. Our engineers have been notified.
                </p>
            </div>

            <div className="text-xs font-mono text-zinc-600 bg-black/50 p-4 rounded-lg overflow-x-auto">
                {error.message || "Unknown Error"}
                {error.digest && <div className="mt-1 text-zinc-700">Ref: {error.digest}</div>}
            </div>

            <button
                onClick={reset}
                className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCcw size={18} />
                Reinitialize System
            </button>
          </div>
          
          <div className="text-xs text-zinc-600 uppercase tracking-widest">
            Nodebase Recovery Mode
          </div>
        </div>
      </body>
    </html>
  );
}
