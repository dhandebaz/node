"use client";

import { Bot, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InboxReplyAreaProps {
  replyText: string;
  setReplyText: (val: string) => void;
  isInternalNote: boolean;
  setIsInternalNote: (val: boolean) => void;
  sending: boolean;
  handleSend: (senderType: "human" | "ai") => void;
  suggestions: string[];
  setShowSmartLinkModal: (val: boolean) => void;
}

export function InboxReplyArea({
  replyText,
  setReplyText,
  isInternalNote,
  setIsInternalNote,
  sending,
  handleSend,
  suggestions,
  setShowSmartLinkModal
}: InboxReplyAreaProps) {
  return (
    <div className="p-6 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto space-y-4">
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setReplyText(s)}
                className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all whitespace-nowrap active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        <div className="relative group">
          <textarea
            id="message-input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isInternalNote ? "Type an internal note (only visible to team)..." : "Type a message to the client..."}
            className={cn(
              "w-full bg-zinc-50 border-zinc-200 rounded-3xl p-5 pr-14 text-sm focus:outline-none focus:ring-4 transition-all min-h-[100px] resize-none font-medium",
              isInternalNote 
                ? "focus:ring-amber-500/10 border-amber-200 bg-amber-50/30 text-amber-900" 
                : "focus:ring-blue-600/5 focus:bg-white"
            )}
          />
          <button
            onClick={() => handleSend("human")}
            disabled={sending || !replyText.trim()}
            className={cn(
              "absolute right-4 bottom-4 p-3 rounded-2xl transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-lg",
              isInternalNote ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-blue-600 text-white shadow-blue-500/20"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsInternalNote(!isInternalNote)}
               className={cn(
                 "text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2",
                 isInternalNote ? "text-amber-600" : "text-zinc-400 hover:text-zinc-600"
               )}
             >
               <Bot className="w-3.5 h-3.5" />
               {isInternalNote ? "Internal Note Active" : "Human Mode"}
             </button>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowSmartLinkModal(true)}
               className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-all"
             >
               <Sparkles className="w-3.5 h-3.5" />
               Create Booking Link
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
