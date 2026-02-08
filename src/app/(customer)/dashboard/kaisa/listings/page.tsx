"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Home, Plus, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";

export default function ListingsPage() {
  const { listings, fetchDashboardData, isLoading } = useDashboardStore();
  const [localListings, setLocalListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("local_listings_v2");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const mapped = parsed.map((item: any) => ({
      id: item.id,
      userId: "local",
      name: item.name,
      city: item.city || "",
      type: item.type,
      timezone: item.timezone || "Asia/Kolkata",
      status: item.status || "incomplete",
      createdAt: item.createdAt || null,
      internalNotes: item.internalNotes || null,
      platformsConnected: item.platformsConnected || [],
      calendarSyncStatus: item.calendarSyncStatus || "never_synced",
      nodebaseIcalUrl: item.nodebaseIcalUrl || ""
    }));
    setLocalListings(mapped);
  }, []);

  const combinedListings = useMemo(() => {
    const byId = new Map<string, Listing>();
    localListings.forEach((listing) => byId.set(listing.id, listing));
    listings.forEach((listing) => byId.set(listing.id, listing));
    return Array.from(byId.values());
  }, [listings, localListings]);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Properties</h1>
        <Link
          href="/dashboard/kaisa/listings/new"
          className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Property</span>
        </Link>
      </div>

      {isLoading && combinedListings.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </div>
      ) : combinedListings.length === 0 ? (
        <div className="text-center py-20 text-white/40 dashboard-surface">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No properties connected.</p>
          <Link
            href="/dashboard/kaisa/listings/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinedListings.map(listing => (
            <Link
              key={listing.id}
              href={`/dashboard/kaisa/listings/${listing.id}`}
              className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="h-36 bg-white/5 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <Home className="w-12 h-12" />
                </div>
                <div className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  listing.status === "active" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"
                }`}>
                  {listing.status === "active" ? "Active" : "Incomplete"}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{listing.name}</h3>
                <p className="text-sm text-white/60 mb-4 truncate">{listing.city}</p>

                <div className="grid gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="flex items-center gap-2">
                      <Link2 className="w-3 h-3" />
                      Platforms connected
                    </span>
                    <span className="text-white font-semibold">
                      {listing.platformsConnected?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Calendar sync
                    </span>
                    <span className="text-white font-semibold">
                      {listing.calendarSyncStatus === "connected"
                        ? "OK"
                        : listing.calendarSyncStatus === "error"
                          ? "Error"
                          : listing.calendarSyncStatus === "never_synced"
                            ? "Never synced"
                            : "Not connected"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
