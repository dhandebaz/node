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
      <div className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-lg shadow-md shadow-blue-500/20 border border-white/20 shrink-0">
        <Hexagon className="h-5 w-5 fill-white/20" />
      </div>
      {!collapsed && (
        <span 
          className="font-display font-semibold text-lg tracking-tight text-foreground" 
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          Nodebase
        </span>
      )}
    </div>
  );
}
