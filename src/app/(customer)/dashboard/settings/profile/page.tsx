"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { DownloadSignedAgreementButton } from "@/components/dashboard/settings/DownloadSignedAgreementButton";

export default function ProfileSettingsPage() {
  const { host } = useAuthStore();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth<{ tenant?: { kyc_status?: string | null } }>("/api/host/me", {
      cache: "no-store",
    })
      .then((data) => {
        setKycStatus(data?.tenant?.kyc_status || "not_started");
      })
      .finally(() => setLoading(false));
  }, []);

  if (!host) {
    return <SessionExpiredCard />;
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--public-ink)] mb-1">Profile & KYC</h1>
        <p className="text-[var(--public-muted)]">
          Keep your profile and verification status up to date.
        </p>
      </div>

      <div className="dashboard-surface p-6 space-y-4">
        <div className="text-sm font-semibold text-[var(--public-ink)]">Profile</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-[var(--public-line)] rounded-xl p-4">
            <div className="text-xs text-[var(--public-ink)]/50 uppercase tracking-wider">
              Name
            </div>
            <div className="text-[var(--public-ink)] mt-2">{host.name || "—"}</div>
          </div>
          <div className="bg-white/5 border border-[var(--public-line)] rounded-xl p-4">
            <div className="text-xs text-[var(--public-ink)]/50 uppercase tracking-wider">
              Email
            </div>
            <div className="text-[var(--public-ink)] mt-2">{host.email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-surface p-6 space-y-6">
        <div>
          <div className="text-sm font-semibold text-[var(--public-ink)]">
            KYC Verification
          </div>
          <div className="text-xs text-[var(--public-ink)]/50 mt-2">
            Verification documents are stored securely for compliance.
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-[var(--public-line)] rounded-xl p-4">
            <div className="text-xs text-[var(--public-ink)]/50 uppercase tracking-wider">
              Status
            </div>
            <div className="text-[var(--public-ink)] mt-2 capitalize">
              {loading ? "loading" : String(kycStatus).replaceAll("_", " ")}
            </div>
          </div>
          <div className="bg-white/5 border border-[var(--public-line)] rounded-xl p-4">
            <div className="text-xs text-[var(--public-ink)]/50 uppercase tracking-wider">
              Agreement
            </div>
            <div className="text-[var(--public-ink)] mt-2">
              {kycStatus === "verified" ? "Signed" : "Pending"}
            </div>
          </div>
          <div className="bg-white/5 border border-[var(--public-line)] rounded-xl p-4">
            <div className="text-xs text-[var(--public-ink)]/50 uppercase tracking-wider">
              Storage
            </div>
            <div className="text-[var(--public-ink)] mt-2">Encrypted</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/dashboard/verification")}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
            type="button"
          >
            {kycStatus === "verified"
              ? "View verification"
              : "Start verification"}
          </button>
          {kycStatus === "verified" ? <DownloadSignedAgreementButton /> : null}
        </div>
      </div>
    </div>
  );
}
