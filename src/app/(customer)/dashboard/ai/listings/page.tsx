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
        <h1 className="text-2xl font-bold text-[var(--text-default)] uppercase tracking-tight">
          {labels.listings}
        </h1>
        {canAddListing ? (
          <Link
            href="/dashboard/ai/listings/new"
            className="button button-primary flex items-center gap-2"
            aria-label={`Add new ${labels.listing.toLowerCase()}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">Add {labels.listing}</span>
          </Link>
        ) : (
          <button
            disabled
            className="button button-secondary opacity-60 cursor-not-allowed"
            aria-disabled="true"
            title={`You can only have one ${labels.listing.toLowerCase()}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">
              Max {labels.listings} reached
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
          <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : listings.length === 0 ? (
        <div
          className="panel panel-muted p-12 text-center space-y-6 flex flex-col items-center"
          role="region"
          aria-label="Empty listings state"
        >
          <div className="w-12 h-12 bg-[var(--bg-soft)] rounded-full flex items-center justify-center">
            <Home
              className="w-6 h-6 text-[var(--text-muted)]"
              aria-hidden="true"
            />
          </div>
          <div className="max-w-sm space-y-2">
            <h2 className="text-lg font-semibold text-[var(--text-default)]">
              No {labels.listings.toLowerCase()} found
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {labels.emptyListings}
            </p>
          </div>
          {canAddListing && (
            <Link
              href="/dashboard/ai/listings/new"
              className="button button-primary mt-4"
              aria-label={`Create your first ${labels.listing.toLowerCase()}`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add {labels.listing}
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
              className="card-elevated group overflow-hidden hover:shadow-md transition-all"
            >
              <Link
                href={`/dashboard/ai/listings/${listing.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive)] focus-visible:ring-offset-2 rounded-lg"
                aria-label={`Open ${listing.name} listing details`}
              >
                <div className="h-36 bg-[var(--bg-muted)] relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]/20">
                    <Home className="w-12 h-12" aria-hidden="true" />
                  </div>
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      listing.status === "active"
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-[var(--warning)]/15 text-[var(--warning)]"
                    }`}
                    role="status"
                    aria-label={`Status: ${listing.status}`}
                  >
                    {listing.status === "active" ? "Active" : "Incomplete"}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-default)] truncate">
                      {listing.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {listing.city}
                    </p>
                  </div>

                  <div
                    className="grid gap-3 pt-4 border-t border-[var(--line)]"
                    role="group"
                    aria-label="Listing details"
                  >
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-2">
                        <Link2 className="w-3 h-3" aria-hidden="true" />
                        Platforms connected
                      </span>
                      <span
                        className="text-[var(--text-default)] font-semibold"
                        aria-label={`${listing.platformsConnected?.length || 0} platforms connected`}
                      >
                        {listing.platformsConnected?.length || 0}
                      </span>
                    </div>
                    {showCalendar && (
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {labels.calendar} sync
                        </span>
                        <span
                          className="text-[var(--text-default)] font-semibold"
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
