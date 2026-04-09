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
    Sparkles,
    Plus
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
    <div className="flex gap-8 overflow-x-auto pb-8 min-h-[calc(100vh-12rem)] scrollbar-none">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-white border border-zinc-100 shadow-sm", col.color)}>
                <col.icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-zinc-950 uppercase tracking-tighter">{col.title}</h3>
              <Badge className="bg-zinc-100 text-zinc-500 border-none font-black text-[10px]">
                {grouped[col.id].length}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-950 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-4 p-2 rounded-3xl bg-zinc-50/50 border border-zinc-200/50 transition-colors">
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
                  <Card className="p-5 bg-white border-zinc-200 rounded-3xl shadow-sm group-hover:border-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/5 transition-all cursor-pointer active:scale-[0.98]">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-zinc-950 truncate uppercase tracking-tight">
                            {conv.customerName || conv.customerPhone || "New Client"}
                          </h4>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">
                            {conv.customerPhone || "S-INQUIRY"}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed h-8 font-medium">
                        {conv.lastMessage || "Waiting for initial touchpoint..."}
                      </p>

                      <div className="flex items-center justify-between mt-1 pt-4 border-t border-zinc-50">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm",
                            conv.aiPaused 
                              ? "bg-amber-50 border-amber-100 text-amber-600" 
                              : "bg-blue-50 border-blue-100 text-blue-600"
                          )}>
                            {conv.aiPaused ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100">
                            {conv.channel}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {grouped[col.id].length === 0 && (
              <div className="h-28 rounded-[2rem] border-2 border-dashed border-zinc-200/50 flex flex-col items-center justify-center gap-2 bg-white/50">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                   <Plus className="w-4 h-4 text-zinc-300" />
                </div>
                <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Stage Empty</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
