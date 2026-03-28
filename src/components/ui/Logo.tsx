"use client";

import { cn } from "@/lib/utils";
import { Hexagon } from "lucide-react";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  // Acts as the permanent SINGLE SOURCE OF TRUTH for Nodebase branding.
  // Adapts naturally to both Light and Dark modes via `bg-primary` & `text-foreground`.
  return (
    <div className={cn("relative select-none flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-md shadow-primary/20 shrink-0">
        <Hexagon className="h-5 w-5 fill-current" />
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
