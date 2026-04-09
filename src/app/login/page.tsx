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
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-white">
      {/* Subtle ambient glow - Optimized for Premium Light */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[35vw] w-[35vw] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 shadow-xl shadow-zinc-950/20">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <div className="font-display text-xl text-zinc-950 uppercase tracking-tighter leading-none">
              nodebase
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200 shadow-2xl rounded-3xl p-8 space-y-6">
          {showSuccess ? (
            <div className="space-y-4 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tighter uppercase">Access granted</h2>
              <p className="text-sm leading-6 text-zinc-500 font-medium">
                Redirecting you to the operator console.
              </p>
            </div>
          ) : step === "magic-link-sent" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Check your inbox</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                A magic link was sent to <span className="font-semibold text-foreground">{contact}</span>.
              </p>
              <button
                type="button"
                onClick={() => setStep("contact")}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Use another email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-black text-zinc-950 tracking-tighter uppercase">
                  Sign in to Nodebase
                </h1>
                <p className="mt-2 text-sm text-zinc-500 font-medium leading-relaxed">
                  Access the operator console for your business AI ecosystem.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  Secure auth
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 text-primary" />
                  OTP or Magic Link
                </div>
              </div>

              <button
                type="button"
                onClick={() => signInWithOAuth("google")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>or use email / phone</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {step === "contact" ? (
                <form onSubmit={handleSendAuthCode} className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Email or phone
                    <div className="relative">
                      {contact.includes("@") ? (
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      ) : (
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      )}
                      <input
                        required
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder="name@company.com or 9876543210"
                        className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </label>

                  {error ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-zinc-950/20 transition-all hover:bg-zinc-800 disabled:opacity-60 uppercase tracking-widest"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Request Access
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    One-time password
                    <input
                      required
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="123456"
                      className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sent to {contact}</span>
                    <button
                      type="button"
                      onClick={() => setStep("contact")}
                      className="font-semibold text-primary"
                    >
                      Change
                    </button>
                  </div>

                  {error ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-zinc-950/20 transition-all hover:bg-zinc-800 disabled:opacity-60 uppercase tracking-widest"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Verify and Continue
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
