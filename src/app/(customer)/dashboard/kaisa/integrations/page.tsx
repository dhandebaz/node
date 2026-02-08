"use client";

import Link from "next/link";

export default function ListingIntegrationsPage() {
  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Listing Sync</h1>
        <p className="text-white/60 text-sm">Connect Airbnb, Booking.com, and MMT inside each listing.</p>
      </div>

      <div className="dashboard-surface p-6 space-y-4">
        <div className="text-sm text-white/70">
          Calendar sync now lives per listing. Open a listing to add external iCal URLs and copy your Nodebase calendar feed.
        </div>
        <Link
          href="/dashboard/kaisa/listings"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
        >
          Go to listings
        </Link>
      </div>
    </div>
  );
}
