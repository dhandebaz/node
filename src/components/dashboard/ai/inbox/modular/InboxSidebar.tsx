"use client";

import { Search, Filter, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationListItem, type Conversation } from "@/components/dashboard/ai/inbox/ConversationListItem";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InboxSidebarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  unreadOnly: boolean;
  setUnreadOnly: (val: boolean) => void;
  awaitingReplyOnly: boolean;
  setAwaitingReplyOnly: (val: boolean) => void;
  loadingList: boolean;
  filteredConversations: Conversation[];
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  channelIcon: Record<string, any>;
}

export function InboxSidebar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  unreadOnly,
  setUnreadOnly,
  awaitingReplyOnly,
  setAwaitingReplyOnly,
  loadingList,
  filteredConversations,
  selectedConversationId,
  setSelectedConversationId,
  channelIcon
}: InboxSidebarProps) {
  const [isFocused, setIsFocused] = (typeof window !== "undefined") ? require("react").useState(false) : [false, () => {}];

  return (
    <div className="w-80 md:w-96 border-r border-zinc-100 bg-white flex flex-col h-full overflow-hidden relative">
      {/* Search & Global Controls */}
      <div className="p-4 border-b border-zinc-50 space-y-4 bg-white/50 backdrop-blur-md z-10">
        <div className="relative group">
          <div className={cn(
            "absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-2xl blur opacity-0 transition duration-500 group-hover:opacity-100",
            isFocused && "opacity-100 blur-md from-blue-100 to-zinc-100"
          )} />
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300",
            isFocused ? "text-blue-500" : "text-zinc-400"
          )} />
          <Input 
            placeholder="Search Intelligence..." 
            className="relative pr-4 pl-10 h-11 bg-zinc-50 border-zinc-100 rounded-2xl text-sm font-black uppercase tracking-tighter transition-all focus:bg-white focus:ring-0 focus:border-zinc-200"
            value={searchTerm}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterBadge 
            active={statusFilter === "all"} 
            label="All" 
            onClick={() => setStatusFilter("all")} 
          />
          <FilterBadge 
            active={unreadOnly} 
            label="Unread" 
            count={filteredConversations.filter(c => c.unreadCount > 0).length}
            onClick={() => setUnreadOnly(!unreadOnly)} 
          />
          <FilterBadge 
            active={awaitingReplyOnly} 
            label="Attention" 
            onClick={() => setAwaitingReplyOnly(!awaitingReplyOnly)} 
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 py-4">
        <AnimatePresence mode="popLayout">
          {loadingList ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 p-4">
                  <Skeleton className="w-12 h-12 rounded-2xl bg-zinc-100" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-zinc-100" />
                    <Skeleton className="h-3 w-1/2 bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center mx-auto mb-4 border border-zinc-100 shadow-inner">
                <Search className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">No Intelligence Found</p>
            </motion.div>
          ) : (
            filteredConversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="mb-1"
              >
                <ConversationListItem
                  conversation={conv}
                  isSelected={conv.id === selectedConversationId}
                  onSelect={(id) => setSelectedConversationId(id)}
                  icon={channelIcon[conv.channel]}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterBadge({ active, label, count, onClick }: { active: boolean, label: string, count?: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
        active 
          ? "bg-zinc-950 text-white border-zinc-900 shadow-xl shadow-zinc-200 scale-105" 
          : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[9px]",
          active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
