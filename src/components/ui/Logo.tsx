"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative select-none flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <text 
          x="50" 
          y="55" 
          dominantBaseline="central" 
          textAnchor="middle" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="1" 
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          className="text-[80px]"
        >
          nb
        </text>
      </svg>
    </div>
  );
}
