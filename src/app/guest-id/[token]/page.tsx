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
        setError(err?.message || "This upload link has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void loadInfo();
    }
  }, [token]);

  const stayDates = useMemo(() => {
    if (!info?.checkIn || !info?.checkOut) return "";

    const formatter = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return `${formatter.format(new Date(info.checkIn))} to ${formatter.format(new Date(info.checkOut))}`;
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
      setError(err?.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-site min-h-screen">
        <div className="public-container flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="public-site min-h-screen">
        <div className="public-container flex min-h-screen items-center justify-center py-10">
          <div className="public-panel max-w-xl px-6 py-8 text-center sm:px-8 sm:py-10">
            <div className="relative z-10 space-y-4">
              <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="public-display text-4xl text-foreground">
                ID received
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Your host will review it shortly. Thank you for helping complete the
                check-in compliance step.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-site min-h-screen">
      <div className="public-container py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="public-pill text-sm font-semibold text-foreground">
            Nodebase Guest ID
          </Link>
          <div className="public-pill text-xs font-semibold text-muted-foreground">
            No login required
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-8rem)] gap-6 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-center">
          <section className="public-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="relative z-10 space-y-5">
              <div className="public-pill public-eyebrow">Guest verification</div>
              <h1 className="public-display text-4xl leading-[0.94] text-foreground sm:text-5xl">
                Upload your {idLabel(info?.idType)} for secure check-in.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Indian hospitality workflows often require a government-issued ID before
                arrival. This portal keeps the upload bounded to that specific purpose.
              </p>
              <div className="grid gap-3">
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Listing</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">
                    {info?.listingName || "Your stay"}
                  </div>
                </div>
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Stay window</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">
                    {stayDates || "Shared by the host"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="public-panel-soft p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <div className="public-eyebrow">Upload portal</div>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  Submit clear front and back images.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="rounded-[1.4rem] border border-border bg-background/90 p-5 text-center transition hover:-translate-y-0.5">
                  <div className="public-inset mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10/75 text-primary">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-foreground">
                    Front image
                  </div>
                  <div className="mt-2 text-xs leading-5 text-muted-foreground">
                    Capture the full front side with readable text.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => setFrontFile(event.target.files?.[0] || null)}
                  />
                  {frontFile ? (
                    <div className="mt-4 text-xs font-semibold text-primary">
                      {frontFile.name}
                    </div>
                  ) : null}
                </label>

                <label className="rounded-[1.4rem] border border-border bg-background/90 p-5 text-center transition hover:-translate-y-0.5">
                  <div className="public-inset mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10/75 text-primary">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-foreground">
                    Back image (optional)
                  </div>
                  <div className="mt-2 text-xs leading-5 text-muted-foreground">
                    Use this if the document has important information on the reverse.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => setBackFile(event.target.files?.[0] || null)}
                  />
                  {backFile ? (
                    <div className="mt-4 text-xs font-semibold text-primary">
                      {backFile.name}
                    </div>
                  ) : null}
                </label>
              </div>

              {error ? (
                <div className="rounded-[1.3rem] border border-[rgba(146,43,34,0.16)] bg-[rgba(214,88,74,0.08)] px-4 py-3 text-sm leading-6 text-primary">
                  {error}
                </div>
              ) : null}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="public-button w-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Submit ID
              </button>

              <p className="text-center text-sm leading-6 text-muted-foreground">
                Your ID is used only for check-in compliance and host review for this stay.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
