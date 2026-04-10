"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface InboxEmptyStateProps {
  labels: {
    listing: string;
    customers: string;
  };
}

export function InboxEmptyState({ labels }: InboxEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
        <MessageSquare className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">Inbox Locked</h3>
        <p className="text-zinc-500 font-medium max-w-sm">
          Add a {labels.listing.toLowerCase()} to start receiving messages
          from your {labels.customers.toLowerCase()}.
        </p>
      </div>
      <Link
        href="/dashboard/ai/listings"
        className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        Add {labels.listing}
      </Link>
    </div>
  );
}
