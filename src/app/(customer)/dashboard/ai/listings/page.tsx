"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Home, Plus, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";
import { getBusinessLabels, isCalendarEnabled, getPersonaCapabilities } from "@/lib/business-context";

export default function ListingsPage() {
  const { listings, fetchDashboardData, isLoading, tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const showCalendar = isCalendarEnabled(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const canAddListing = capabilities.multi_listing || listings.length === 0;

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{labels.listings}</h1>
        {canAddListing ? (
          <Link
            href="/dashboard/ai/listings/new"
            className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add {labels.listing}</span>
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 bg-white/5 text-white/40 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
            title={`You can only have one ${labels.listing.toLowerCase()}`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Max {labels.listings} reached</span>
          </button>
        )}
      </div>

      {isLoading && listings.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-white/40 dashboard-surface">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>{labels.emptyListings}</p>
          {canAddListing && (
            <Link
              href="/dashboard/ai/listings/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add {labels.listing}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Link
              key={listing.id}
              href={`/dashboard/ai/listings/${listing.id}`}
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
                  {showCalendar && (
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {labels.calendar} sync
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
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
