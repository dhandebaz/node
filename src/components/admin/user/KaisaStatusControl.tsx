"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { toggleUserKaisaStatusAction } from "@/app/actions/kaisa";
import { Power } from "lucide-react";

export function KaisaStatusControl({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const status = user.products.kaisa?.status || "active";

  const handleToggle = async () => {
    if (!user.products.kaisa) return;
    
    const newStatus = status === "active" ? "paused" : "active";
    if (!confirm(`Are you sure you want to ${newStatus === "paused" ? "PAUSE" : "RESUME"} kaisa AI for this user?`)) return;

    setIsLoading(true);
    await toggleUserKaisaStatusAction(user.identity.id, newStatus);
    setIsLoading(false);
  };

  if (!user.products.kaisa) return null;

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
      <div>
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-1">
            Access Control
        </span>
        <span className={`text-sm font-medium ${status === "active" ? "text-green-400" : "text-amber-400"}`}>
            {status === "active" ? "Operational" : "Paused"}
        </span>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-2 transition-colors ${
            status === "active" 
                ? "border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-900" 
                : "border-green-900/50 text-green-400 hover:bg-green-900/20 hover:border-green-900"
        }`}
      >
        <Power className="w-3 h-3" />
        {isLoading ? "Updating..." : status === "active" ? "Pause Access" : "Resume Access"}
      </button>
    </div>
  );
}
