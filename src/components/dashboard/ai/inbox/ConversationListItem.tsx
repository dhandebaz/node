"use client";

import { motion } from "framer-motion";
import { cn, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface Conversation {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  channel: "whatsapp" | "instagram" | "messenger" | "web" | "voice";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  manager: { slug: string; name: string };
  status:
    | "draft"
    | "payment_pending"
    | "paid"
    | "scheduled"
    | "open"
    | "resolved";
  bookingId?: string | null;
  guestId?: string;
  aiPaused?: boolean;
}

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: LucideIcon;
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
  icon: Icon,
}: ConversationListItemProps) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "w-full p-5 flex items-start gap-4 transition-all border-b border-zinc-50 relative group",
        isSelected ? "bg-blue-50/50" : "hover:bg-zinc-50"
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full"
        />
      )}

      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-500 font-black text-xl shadow-sm border border-zinc-200">
          {conversation.customerName?.charAt(0) || "C"}
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg border border-zinc-100 shadow-md">
            <Icon className="w-3 h-3 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-start mb-1">
          <h3
            className={cn(
              "text-sm font-black truncate tracking-tight uppercase",
              conversation.unreadCount > 0 ? "text-zinc-950" : "text-zinc-600"
            )}
          >
            {conversation.customerName || conversation.customerPhone || "Anonymous Contact"}
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {timeAgo(conversation.lastMessageAt)}
          </span>
        </div>
        <p
          className={cn(
            "text-xs line-clamp-2 leading-relaxed transition-colors",
            conversation.unreadCount > 0 ? "text-zinc-800 font-medium" : "text-zinc-500"
          )}
        >
          {conversation.lastMessage || "No messages yet"}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {conversation.unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white border-0 px-2 min-w-[20px] h-5 flex items-center justify-center font-black">
              {conversation.unreadCount}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[9px] h-4 bg-zinc-100 border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider"
          >
            {conversation.manager.name}
          </Badge>
          {conversation.aiPaused && (
            <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] h-4 font-bold uppercase tracking-wider">
              P-MANUAL
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
