"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";

interface ListingsGateProps {
  listingsCount: number;
}

export function ListingsGate({ listingsCount }: ListingsGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);

  useEffect(() => {
    // If no listings, and not on listings pages (or settings/billing/support which should be accessible), redirect
    // User said: "Bookings -> redirect, Calendar -> redirect, Inbox -> show message".
    // "Integrations -> limited".
    // "Listings -> FIRST CLASS PAGE".
    
    if (listingsCount === 0) {
      // Allow access to:
      // - /dashboard/ai/listings (and subpages like /new)
      // - /dashboard/ai/settings (maybe they need to config API keys?)
      // - /dashboard/billing (need to pay?)
      // - /dashboard/settings (profile)
      // - /dashboard/support
      // - /dashboard/ai/inbox (shows "Inbox is locked" message)
      // - /dashboard/ai/integrations (shows limited view)
      
      const allowedPaths = [
        "/dashboard/ai/listings",
        "/dashboard/ai/settings",
        "/dashboard/billing",
        "/dashboard/settings",
        "/dashboard/support",
        "/dashboard/ai/inbox",
        "/dashboard/ai/integrations"
      ];

      const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

      if (!isAllowed) {
        // Redirect to listings
        console.log(`[ListingsGate] Count is 0. Access denied to ${pathname}. Redirecting to listings.`);
        toast.error(`You must add a ${labels.listing.toLowerCase()} to unlock the dashboard.`);
        router.push("/dashboard/ai/listings");
      }
    } else {
        // Count > 0
        // console.log(`[ListingsGate] Count is ${listingsCount}. Access granted.`);
    }
  }, [listingsCount, pathname, router]);

  return null;
}
