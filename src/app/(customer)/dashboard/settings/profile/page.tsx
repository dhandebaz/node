"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";

export default function ProfileSettingsPage() {
  const { host } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<"not_started" | "pending" | "verified">("not_started");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!host) {
    return <SessionExpiredCard />;
  }

  const handleKycSubmit = async () => {
    setIsSaving(true);
    setMessage(null);
    setTimeout(() => {
      setKycStatus("pending");
      setIsSaving(false);
      setMessage("KYC submitted. Verification will start once the service is active.");
    }, 500);
  };

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Profile & KYC</h1>
        <p className="text-zinc-400">Keep your profile and verification status up to date.</p>
      </div>

      <div className="dashboard-surface p-6 space-y-4">
        <div className="text-sm font-semibold text-white">Profile</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-white/50 uppercase tracking-wider">Name</div>
            <div className="text-white mt-2">{host.name || "—"}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-white/50 uppercase tracking-wider">Email</div>
            <div className="text-white mt-2">{host.email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-surface p-6 space-y-6">
        <div>
          <div className="text-sm font-semibold text-white">KYC Verification</div>
          <div className="text-xs text-white/50 mt-2">
            Applies once AI is active. Uploads are stored locally for now.
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-white/50 uppercase tracking-wider">Status</div>
            <div className="text-white mt-2 capitalize">{kycStatus.replace("_", " ")}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-white/50 uppercase tracking-wider">ID Document</div>
            <div className="text-white mt-2">Pending upload</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-white/50 uppercase tracking-wider">Address Proof</div>
            <div className="text-white mt-2">Pending upload</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs text-white/50 uppercase tracking-wider">Upload ID</div>
            <input type="file" className="w-full text-xs text-white/70" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-white/50 uppercase tracking-wider">Upload Address Proof</div>
            <input type="file" className="w-full text-xs text-white/70" />
          </div>
        </div>
        {message && <div className="text-xs text-white/60">{message}</div>}
        <button
          onClick={handleKycSubmit}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-60"
        >
          {isSaving ? "Submitting..." : "Submit KYC"}
        </button>
      </div>
    </div>
  );
}
