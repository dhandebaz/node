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
        "bg-white border-2 border-slate-100 group h-full p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 rounded-[2.5rem] relative overflow-hidden",
        selected && "border-indigo-600 ring-4 ring-indigo-50",
      )}
    >
      {selected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl -z-10 rounded-full" />
      )}
      
      <div className="flex h-full flex-col gap-5">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all duration-300 shadow-lg border-b-4",
          selected 
            ? "bg-indigo-600 text-white border-indigo-800 scale-110" 
            : "bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div>
          <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none mb-2">{title}</h3>
          <p className="text-sm font-bold text-slate-500 leading-snug">{description}</p>
        </div>
        
        <div className={cn(
          "mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
          selected ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-900"
        )}>
          Select Ecosystem
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
