"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface VerificationGateProps {
  kycStatus?: string;
  children: React.ReactNode;
}

export function VerificationGate({ kycStatus, children }: VerificationGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If KYC is not verified and we are not on the verification page
    if (kycStatus !== 'verified' && !pathname?.startsWith('/dashboard/verification')) {
      router.push('/dashboard/verification');
    }
    // If KYC is verified and we are on the verification page, go to dashboard
    if (kycStatus === 'verified' && pathname?.startsWith('/dashboard/verification')) {
      router.push('/dashboard');
    }
  }, [kycStatus, pathname, router]);

  // If we are redirecting, we might want to show nothing or a loader, 
  // but returning children allows the initial render to happen while effect runs.
  // To be stricter, we could return null if condition is met.
  
  if (kycStatus !== 'verified' && !pathname?.startsWith('/dashboard/verification')) {
      return null; // Don't flash content
  }

  return <>{children}</>;
}
