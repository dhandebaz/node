"use client";

import { cn } from "@/lib/utils";
import { Loader2, User, Bot } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChatMessage } from "./ChatMessage";
import { Conversation } from "./ConversationListItem";

interface Message {
  id: string;
  senderType: "customer" | "ai" | "human" | "internal";
  content: string;
  timestamp: string;
}

interface ChatThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  aiPaused: boolean;
  onToggleAi: (paused: boolean) => void;
  onToggleSidebar: () => void;
  showSidebar: boolean;
}

export function ChatThread({
  conversation,
  messages,
  loading,
  aiPaused,
  onToggleAi,
  onToggleSidebar,
  showSidebar,
}: ChatThreadProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30">
        <div className="w-20 h-20 rounded-full bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-sm">
          <Bot className="w-10 h-10 text-zinc-300" />
        </div>
        <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tighter mb-2">Select a Conversation</h3>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto font-medium">
          Choose a client from the list on the left to start managing their engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/30 overflow-hidden">
      {/* Thread Header */}
      <div className="h-20 flex-shrink-0 border-b border-zinc-100 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 font-black text-lg shadow-sm border border-zinc-200">
            {conversation.customerName?.charAt(0) || "C"}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate">
              {conversation.customerName || conversation.customerPhone || "Anonymous Contact"}
            </h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
              Status: <span className="text-blue-600">{conversation.status.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
            <Label htmlFor="ai-pause" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Omni AI
            </Label>
            <Switch
              id="ai-pause"
              checked={!aiPaused}
              onCheckedChange={(checked) => onToggleAi(!checked)}
            />
          </div>
          <button
            onClick={onToggleSidebar}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              showSidebar 
                ? "bg-zinc-950 text-white border-zinc-900" 
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600/40" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest font-black">Starting a new conversation...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              senderType={msg.senderType}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))
        )}
      </div>
    </div>
  );
}
