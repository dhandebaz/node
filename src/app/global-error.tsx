'use client';

import { Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { AlertTriangle, RefreshCw } from "lucide-react";

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${alfaSlabOne.variable} font-sans antialiased min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#D6001C] text-white`}>
        <div className="max-w-md w-full relative z-10">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 backdrop-blur-sm">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Something went wrong!</h2>
          <p className="mb-8 text-white/70 text-lg font-light">
            A critical error occurred. We apologize for the inconvenience.
          </p>
          
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#D6001C] rounded-full hover:bg-zinc-100 transition-all font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
