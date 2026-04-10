"use client";

import { Search, Filter, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationListItem, type Conversation } from "@/components/dashboard/ai/inbox/ConversationListItem";
import { cn } from "@/lib/utils";

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
  return (
    <div className="w-80 md:w-96 border-r border-zinc-100 bg-white flex flex-col h-full overflow-hidden">
      {/* Search & Global Controls */}
      <div className="p-4 border-b border-zinc-50 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 h-11 bg-zinc-50 border-none rounded-2xl text-sm font-medium"
            value={searchTerm}
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
            label="Need Reply" 
            onClick={() => setAwaitingReplyOnly(!awaitingReplyOnly)} 
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {loadingList ? (
          <div className="p-4 space-y-4">
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
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">No matching chats</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedConversationId}
              onSelect={(id) => setSelectedConversationId(id)}
              icon={channelIcon[conv.channel]}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterBadge({ active, label, count, onClick }: { active: boolean, label: string, count?: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter transition-all shrink-0",
        active 
          ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200" 
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[10px]",
          active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
