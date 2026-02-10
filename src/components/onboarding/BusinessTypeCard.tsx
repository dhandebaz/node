"use client";

import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessTypeCardProps {
  title: string;
  description: string;
  icon: string; // Emoji
  selected: boolean;
  onSelect: () => void;
}

export function BusinessTypeCard({
  title,
  description,
  icon,
  selected,
  onSelect
}: BusinessTypeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-zinc-900 p-6 text-left transition-all hover:scale-[1.02]",
        selected 
          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500" 
          : "border-white/10 hover:border-white/20"
      )}
    >
      <div className="relative z-10 space-y-3">
        <div className="text-4xl">{icon}</div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}
