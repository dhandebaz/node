"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export function BusinessTypeCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: BusinessTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Select ${title} business type`}
      className={cn(
        "bg-white border border-zinc-200 group h-full p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-zinc-950/5 hover:-translate-y-1 rounded-[2rem]",
        selected && "ring-2 ring-blue-600/20 bg-blue-50/50 border-blue-600/30",
      )}
    >
      <div className="flex h-full flex-col gap-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors shadow-sm",
          selected ? "bg-blue-600 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tighter text-zinc-950 font-sans uppercase">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500 font-medium">{description}</p>
        </div>
        <div className={cn(
          "mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
          selected ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-950"
        )}>
          Select Ecosystem
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
