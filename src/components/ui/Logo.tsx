"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("relative select-none flex items-center", className)}>
      {!collapsed && (
        <span 
          className="font-display font-bold text-xl tracking-tighter text-foreground" 
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          nodebase
        </span>
      )}
    </div>
  );
}
