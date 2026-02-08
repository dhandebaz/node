"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, UploadCloud, ShieldCheck } from "lucide-react";

type UploadInfo = {
  id: string;
  bookingId: string;
  guestName: string;
  idType: string;
  status: string;
  listingName: string;
  checkIn: string;
  checkOut: string;
};

const idLabel = (value?: string) => {
  if (value === "aadhaar") return "Aadhaar";
  if (value === "passport") return "Passport";
  if (value === "driving_license") return "Driving License";
  if (value === "voter_id") return "Voter ID";
  return "Government ID";
};

export default function GuestIdUploadPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [info, setInfo] = useState<UploadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/guest-id/upload?token=${token}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Unable to load upload link.");
        }
        const data = await response.json();
        setInfo(data);
      } catch (err: any) {
        setError(err?.message || "Link expired.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadInfo();
    }
  }, [token]);

  const stayDates = useMemo(() => {
    if (!info?.checkIn || !info?.checkOut) return "";
    const checkIn = new Date(info.checkIn);
    const checkOut = new Date(info.checkOut);
    return `${checkIn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → ${checkOut.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  }, [info]);

  const handleSubmit = async () => {
    if (!token || !frontFile) {
      setError("Please upload the front image first.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const formData = new FormData();
      formData.append("token", token);
      formData.append("frontImage", frontFile);
      if (backFile) {
        formData.append("backImage", backFile);
      }
      const response = await fetch("/api/guest-id/upload", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Upload failed.");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#120707] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#120707] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-xl font-semibold">ID received</div>
          <div className="text-sm text-white/60">Your host will review it shortly. Thank you for helping us complete check-in compliance.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120707] text-white flex items-center justify-center px-6 py-10">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-widest text-white/40">Nodebase Guest ID</div>
          <h1 className="text-2xl font-semibold">{info?.listingName || "Your stay"}</h1>
          <div className="text-sm text-white/60">{stayDates}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Please upload your {idLabel(info?.idType)}</div>
            <div className="text-xs text-white/60">Hotels in India are required to collect a government-issued ID for check-in. Your host will review it securely.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="border border-white/10 rounded-xl p-4 text-sm text-white/70 flex flex-col items-center gap-2 cursor-pointer hover:border-white/30">
              <UploadCloud className="w-5 h-5" />
              <span>Front image</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
              />
              {frontFile && <span className="text-[10px] text-white/50">{frontFile.name}</span>}
            </label>
            <label className="border border-white/10 rounded-xl p-4 text-sm text-white/70 flex flex-col items-center gap-2 cursor-pointer hover:border-white/30">
              <UploadCloud className="w-5 h-5" />
              <span>Back image (optional)</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setBackFile(e.target.files?.[0] || null)}
              />
              {backFile && <span className="text-[10px] text-white/50">{backFile.name}</span>}
            </label>
          </div>

          {error && <div className="text-xs text-red-300">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-white text-black rounded-xl py-3 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit ID"}
          </button>
          <div className="text-[10px] text-white/40 text-center">No login required. We only use this ID for check-in compliance.</div>
        </div>
      </div>
    </div>
  );
}
