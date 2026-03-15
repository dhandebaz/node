"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileUp,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  extractKycDataAction,
  completeGuestCheckinAction,
} from "@/app/actions/kyc";

interface GuestCheckoutFlowProps {
  link: any;
}

const stepOrder = ["details", "id_verification", "payment"] as const;
type FlowStep = (typeof stepOrder)[number] | "complete";

const fieldClassName = "public-input";

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read the selected file."));
        return;
      }

      const [, base64 = ""] = reader.result.split(",");
      resolve(base64);
    };

    reader.onerror = () =>
      reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function GuestCheckoutFlow({ link }: GuestCheckoutFlowProps) {
  const [step, setStep] = useState<FlowStep>(
    link.status === "paid" ? "complete" : "details",
  );
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    documentId: "",
    arrivalTime: "",
  });

  const listingTitle = link.listings?.title || "your stay";
  const amountLabel = useMemo(() => {
    const amount = Number(link.amount || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }, [link.amount]);

  const stayLabel = link.metadata?.startDate || "Dates shared by the host";

  const handleDetailsSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please provide your name, email, and phone number.");
      return;
    }

    setStep("id_verification");
  };

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);

    try {
      const base64 = await readFileAsBase64(file);
      const result = await extractKycDataAction(base64, file.type, true);

      if (!result.success || !result.details) {
        throw new Error("We could not verify the document.");
      }

      const details = result.details;

      setFormData((current) => ({
        ...current,
        idNumber: details.idNumber || "",
        documentId: result.documentId || "",
      }));

      toast.success("ID details verified.");
      setTimeout(() => setStep("payment"), 700);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "ID extraction failed. Please enter details manually.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handlePaymentComplete = async () => {
    setLoading(true);

    try {
      await completeGuestCheckinAction({
        linkId: link.id,
        tenantId: link.tenant_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        documentId: formData.documentId,
        arrivalTime: formData.arrivalTime,
      });

      setStep("complete");
      toast.success("Check-in completed successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete check-in.");
    } finally {
      setLoading(false);
    }
  };

  if (link.status === "expired") {
    return (
      <section className="public-panel px-6 py-8 text-center sm:px-8">
        <div className="relative z-10 space-y-4">
          <div className="public-inset mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(146,43,34,0.12)] text-[var(--public-accent-strong)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="public-display text-3xl text-[var(--public-ink)]">
            Link expired
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--public-muted)] sm:text-base">
            This booking link is no longer active. Please contact the host for a
            fresh payment and check-in link.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="public-panel-soft p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="public-eyebrow">Guest checkout flow</div>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--public-ink)]">
              {listingTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
              Complete your guest details, verify your ID, and confirm payment
              in one secure flow.
            </p>
          </div>
          <div className="grid gap-3 sm:min-w-52">
            <div className="public-inset rounded-[1.2rem] px-4 py-3">
              <div className="public-eyebrow">Stay</div>
              <div className="mt-2 text-sm font-semibold text-[var(--public-ink)]">
                {stayLabel}
              </div>
            </div>
            <div className="public-inset rounded-[1.2rem] px-4 py-3">
              <div className="public-eyebrow">Amount</div>
              <div className="mt-2 text-sm font-semibold text-[var(--public-accent-strong)]">
                {amountLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-panel-soft p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {stepOrder.map((stepId, index) => {
            const isActive = step === stepId;
            const isDone =
              step === "complete" || stepOrder.indexOf(step as any) > index;
            const Icon =
              stepId === "details"
                ? Calendar
                : stepId === "id_verification"
                  ? UserCheck
                  : CreditCard;

            return (
              <div key={stepId} className="flex flex-1 items-center gap-3">
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                    isActive
                      ? "border-[rgba(146,43,34,0.34)] bg-[var(--public-accent)] text-white"
                      : isDone
                        ? "border-[rgba(70,128,77,0.25)] bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]"
                        : "border-[var(--public-line)] bg-[rgba(255,249,240,0.76)] text-[var(--public-muted)]",
                  ].join(" ")}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="public-eyebrow">
                    {stepId === "details"
                      ? "Guest details"
                      : stepId === "id_verification"
                        ? "ID check"
                        : "Payment"}
                  </div>
                  {index < stepOrder.length - 1 ? (
                    <div className="mt-2 h-[2px] rounded-full bg-[rgba(61,44,25,0.08)]">
                      <div
                        className={[
                          "h-full rounded-full transition-all",
                          isDone
                            ? "w-full bg-[var(--public-success)]"
                            : isActive
                              ? "w-1/2 bg-[var(--public-accent)]"
                              : "w-0",
                        ].join(" ")}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {step === "details" ? (
        <section className="public-panel p-6 sm:p-8">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="public-eyebrow">Step 1</div>
              <h3 className="public-display mt-3 text-3xl text-[var(--public-ink)]">
                Confirm guest details
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                These details are used for check-in coordination and compliance.
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                  Full name
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Guest name"
                    className={fieldClassName}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                  Email address
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="guest@example.com"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                  Phone number
                  <input
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+91 98765 43210"
                    className={fieldClassName}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
                  Expected arrival time
                  <input
                    value={formData.arrivalTime}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        arrivalTime: event.target.value,
                      }))
                    }
                    placeholder="For example, 2:30 PM"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="public-button mt-2 px-6 py-3 text-sm font-semibold"
              >
                Continue to ID verification
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {step === "id_verification" ? (
        <section className="public-panel p-6 sm:p-8">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="public-eyebrow">Step 2</div>
              <h3 className="public-display mt-3 text-3xl text-[var(--public-ink)]">
                Upload a valid government ID
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                The host requires an ID for this stay. Aadhaar numbers are
                returned in masked form only.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-dashed border-[rgba(61,44,25,0.16)] bg-[rgba(255,251,244,0.76)] p-6 text-center">
              {extracting ? (
                <div className="space-y-4 py-6">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--public-accent-strong)]" />
                  <div className="text-sm font-semibold text-[var(--public-ink)]">
                    Verifying your document
                  </div>
                  <p className="text-sm text-[var(--public-muted)]">
                    This usually takes a few seconds.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--public-accent-soft)]/75 text-[var(--public-accent-strong)]">
                    <FileUp className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[var(--public-ink)]">
                      Upload ID image
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
                      Upload a clear photo of your PAN or Aadhaar card.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIdUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="public-button-secondary px-5 py-3 text-sm font-semibold"
                  >
                    Select document image
                  </button>
                </div>
              )}
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[var(--public-ink)]">
              ID number
              <input
                value={formData.idNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    idNumber: event.target.value,
                  }))
                }
                placeholder="Masked or extracted ID details appear here"
                className={fieldClassName}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="public-button-secondary px-5 py-3 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("payment")}
                disabled={!formData.idNumber}
                className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "payment" ? (
        <section className="public-panel p-6 sm:p-8">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="public-eyebrow">Step 3</div>
              <h3 className="public-display mt-3 text-3xl text-[var(--public-ink)]">
                Complete payment
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                Use the host instructions below, then confirm once payment is
                done.
              </p>
            </div>

            {link.tenants?.business_qr_url ? (
              <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-center">
                <div className="rounded-[1.8rem] border border-[var(--public-line)] bg-white p-5 shadow-[0_20px_30px_rgba(43,29,16,0.08)]">
                  <img
                    src={link.tenants.business_qr_url}
                    alt="Payment QR code"
                    className="h-full w-full rounded-[1.1rem] object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="public-inset flex items-center gap-3 rounded-[1.3rem] px-4 py-4">
                    <QrCode className="h-5 w-5 text-[var(--public-accent-strong)]" />
                    <div>
                      <div className="text-sm font-semibold text-[var(--public-ink)]">
                        Scan to pay with UPI
                      </div>
                      <div className="text-xs text-[var(--public-muted)]">
                        UPI ID: {link.tenants.upi_id || "business@upi"}
                      </div>
                    </div>
                  </div>
                  <div className="public-inset flex items-center gap-3 rounded-[1.3rem] px-4 py-4">
                    <ShieldCheck className="h-5 w-5 text-[var(--public-success)]" />
                    <p className="text-sm leading-6 text-[var(--public-muted)]">
                      Once payment is complete, use the confirmation button
                      below so the host can finalize your check-in.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-[var(--public-line)] bg-[rgba(255,248,235,0.84)] p-6 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-[var(--public-accent-strong)]" />
                <div className="mt-4 text-lg font-semibold text-[var(--public-ink)]">
                  External payment gateway
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
                  The host will complete payment collection outside this window.
                  Confirm here after payment is made.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("id_verification")}
                className="public-button-secondary px-5 py-3 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePaymentComplete}
                disabled={loading}
                className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                I have paid
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "complete" ? (
        <section className="public-panel public-shimmer px-6 py-8 text-center sm:px-8 sm:py-10">
          <div className="relative z-10 space-y-5">
            <div className="public-inset mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]">
              <Sparkles className="h-9 w-9" />
            </div>
            <div>
              <h2 className="public-display text-4xl text-[var(--public-ink)]">
                Booking confirmed
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                Thank you{formData.name ? `, ${formData.name}` : ""}. Your stay
                at {listingTitle} is all set.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="public-inset rounded-[1.2rem] px-4 py-4 text-left">
                <div className="public-eyebrow">Stay</div>
                <div className="mt-2 text-sm font-semibold text-[var(--public-ink)]">
                  {stayLabel}
                </div>
              </div>
              <div className="public-inset rounded-[1.2rem] px-4 py-4 text-left">
                <div className="public-eyebrow">Verification</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--public-success)]" />
                  ID verified and payment noted
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.close()}
              className="public-button-secondary px-6 py-3 text-sm font-semibold"
            >
              Close portal
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
