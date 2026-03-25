
"use client";

import { NotificationSettings } from "@/types/settings";
import { updateNotificationsAction } from "@/app/actions/settings";
import { useState } from "react";
import { Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationSettingsPanel({ settings }: { settings: NotificationSettings }) {
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(settings.emergencyBanner || "");

  const handleToggle = async (key: keyof NotificationSettings) => {
    // @ts-ignore
    const current = settings[key];
    setLoading(true);
    await updateNotificationsAction({ [key]: !current });
    setLoading(false);
  };

  const saveBanner = async () => {
    setLoading(true);
    await updateNotificationsAction({ emergencyBanner: banner });
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center border border-warning/20 shadow-inner text-warning">
          <Bell className="w-5 h-5" />
        </div>
        Protocol Broadcasts
      </h3>

      <div className="space-y-6">
        <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2">Active Transmission Channels</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleToggle("systemMessagesEnabled")}
                    disabled={loading}
                    className={cn(
                      "p-5 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 shadow-sm",
                      settings.systemMessagesEnabled
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-muted/30 border-border text-muted-foreground/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", settings.systemMessagesEnabled ? "bg-primary/10 border-primary/20" : "bg-muted border-border")}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Direct</span>
                  </button>

                  <button
                    onClick={() => handleToggle("emailChannelEnabled")}
                    disabled={loading}
                    className={cn(
                      "p-5 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 shadow-sm",
                      settings.emailChannelEnabled
                          ? "bg-success/10 border-success/30 text-success"
                          : "bg-muted/30 border-border text-muted-foreground/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", settings.emailChannelEnabled ? "bg-success/10 border-success/20" : "bg-muted border-border")}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">SMTP Relay</span>
                  </button>

                  <button
                    onClick={() => handleToggle("smsChannelEnabled")}
                    disabled={loading}
                    className={cn(
                      "p-5 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 shadow-sm",
                      settings.smsChannelEnabled
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "bg-muted/30 border-border text-muted-foreground/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", settings.smsChannelEnabled ? "bg-accent/10 border-accent/20" : "bg-muted border-border")}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Cellular Link</span>
                  </button>
            </div>
        </div>

        <div className="space-y-4 pt-10 border-t border-border mt-4 group/emergency">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive flex items-center gap-4 ml-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
                Global Override Signal
            </label>
            <div className="flex gap-4">
                <input 
                    type="text"
                    placeholder="Input emergency broadcast payload..."
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-4 text-sm text-foreground focus:ring-2 focus:ring-destructive/20 font-bold outline-none transition-all placeholder:opacity-20 shadow-inner"
                />
                <button
                    onClick={saveBanner}
                    disabled={loading || banner === (settings.emergencyBanner || "")}
                    className="px-8 py-4 bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-destructive/20 disabled:opacity-20 active:scale-95"
                >
                    Broadcast
                </button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-2">
                Transmission will be immediate and visible on all authority-controlled interfaces.
            </p>
        </div>
      </div>
    </div>
  );
}
