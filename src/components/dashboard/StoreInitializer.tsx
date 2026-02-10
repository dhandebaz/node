"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Tenant } from "@/types";

export function StoreInitializer({ tenant }: { tenant?: Tenant }) {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current && tenant) {
      useDashboardStore.getState().setTenant(tenant);
      initialized.current = true;
    }
  }, [tenant]);

  return null;
}
