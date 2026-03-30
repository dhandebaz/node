"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Home, Plus, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";
import {
  getBusinessLabels,
  isCalendarEnabled,
  getPersonaCapabilities,
} from "@/lib/business-context";

export default function ListingsPage() {
  const { listings, fetchDashboardData, isLoading, tenant } =
    useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const showCalendar = isCalendarEnabled(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const canAddListing = capabilities.multi_listing || listings.length === 0;

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <section
      className="space-y-6 pb-24 md:pb-0"
      aria-label="Listings dashboard"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
            {labels.listings}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and sync your business properties</p>
        </div>
        {canAddListing ? (
          <Link
            href="/dashboard/ai/listings/new"
            className="button-primary flex items-center gap-2"
            aria-label={`Add new ${labels.listing.toLowerCase()}`}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="hidden md:inline">New {labels.listing}</span>
          </Link>
        ) : (
          <button
            disabled
            className="button-glass opacity-50 cursor-not-allowed"
            aria-disabled="true"
            title={`You can only have one ${labels.listing.toLowerCase()}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">
              Limit Reached
            </span>
          </button>
        )}
      </div>

      {isLoading && listings.length === 0 ? (
        <div
          className="flex justify-center py-20"
          role="status"
          aria-live="polite"
          aria-label="Loading listings"
        >
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
        </div>
      ) : listings.length === 0 ? (
        <div
          className="glass-panel p-16 text-center space-y-6 flex flex-col items-center relative overflow-hidden"
          role="region"
          aria-label="Empty listings state"
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2" />
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center relative border border-white/10">
            <Home
              className="w-8 h-8 text-zinc-400"
              aria-hidden="true"
            />
          </div>
          <div className="max-w-sm space-y-2 relative">
            <h2 className="text-2xl font-bold text-white">
              No {labels.listings.toLowerCase()} yet
            </h2>
            <p className="text-zinc-500">
              {labels.emptyListings}
            </p>
          </div>
          {canAddListing && (
            <Link
              href="/dashboard/ai/listings/new"
              className="button-primary mt-4 relative"
              aria-label={`Create your first ${labels.listing.toLowerCase()}`}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Create your first {labels.listing}
            </Link>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
        >
          {listings.map((listing) => (
            <article
              key={listing.id}
              role="listitem"
              className="glass-panel group overflow-hidden hover:-translate-y-1 transition-all duration-300"
            >
              <Link
                href={`/dashboard/ai/listings/${listing.id}`}
                className="block focus:outline-none rounded-2xl"
                aria-label={`Open ${listing.name} listing details`}
              >
                <div className="h-40 bg-white/5 relative border-b border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center text-white/5">
                    <Home className="w-16 h-16" aria-hidden="true" />
                  </div>
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                      listing.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                    role="status"
                    aria-label={`Status: ${listing.status}`}
                  >
                    {listing.status === "active" ? "Active" : "Incomplete"}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {listing.name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate mt-1">
                      {listing.city}
                    </p>
                  </div>

                  <div
                    className="grid gap-3 pt-5 border-t border-white/5"
                    role="group"
                    aria-label="Listing details"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                        Platforms connected
                      </span>
                      <span
                        className="text-white font-mono font-semibold"
                        aria-label={`${listing.platformsConnected?.length || 0} platforms connected`}
                      >
                        {listing.platformsConnected?.length || 0}
                      </span>
                    </div>
                    {showCalendar && (
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                          {labels.calendar} sync
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            listing.calendarSyncStatus === "connected"
                              ? "text-emerald-400"
                              : listing.calendarSyncStatus === "error"
                                ? "text-rose-400"
                                : "text-zinc-400"
                          }`}
                          aria-label={`Calendar sync: ${listing.calendarSyncStatus}`}
                        >
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
