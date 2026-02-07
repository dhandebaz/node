"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Paperclip,
  Phone,
  Video,
  ChevronLeft,
  Check,
  CheckCheck,
  Bot
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function InboxPage() {
  const { messages, fetchDashboardData, isLoading } = useDashboardStore();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Group messages by guest/thread logic would go here.
  // For now, treating each message as a thread starter or latest message.
  
  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  // Mobile: If selectedMessageId is set, show Chat View, else show List View.
  // Desktop: Show List View on Left, Chat View on Right.

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex bg-[#1E0B0B] rounded-2xl border border-white/10 overflow-hidden relative">
      
      {/* Message List (Left Pane) */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 bg-[#2A0A0A] border-r border-white/10 flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300",
        selectedMessageId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#2A0A0A]">
          <h1 className="text-xl font-bold text-white tracking-tight">Inbox</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full text-white/60">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full text-white/60">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-white/40">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-white/5 transition-colors active:bg-white/10",
                    selectedMessageId === msg.id ? "bg-white/5 border-l-2 border-[var(--color-brand-red)]" : "border-l-2 border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                       {/* Channel Icon Mock */}
                       <div className={cn(
                         "w-2 h-2 rounded-full",
                         msg.channel === 'airbnb' ? "bg-[#FF5A5F]" : 
                         msg.channel === 'booking' ? "bg-[#003580]" : "bg-green-500"
                       )} />
                       <span className={cn("font-bold text-sm", !msg.read ? "text-white" : "text-white/70")}>
                         {msg.guestName || "Guest"}
                       </span>
                    </div>
                    <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">
                      {format(new Date(msg.timestamp), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                     <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium truncate max-w-[120px]">
                       Listing Name
                     </span>
                     {!msg.read && (
                       <span className="w-2 h-2 rounded-full bg-[var(--color-brand-red)]" />
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat View (Right Pane) */}
      <div className={cn(
        "flex-1 bg-[#1E0B0B] flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300",
        selectedMessageId ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {selectedMessage ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-[#250808]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMessageId(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-full text-white/60"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                  {selectedMessage.guestName?.charAt(0) || "G"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedMessage.guestName}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-white/50">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-full text-white/60">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-full text-white/60">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1E0B0B]">
               {/* Mock Conversation History */}
               <div className="flex justify-center mb-6">
                 <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-full">
                   Booking Confirmed • Oct 12 - 15
                 </span>
               </div>

               {/* Guest Message (The selected one) */}
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1">
                    {selectedMessage.guestName?.charAt(0)}
                 </div>
                 <div>
                   <div className="bg-[#2A0A0A] border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-white/90 leading-relaxed shadow-sm">
                     {selectedMessage.content}
                   </div>
                   <span className="text-[10px] text-white/30 mt-1 block ml-1">
                     {format(new Date(selectedMessage.timestamp), 'h:mm a')}
                   </span>
                 </div>
               </div>

               {/* AI Reply Mock */}
               <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                 <div className="w-8 h-8 rounded-full bg-[var(--color-brand-red)] flex-shrink-0 flex items-center justify-center mt-1 border border-white/10">
                    <Bot className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <div className="bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/20 rounded-2xl rounded-tr-none p-3 text-sm text-white/90 leading-relaxed shadow-sm">
                     <p className="mb-2">Hello! Thanks for your message. Yes, early check-in at 1 PM is possible as the previous guests leave early.</p>
                     <div className="flex gap-2 mt-2">
                       <button className="text-[10px] font-bold bg-[var(--color-brand-red)] text-white px-2 py-1 rounded-md shadow-sm">
                         Send Payment Link
                       </button>
                       <button className="text-[10px] font-bold bg-white/10 text-white px-2 py-1 rounded-md hover:bg-white/20">
                         Request ID
                       </button>
                     </div>
                   </div>
                   <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                     <span className="text-[10px] text-white/30">AI Draft • 10:42 AM</span>
                     <Check className="w-3 h-3 text-white/30" />
                   </div>
                 </div>
               </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#250808] border-t border-white/10 pb-safe md:pb-3">
              <div className="flex items-end gap-2 bg-[#1E0B0B] border border-white/10 rounded-2xl p-2 focus-within:border-white/30 transition-colors">
                <button className="p-2 hover:bg-white/5 rounded-full text-white/40">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none max-h-32 py-2 resize-none"
                  rows={1}
                />
                <button 
                  disabled={!replyText.trim()}
                  className="p-2 bg-[var(--color-brand-red)] text-white rounded-full disabled:opacity-50 disabled:bg-white/10 shadow-lg"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-white/30">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
