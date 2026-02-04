"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className="relative flex items-center justify-center w-10 h-10">
        <div
          className={cn(
            "absolute inset-0 rounded-xl bg-black flex items-center justify-center text-white font-bold text-lg shadow-lg"
          )}
        >
          <span className="transition-opacity opacity-100">n</span>
        </div>
        
        {/* Decorative elements for static logo */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-saffron rounded-full border-2 border-white animate-pulse"></div>
      </div>
    </div>
  );
}
