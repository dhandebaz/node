"use client";

import { cn } from "@/lib/utils";
import { Hexagon } from "lucide-react";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("relative select-none flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] border border-blue-400/30 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
        <Hexagon className="h-5 w-5 fill-white/20" />
      </div>
      {!collapsed && (
        <span 
          className="font-display font-bold text-xl tracking-tighter text-white uppercase sm:text-2xl" 
        >
          nodebase
        </span>
      )}
    </div>
  );
}
