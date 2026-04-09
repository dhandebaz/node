"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { getCsrfToken } from "@/lib/api/csrf";
import { cn } from "@/lib/utils";

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
          throw new Error(payload?.error || "Unable to load authorization details.");
        }

        const data = await response.json();
        setInfo(data);
      } catch (err: any) {
        setError(err?.message || "This authorization link has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void loadInfo();
    }
  }, [token]);

  const timelineDates = useMemo(() => {
    if (!info?.checkIn || !info?.checkOut) return "";

    const formatter = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return `${formatter.format(new Date(info.checkIn))} — ${formatter.format(new Date(info.checkOut))}`;
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

      const csrf = getCsrfToken();
      const response = await fetch("/api/guest-id/upload", {
        method: "POST",
        headers: csrf ? { "x-csrf-token": csrf } : undefined,
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Upload failed.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-zinc-50 border border-zinc-200 rounded-[3rem] p-12 text-center shadow-2xl shadow-zinc-950/5">
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-950 text-white shadow-xl shadow-zinc-950/20">
              <CheckCircle2 className="h-10 w-10" strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">
                ID Received
              </h1>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                Your credentials have been securely provisioned. The business operator will review them shortly for compliance.
              </p>
            </div>
            <button 
              onClick={() => window.close()}
              className="mt-4 px-10 py-4 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all active:scale-95"
            >
              Close Authorization Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="bg-white border border-zinc-200 rounded-full px-6 py-2 shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950">Identity Portal</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Secure Institutional Verification
          </div>
        </header>

        <main className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] items-start">
          <section className="bg-white border border-zinc-200 rounded-[3rem] p-10 lg:p-16 shadow-sm">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Client Compliance</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-zinc-950 uppercase tracking-tighter leading-[0.9]">
                Verify your <span className="text-zinc-400">{idLabel(info?.idType)}</span> for secure deployment.
              </h1>
              
              <p className="text-xl font-medium text-zinc-500 leading-relaxed max-w-2xl">
                Modern business workflows require deep identity authentication to ensure compliance and security. This portal ensures your data stays bounded to this specific authorization.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-6 transition-all hover:bg-zinc-100">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Solution Context</div>
                  <div className="text-sm font-black text-zinc-950 uppercase tracking-tighter">
                    {info?.listingName || "Your Service"}
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-6 transition-all hover:bg-zinc-100">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Operational Timeline</div>
                  <div className="text-sm font-black text-zinc-950 uppercase tracking-tighter">
                    {timelineDates || "Shared during onboarding"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-zinc-950/5">
              <div className="space-y-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Step 1 — Extraction</div>
                  <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
                    Document Upload
                  </h2>
                </div>

                <div className="grid gap-4">
                  <label className={cn(
                    "flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 p-8 text-center transition-all hover:border-blue-300 group cursor-pointer",
                    frontFile && "bg-blue-50 border-blue-200"
                  )}>
                    <div className={cn(
                      "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-sm",
                      frontFile ? "bg-blue-600 text-white" : "bg-white text-zinc-400"
                    )}>
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-zinc-950 uppercase tracking-widest">
                        {frontFile ? "Awaiting Back Page" : "Front Side Image"}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                        High-fidelity JPG or PNG
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(event) => setFrontFile(event.target.files?.[0] || null)}
                    />
                    {frontFile && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2 bg-white px-3 py-1 rounded-full border border-blue-100">
                        {frontFile.name}
                      </div>
                    )}
                  </label>

                  <label className={cn(
                    "flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 p-8 text-center transition-all hover:border-blue-300 group cursor-pointer",
                    backFile && "bg-blue-50 border-blue-200"
                  )}>
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                      backFile ? "bg-blue-600 text-white shadow-lg" : "bg-white text-zinc-400 shadow-sm"
                    )}>
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-950">
                      Back Side (Optional)
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(event) => setBackFile(event.target.files?.[0] || null)}
                    />
                    {backFile && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">
                        {backFile.name}
                      </div>
                    )}
                  </label>
                </div>

                {error ? (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-xs font-black uppercase tracking-widest text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !frontFile}
                  className="w-full h-auto py-5 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-zinc-950/30 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Authorize Solution Initiation
                </button>

                <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                  Your identity documents are stored in institutional bunkers and used only for authorization matching.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
