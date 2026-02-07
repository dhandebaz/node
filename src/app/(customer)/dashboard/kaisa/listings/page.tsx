"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect } from "react";
import { Loader2, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { listings, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Properties</h1>
        <button className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Property</span>
        </button>
      </div>

      {isLoading && listings.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-white/40 bg-[#2A0A0A] border border-white/10 rounded-2xl">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No properties connected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-[#2A0A0A] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-colors">
              <div className="h-40 bg-white/5 relative">
                {/* Placeholder Image */}
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <Home className="w-12 h-12" />
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  Active
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{listing.title}</h3>
                <p className="text-sm text-white/60 mb-4 truncate">{listing.location}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="text-xs text-white/40">
                     <span className="font-bold text-white">{listing.maxGuests}</span> Guests
                   </div>
                   <div className="text-xs text-white/40">
                     <span className="font-bold text-white">₹{listing.basePrice}</span> / night
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
