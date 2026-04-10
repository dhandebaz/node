"use client";

import { cn } from "@/lib/utils";
import { ArrowDownLeft, Zap, ShieldCheck, Tag, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ContextField {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "bad";
}

interface QuickAction {
  id: string;
  label: string;
  variant: "primary" | "secondary";
  action: string;
  disabled?: boolean;
}

interface Contact360SidebarProps {
  fields: ContextField[];
  quickActions: QuickAction[];
  onAction: (action: QuickAction) => void;
  getDisplayLabel: (label: string) => string;
}

export function Contact360Sidebar({
  fields,
  quickActions,
  onAction,
  getDisplayLabel,
}: Contact360SidebarProps) {
  // Mock data for "Smart Tags" and "Timeline" to show off the premium UI
  const tags = ["High Value", "Verified", "Priority"];
  const timeline = [
    { event: "Inquiry Started", time: "2h ago", icon: MessageSquare },
    { event: "ID Verified", time: "5h ago", icon: ShieldCheck },
    { event: "First Visit", time: "Yesterday", icon: Zap },
  ];

  return (
    <div className="w-85 flex-shrink-0 border-l border-zinc-100 bg-white/80 backdrop-blur-xl p-6 overflow-y-auto hidden lg:block scrollbar-none">
      <div className="space-y-10">
        {/* Header / Health Indicator */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Contact Intelligence
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] font-black text-green-700 uppercase tracking-tight">Healthy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {fields.map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i}
                className="group p-4 bg-zinc-50 hover:bg-white hover:shadow-xl hover:shadow-zinc-100 hover:border-zinc-200 rounded-3xl border border-zinc-100 transition-all duration-300"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 group-hover:text-zinc-500 transition-colors">
                  {getDisplayLabel(f.label)}
                </p>
                <p className="text-sm font-black text-zinc-950 uppercase tracking-tighter truncate leading-none">
                  {f.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Smart Tags Section */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Tag className="w-3 h-3" />
            Segment Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1.5 bg-zinc-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-zinc-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Engagement Feed
          </h3>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                    <item.icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                  </div>
                  {i !== timeline.length - 1 && (
                    <div className="w-[1px] flex-1 bg-zinc-100 my-1" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{item.event}</p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Clock className="w-2.5 h-2.5" />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Strategic Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction(action)}
                  className={cn(
                    "w-full p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all text-left group flex items-center justify-between",
                    action.variant === "primary"
                      ? "bg-zinc-950 text-white border-zinc-900 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {action.label}
                  <ArrowDownLeft className={cn(
                    "w-4 h-4 transition-all",
                    action.variant === "primary" ? "text-white/40 group-hover:text-white" : "text-zinc-300 group-hover:text-zinc-800"
                  )} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MessageSquare = ({ className }: { className: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
