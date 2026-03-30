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
    // We are disabling the forced redirect as per user request to allow 
    // exploring the dashboard even without listings.
    /*
    if (listingsCount === 0) {
      const allowedPaths = [
        "/dashboard/ai/listings",
        "/dashboard/ai/settings",
        "/dashboard/billing",
        "/dashboard/settings",
        "/dashboard/support",
      ];

      const isAllowed = pathname === "/dashboard/ai" || allowedPaths.some(path => pathname.startsWith(path));

      if (!isAllowed) {
        console.log(`[ListingsGate] Count is 0. Access denied to ${pathname}. Redirecting to listings.`);
        toast.error(`You must add a ${labels.listing.toLowerCase()} to unlock the dashboard.`);
        router.push("/dashboard/ai/listings");
      }
    }
    */
  }, [listingsCount, pathname, router, labels]);

  return null;
}
