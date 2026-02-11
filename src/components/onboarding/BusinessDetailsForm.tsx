"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessDetailsFormProps {
  onSubmit: (details: { propertyCount: number; platforms: string[] }) => void;
  loading: boolean;
}

const PLATFORMS = [
  { id: "airbnb", label: "Airbnb" },
  { id: "booking", label: "Booking.com" },
  { id: "mmt", label: "MakeMyTrip" },
  { id: "agoda", label: "Agoda" },
  { id: "direct", label: "Direct / WhatsApp" },
];

export function BusinessDetailsForm({ onSubmit, loading }: BusinessDetailsFormProps) {
  const [propertyCount, setPropertyCount] = useState<number>(1);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setPlatforms(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (propertyCount < 1) return;
    onSubmit({ propertyCount, platforms });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-white/80 uppercase tracking-wider">
          How many properties do you manage?
        </label>
        <input
          type="number"
          min="1"
          value={propertyCount}
          onChange={(e) => setPropertyCount(parseInt(e.target.value))}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-white/80 uppercase tracking-wider">
          Which platforms are you on?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                platforms.includes(platform.id)
                  ? "bg-blue-500/20 border-blue-500 text-white"
                  : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                platforms.includes(platform.id) ? "bg-blue-500 border-blue-500" : "border-white/30"
              )}>
                {platforms.includes(platform.id) && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="font-medium">{platform.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Configuring AI...
          </>
        ) : (
          "Configure My AI Employee"
        )}
      </button>
      
      <p className="text-center text-xs text-zinc-500">
        Setup takes less than 2 minutes. No credit card or platform passwords required now.
      </p>
    </form>
  );
}
