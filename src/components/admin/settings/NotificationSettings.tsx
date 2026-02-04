
"use client";

import { NotificationSettings } from "@/types/settings";
import { updateNotificationsAction } from "@/app/actions/settings";
import { useState } from "react";
import { Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-yellow-400" />
        Notifications & Messages
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Channels</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button
                    onClick={() => handleToggle("systemMessagesEnabled")}
                    disabled={loading}
                    className={`p-3 rounded border flex items-center gap-3 ${
                        settings.systemMessagesEnabled
                            ? "bg-blue-900/10 border-blue-900/50 text-blue-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                    }`}
                 >
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-medium">In-App System</span>
                 </button>

                 <button
                    onClick={() => handleToggle("emailChannelEnabled")}
                    disabled={loading}
                    className={`p-3 rounded border flex items-center gap-3 ${
                        settings.emailChannelEnabled
                            ? "bg-green-900/10 border-green-900/50 text-green-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                    }`}
                 >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Channel</span>
                 </button>

                 <button
                    onClick={() => handleToggle("smsChannelEnabled")}
                    disabled={loading}
                    className={`p-3 rounded border flex items-center gap-3 ${
                        settings.smsChannelEnabled
                            ? "bg-purple-900/10 border-purple-900/50 text-purple-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                    }`}
                 >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">SMS Channel</span>
                 </button>
            </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-zinc-800">
            <label className="text-xs text-zinc-400 font-medium uppercase flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                Global Emergency Banner
            </label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    placeholder="Enter alert message to display on all pages (leave empty to disable)"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-900 placeholder:text-zinc-600"
                />
                <button
                    onClick={saveBanner}
                    disabled={loading || banner === (settings.emergencyBanner || "")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                    Update
                </button>
            </div>
            <p className="text-[10px] text-zinc-500">
                Visible to all users immediately. Use for outages or critical announcements only.
            </p>
        </div>
      </div>
    </div>
  );
}
