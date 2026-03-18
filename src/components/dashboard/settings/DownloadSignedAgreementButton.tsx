"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";

export function DownloadSignedAgreementButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth<{
        url: string;
        filename: string;
        version?: string | null;
        signedAt?: string | null;
      }>("/api/legal/agreement/latest", { cache: "no-store" });

      if (!data?.url) throw new Error("Download link unavailable");

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message || "Failed to download agreement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--public-bg-soft)] text-[var(--public-ink)] border border-[var(--public-line)] text-[var(--public-ink)] hover:public-panel transition-colors disabled:opacity-60"
      type="button"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      <span className="text-sm font-medium">Download signed agreement</span>
    </button>
  );
}

