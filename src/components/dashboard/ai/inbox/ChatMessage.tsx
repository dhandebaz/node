"use client";

import { cn, timeAgo } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  senderType: "customer" | "ai" | "human" | "internal";
  content: string;
  timestamp: string;
}

export function ChatMessage({
  id,
  senderType,
  content,
  timestamp,
}: ChatMessageProps) {
  const isCustomer = senderType === "customer";
  const isAI = senderType === "ai";
  const isInternal = senderType === "internal";

  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
        isCustomer ? "mr-auto" : "ml-auto items-end"
      )}
    >
      <div
        className={cn(
          "px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
          isCustomer
            ? "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
            : isAI
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-tr-none"
            : isInternal
            ? "bg-amber-50 text-amber-900 border border-amber-100 rounded-tr-none italic"
            : "bg-zinc-900 text-white rounded-tr-none"
        )}
      >
        {content}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
          {isAI
            ? "OMNI AI"
            : isCustomer
            ? "CLIENT"
            : isInternal
            ? "INTERNAL NOTE"
            : "TEAM"}
        </span>
        <span className="text-[9px] font-bold text-zinc-300">•</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
          {timeAgo(timestamp)}
        </span>
      </div>
    </div>
  );
}
