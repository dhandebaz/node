"use client";

import { useEffect } from "react";
import { Alfa_Slab_One } from "next/font/google";
import "./globals.css";

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
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${alfaSlabOne.className} ${alfaSlabOne.variable} antialiased min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900`}>
        <div className="p-8 max-w-md w-full bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600 font-display">System Error</h2>
          <p className="text-gray-600 mb-6">
            We encountered a critical system error. This usually happens when the server configuration is incomplete or the database connection is lost.
          </p>
          
          <div className="bg-gray-100 p-4 rounded mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-gray-700">
             {error.message || "Unknown error"}
          </div>

          <button
            onClick={() => reset()}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
