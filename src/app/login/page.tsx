"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithOAuth, isLoading: authLoading } = useAuthStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"contact" | "otp" | "magic-link-sent">("contact");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    if (referralCode) {
      document.cookie = `nodebase-referral-code=${referralCode}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setShowSuccess(true);
        setTimeout(() => router.push("/dashboard/ai"), 900);
      }
    };

    void checkSession();
  }, [router]);

  const handleSendAuthCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contact.trim()) return;

    setLocalLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      const isEmail = contact.includes("@");

      if (isEmail) {
        const { error: requestError } = await supabase.auth.signInWithOtp({
          email: contact.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (requestError) throw requestError;
        setStep("magic-link-sent");
      } else {
        const formattedPhone = contact.startsWith("+") ? contact.trim() : `+91${contact.trim()}`;
        const { error: requestError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (requestError) throw requestError;
        setStep("otp");
      }
    } catch (err: any) {
      setError(err?.message || "Could not request access. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.trim().length < 6) return;

    setLocalLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      const formattedPhone = contact.startsWith("+") ? contact.trim() : `+91${contact.trim()}`;
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: "sms",
      });

      if (verifyError) throw verifyError;

      setShowSuccess(true);
      setTimeout(() => router.push("/dashboard/ai"), 900);
    } catch (err: any) {
      setError(err?.message || "The OTP could not be verified.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = authLoading || localLoading;

  return (
    <div className="public-site min-h-screen">
      <div className="public-container py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="public-inset flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[var(--public-accent)] text-white">
              <Logo className="h-8 w-8" />
            </div>
            <div>
              <div className="public-display text-xl text-[var(--public-ink)]">nodebase</div>
              <div className="public-eyebrow">Operator access</div>
            </div>
          </Link>
          <Link href="/" className="public-button-secondary px-5 py-3 text-sm font-semibold">
            Return home
          </Link>
        </div>

        <div className="grid min-h-[calc(100vh-8rem)] gap-6 pb-12 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:items-center">
          <section className="public-panel px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="relative z-10 space-y-6">
              <div className="public-pill public-eyebrow">Sign in</div>
              <h1 className="public-display max-w-4xl text-4xl leading-[0.94] text-[var(--public-ink)] sm:text-5xl lg:text-6xl">
                Access the operator console for your AI employees.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--public-muted)]">
                Log in to manage workflow rules, inbox activity, payment follow-up,
                trust settings, and the public surfaces attached to your business.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Access model</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--public-ink)]">
                    OTP or magic link
                  </div>
                </div>
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Primary use</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--public-ink)]">
                    Operator dashboard and deployment controls
                  </div>
                </div>
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Security</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]">
                    <ShieldCheck className="h-4 w-4 text-[var(--public-success)]" />
                    Session-aware authentication
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="public-panel-soft p-6 sm:p-8">
            <div className="space-y-6">
              {showSuccess ? (
                <div className="space-y-4 py-8 text-center">
                  <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--public-ink)]">Access granted</h2>
                  <p className="text-sm leading-6 text-[var(--public-muted)]">
                    Redirecting you to the operator dashboard.
                  </p>
                </div>
              ) : step === "magic-link-sent" ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--public-accent-soft)]/75 text-[var(--public-accent-strong)]">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--public-ink)]">Check your inbox</h2>
                  <p className="text-sm leading-6 text-[var(--public-muted)]">
                    A magic link was sent to <span className="font-semibold text-[var(--public-ink)]">{contact}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("contact")}
                    className="public-button-secondary px-5 py-3 text-sm font-semibold"
                  >
                    Use another email
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="public-eyebrow">Authentication</div>
                    <h2 className="mt-3 text-2xl font-semibold text-[var(--public-ink)]">
                      Continue into Nodebase
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => signInWithOAuth("google")}
                    disabled={isLoading}
                    className="public-button-secondary flex w-full items-center justify-center gap-3 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--public-muted)]">
                    <div className="h-px flex-1 bg-[rgba(61,44,25,0.12)]" />
                    <span>or use email / phone</span>
                    <div className="h-px flex-1 bg-[rgba(61,44,25,0.12)]" />
                  </div>

                  {step === "contact" ? (
                    <form onSubmit={handleSendAuthCode} className="grid gap-4">
                      <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                        Email or phone
                        <div className="relative">
                          {contact.includes("@") ? (
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--public-muted)]" />
                          ) : (
                            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--public-muted)]" />
                          )}
                          <input
                            required
                            value={contact}
                            onChange={(event) => setContact(event.target.value)}
                            placeholder="name@company.com or 9876543210"
                            className="public-input pl-11"
                          />
                        </div>
                      </label>

                      {error ? (
                        <div className="rounded-[1.3rem] border border-[rgba(146,43,34,0.16)] bg-[rgba(214,88,74,0.08)] px-4 py-3 text-sm leading-6 text-[var(--public-accent-strong)]">
                          {error}
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        Request access
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="grid gap-4">
                      <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                        One-time password
                        <input
                          required
                          value={otp}
                          onChange={(event) => setOtp(event.target.value)}
                          placeholder="123456"
                          className="public-input text-center font-mono text-lg tracking-[0.35em]"
                        />
                      </label>

                      <div className="flex items-center justify-between text-xs text-[var(--public-muted)]">
                        <span>Sent to {contact}</span>
                        <button
                          type="button"
                          onClick={() => setStep("contact")}
                          className="font-semibold text-[var(--public-accent-strong)]"
                        >
                          Change
                        </button>
                      </div>

                      {error ? (
                        <div className="rounded-[1.3rem] border border-[rgba(146,43,34,0.16)] bg-[rgba(214,88,74,0.08)] px-4 py-3 text-sm leading-6 text-[var(--public-accent-strong)]">
                          {error}
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Verify and continue
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="public-site min-h-screen">
          <div className="public-container flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--public-accent-strong)]" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
