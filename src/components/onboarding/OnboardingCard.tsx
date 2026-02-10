"use client";

import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  productType: "ai_employee" | "space";
  gradient: string;
  borderColor: string;
  loading?: boolean;
  onSelect: () => void;
}

export function OnboardingCard({
  title,
  description,
  icon: Icon,
  productType,
  gradient,
  borderColor,
  loading,
  onSelect
}: OnboardingCardProps) {
  
  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-8 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100",
        borderColor
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br", gradient)} />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
            <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-black/50 transition-colors">
            <Icon className="w-8 h-8 text-white" />
            </div>
            {loading && <Loader2 className="w-6 h-6 animate-spin text-white/50" />}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}
