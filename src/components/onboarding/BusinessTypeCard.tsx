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
        "public-panel-soft group h-full p-6 text-left transition-all duration-200 hover:-translate-y-1",
        selected && "ring-2 ring-[rgba(146,43,34,0.22)]",
      )}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/72 text-[var(--public-accent-strong)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--public-ink)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">{description}</p>
        </div>
        <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]">
          Select role
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
