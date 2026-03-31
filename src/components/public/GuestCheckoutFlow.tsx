"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileUp,
  ImageIcon,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  X,
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
    link.status === "paid" || link.status === "pending_verification" ? "complete" : "details",
  );
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

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
  const hasUPI = link.tenants?.business_qr_url || link.tenants?.upi_id || link.tenants?.upi_mobile;

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

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingScreenshot(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to read screenshot");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = "";
    }
  };

  const handlePaymentComplete = async () => {
    setLoading(true);

    try {
      // If screenshot is uploaded, submit it first
      if (screenshotPreview) {
        const formDataScreenshot = new FormData();
        formDataScreenshot.append("paymentLinkId", link.id);
        formDataScreenshot.append("screenshot", screenshotPreview);

        const response = await fetch("/api/payments/screenshot", {
          method: "POST",
          body: formDataScreenshot,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit payment screenshot");
        }

        const result = await response.json();
        
        if (result.status === "pending_verification") {
          setStep("complete");
          toast.success("Payment screenshot submitted. Host will verify shortly.");
          return;
        }
      }

      // Complete check-in without screenshot
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
          <div className="public-inset mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(146,43,34,0.12)] text-primary">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="public-display text-3xl text-foreground">
            Link expired
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
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
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {listingTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Complete your guest details, verify your ID, and confirm payment
              in one secure flow.
            </p>
          </div>
          <div className="grid gap-3 sm:min-w-52">
            <div className="public-inset rounded-[1.2rem] px-4 py-3">
              <div className="public-eyebrow">Stay</div>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {stayLabel}
              </div>
            </div>
            <div className="public-inset rounded-[1.2rem] px-4 py-3">
              <div className="public-eyebrow">Amount</div>
              <div className="mt-2 text-sm font-semibold text-primary">
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
                      ? "border-primary/40 bg-primary text-white"
                      : isDone
                        ? "border-[rgba(70,128,77,0.25)] bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]"
                        : "border-border bg-background/85 text-muted-foreground",
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
                              ? "w-1/2 bg-primary"
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
              <h3 className="public-display mt-3 text-3xl text-foreground">
                Confirm guest details
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                These details are used for check-in coordination and compliance.
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-foreground">
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
                <label className="grid gap-2 text-sm font-semibold text-foreground">
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
                <label className="grid gap-2 text-sm font-semibold text-foreground">
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
                <label className="grid gap-2 text-sm font-semibold text-foreground">
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
              <h3 className="public-display mt-3 text-3xl text-foreground">
                Upload a valid government ID
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                The host requires an ID for this stay. Aadhaar numbers are
                returned in masked form only.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-dashed border-[rgba(61,44,25,0.16)] bg-[rgba(255,251,244,0.76)] p-6 text-center">
              {extracting ? (
                <div className="space-y-4 py-6">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <div className="text-sm font-semibold text-foreground">
                    Verifying your document
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This usually takes a few seconds.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10/75 text-primary">
                    <FileUp className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      Upload ID image
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

            <label className="grid gap-2 text-sm font-semibold text-foreground">
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
              <h3 className="public-display mt-3 text-3xl text-foreground">
                Complete payment
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                {hasUPI 
                  ? "Scan the QR code or use UPI details to pay, then upload screenshot."
                  : "Contact the host for payment instructions."}
              </p>
            </div>

            {hasUPI && (
              <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-center">
                {link.tenants?.business_qr_url && (
                  <div className="rounded-[1.8rem] border border-border bg-white p-5 shadow-lg">
                    <img
                      src={link.tenants.business_qr_url}
                      alt="Payment QR code"
                      className="h-full w-full rounded-[1.1rem] object-cover"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {link.tenants?.upi_id && (
                    <div className="public-inset flex items-center gap-3 rounded-[1.3rem] px-4 py-4">
                      <QrCode className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          UPI ID
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {link.tenants.upi_id}
                        </div>
                      </div>
                    </div>
                  )}
                  {link.tenants?.upi_mobile && (
                    <div className="public-inset flex items-center gap-3 rounded-[1.3rem] px-4 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        Phone
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {link.tenants.upi_mobile}
                      </div>
                    </div>
                  )}
                  <div className="public-inset flex items-start gap-3 rounded-[1.3rem] px-4 py-4">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--public-success)]" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Upload payment screenshot after paying. Host will verify within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Screenshot Upload Section */}
            <div className="rounded-[1.6rem] border border-dashed border-[rgba(61,44,25,0.16)] bg-[rgba(255,251,244,0.76)] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ImageIcon className="h-4 w-4" />
                Upload Payment Screenshot
              </div>
              
              {screenshotPreview ? (
                <div className="relative inline-block">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot"
                    className="max-h-48 rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotUpload}
                    disabled={uploadingScreenshot}
                  />
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-white p-4 py-6 text-center hover:border-primary/50">
                    {uploadingScreenshot ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Click to upload</span> payment screenshot
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </div>
                  </div>
                </label>
              )}
            </div>

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
                className="public-button flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {screenshotPreview ? "Submit payment" : "I have paid"}
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
              <h2 className="public-display text-4xl text-foreground">
                {link.status === "pending_verification" 
                  ? "Payment submitted" 
                  : "Booking confirmed"}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {link.status === "pending_verification"
                  ? "Your payment screenshot has been submitted. The host will verify it shortly."
                  : `Thank you${formData.name ? `, ${formData.name}` : ""}. Your stay at ${listingTitle} is all set.`}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="public-inset rounded-[1.2rem] px-4 py-4 text-left">
                <div className="public-eyebrow">Stay</div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {stayLabel}
                </div>
              </div>
              <div className="public-inset rounded-[1.2rem] px-4 py-4 text-left">
                <div className="public-eyebrow">Verification</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-[var(--public-success)]" />
                  {link.status === "pending_verification" 
                    ? "Awaiting host verification"
                    : "ID verified and payment complete"}
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
