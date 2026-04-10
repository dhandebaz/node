"use client";

import React, { useState } from "react";
import { 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  History,
  Target,
  Zap,
  ShieldCheck,
  Search,
  ChevronRight,
  ChevronDown,
  Trash2,
  Puzzle
} from "lucide-react";
import { OmniMemory, MemoryType } from "@/types/omni-learning";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const MEMORY_ICONS: Record<MemoryType, any> = {
  preference: Lightbulb,
  process: Zap,
  correction: AlertCircle,
  outcome: Target
};

interface MemoryListProps {
  memories: OmniMemory[];
  onDelete?: (id: string) => void;
}

export function MemoryList({ memories, onDelete }: MemoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <Brain className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">No memories recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory) => {
        const Icon = MEMORY_ICONS[memory.type] || Brain;
        const isExpanded = expandedId === memory.id;

        return (
          <div 
            key={memory.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-all duration-300",
              isExpanded 
                ? "bg-white/10 border-white/20 shadow-2xl" 
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div 
              className="p-4 cursor-pointer flex items-start gap-4"
              onClick={() => setExpandedId(isExpanded ? null : memory.id)}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isExpanded ? "bg-primary text-primary-foreground" : "bg-white/5 text-zinc-400 group-hover:text-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate uppercase tracking-wider">{memory.type}</h3>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={cn(
                  "text-xs text-zinc-400 transition-all",
                  isExpanded ? "" : "truncate"
                )}>
                  {memory.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(memory.id);
                    }}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="p-1 rounded-md bg-white/5">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-4">
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Source: {memory.source}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-[10px] font-medium text-primary uppercase tracking-wider">
                    Confidence: {Math.round(memory.confidence * 100)}%
                  </span>
                  <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-medium text-zinc-400 lowercase tracking-wider">
                    Status: {memory.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
