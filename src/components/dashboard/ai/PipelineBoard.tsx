"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    MessageCircle, 
    Clock, 
    CreditCard, 
    CheckCircle, 
    MoreVertical, 
    Bot,
    User,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  channel: "whatsapp" | "instagram" | "messenger" | "web" | "voice";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
  aiPaused?: boolean;
}

interface Column {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const COLUMNS: Column[] = [
  { id: "new", title: "New Leads", icon: MessageCircle, color: "text-blue-400" },
  { id: "triaging", title: "AI Triaging", icon: Sparkles, color: "text-purple-400" },
  { id: "closing", title: "Closing", icon: CreditCard, color: "text-orange-400" },
  { id: "active", title: "Active / Paid", icon: CheckCircle, color: "text-emerald-400" },
  { id: "resolved", title: "Resolved", icon: Clock, color: "text-zinc-500" },
];

export function PipelineBoard({ 
  conversations, 
  onSelect 
}: { 
  conversations: Conversation[], 
  onSelect: (id: string) => void 
}) {
  
  const getColumnId = (conv: Conversation) => {
    if (conv.status === "resolved") return "resolved";
    if (conv.status === "paid" || conv.status === "scheduled") return "active";
    if (conv.status === "payment_pending") return "closing";
    if (conv.unreadCount > 0) return "new";
    return "triaging";
  };

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = conversations.filter(c => getColumnId(c) === col.id);
    return acc;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-zinc-800">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <col.icon className={cn("w-4 h-4", col.color)} />
              <h3 className="text-sm font-semibold text-zinc-100">{col.title}</h3>
              <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 border-none ml-1">
                {grouped[col.id].length}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 p-1 rounded-xl bg-zinc-950/20 border border-transparent hover:border-white/5 transition-colors">
            <AnimatePresence mode="popLayout">
              {grouped[col.id].map((conv) => (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelect(conv.id)}
                  className="group"
                >
                  <Card className="p-4 bg-zinc-900/50 border-white/5 hover:border-primary/50 hover:bg-zinc-900 transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {conv.customerName || conv.customerPhone || "Unknown Guest"}
                          </h4>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
                            {conv.customerPhone}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                        {conv.lastMessage || "No messages yet"}
                      </p>

                      <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-md bg-zinc-800/50",
                            conv.aiPaused ? "text-orange-400" : "text-emerald-400"
                          )}>
                            {conv.aiPaused ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">
                            {conv.channel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-primary transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {grouped[col.id].length === 0 && (
              <div className="h-24 rounded-lg border border-dashed border-white/5 flex items-center justify-center">
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Empty Stage</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
