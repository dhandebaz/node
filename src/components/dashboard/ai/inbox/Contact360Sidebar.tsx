"use client";

import { cn } from "@/lib/utils";
import { ArrowDownLeft } from "lucide-react";

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
  return (
    <div className="w-80 flex-shrink-0 border-l border-zinc-200 bg-white p-6 overflow-y-auto hidden lg:block">
      <div className="space-y-8">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
            Client Profile
          </h3>
          <div className="space-y-4">
            {fields.map((f, i) => (
              <div
                key={i}
                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  {getDisplayLabel(f.label)}
                </p>
                <p className="text-sm font-black text-zinc-950 uppercase tracking-tighter truncate">
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {quickActions.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction(action)}
                  className={cn(
                    "w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all text-left group flex items-center justify-between",
                    action.variant === "primary"
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-100 hover:bg-blue-700"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {action.label}
                  <ArrowDownLeft className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
