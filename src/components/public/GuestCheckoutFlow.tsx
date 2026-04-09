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
import { cn } from "@/lib/utils";

interface ClientCheckoutFlowProps {
  link: any;
}

const stepOrder = ["details", "id_verification", "payment"] as const;
type FlowStep = (typeof stepOrder)[number] | "complete";

export function GuestCheckoutFlow({ link }: ClientCheckoutFlowProps) {
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

  const solutionTitle = link.listings?.title || "your deployment";
  const amountLabel = useMemo(() => {
    const amount = Number(link.amount || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }, [link.amount]);

  const timelineLabel = link.metadata?.startDate || "Shared during scope definition";
  const hasUPI = link.tenants?.business_qr_url || link.tenants?.upi_id || link.tenants?.upi_mobile;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const handleDetailsSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setStep("id_verification");
  };

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);

    try {
      const readFileAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Could not read file."));
            return;
          }
          const [, base64 = ""] = reader.result.split(",");
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });

      const base64 = await readFileAsBase64(file);
      const result = await extractKycDataAction(base64, file.type, true);

      if (!result.success || !result.details) {
        throw new Error("Institutional verification failed.");
      }

      const details = result.details;

      setFormData((current) => ({
        ...current,
        idNumber: details.idNumber || "",
        documentId: result.documentId || "",
      }));

      toast.success("Identity details extracted successfully.");
      setTimeout(() => setStep("payment"), 700);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Extraction failed. Please enter details manually.",
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
          throw new Error(error.error || "Failed to submit validation screenshot");
        }

        const result = await response.json();
        
        if (result.status === "pending_verification") {
          setStep("complete");
          toast.success("Validation screenshot submitted for business review.");
          return;
        }
      }

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
      toast.success("Solution initialization completed successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete initialization.");
    } finally {
      setLoading(false);
    }
  };

  if (link.status === "expired") {
    return (
      <section className="bg-white border border-zinc-200 rounded-[2.5rem] px-6 py-12 shadow-sm text-center">
        <div className="relative z-10 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
            Deployment link expired
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-zinc-500 font-medium">
            This transactional link is no longer active. Please contact the business operations team for a
            fresh authorization link.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-1">Authorization Flow</div>
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">
              {solutionTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 font-medium">
              Complete your profile details, secure institutional verification, and confirm initiation
              in one high-fidelity flow.
            </p>
          </div>
          <div className="grid gap-3 sm:min-w-52">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-1">Timeline</div>
              <div className="text-sm font-black text-zinc-950 uppercase tracking-tighter">
                {timelineLabel}
              </div>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-blue-600/50 font-black mb-1">Fee</div>
              <div className="text-sm font-black text-blue-600 uppercase tracking-tighter">
                {amountLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6">
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
              <div key={stepId} className={cn(
                "flex flex-1 items-center gap-3 transition-opacity",
                !isActive && !isDone && "opacity-40"
              )}>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition-all shadow-sm",
                    isActive
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : isDone
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-zinc-200 bg-white text-zinc-400",
                  )}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn(
                    "text-[10px] uppercase tracking-widest font-black",
                    isActive ? "text-zinc-950" : isDone ? "text-blue-600" : "text-zinc-400"
                  )}>
                    {stepId === "details"
                      ? "Client Info"
                      : stepId === "id_verification"
                        ? "Verify ID"
                        : "Payment"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {step === "details" ? (
        <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-blue-600 font-black mb-1">Step 1</div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
                Profile Authentication
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500 font-medium sm:text-base">
                These institutional details are required for project coordination and regulatory compliance.
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Full Name
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Authorized Representative"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-blue-600/30 focus:bg-white transition-all"
                  />
                </label>
                <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Business Email
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="rep@organization.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-blue-600/30 focus:bg-white transition-all"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Access Phone
                  <input
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+91 00000 00000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-blue-600/30 focus:bg-white transition-all"
                  />
                </label>
                <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Preferred Kick-off Time
                  <input
                    value={formData.arrivalTime}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        arrivalTime: event.target.value,
                      }))
                    }
                    placeholder="e.g. 10:00 AM Tomorrow"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-blue-600/30 focus:bg-white transition-all"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="bg-zinc-950 text-white rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-2"
              >
                Proceed to Verification
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {step === "id_verification" ? (
        <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-blue-600 font-black mb-1">Step 2</div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
                Institutional ID Check
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500 font-medium sm:text-base">
                Securely upload your government-issued ID to verify your operational authority.
              </p>
            </div>

            <div className="rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
              {extracting ? (
                <div className="space-y-4 py-6">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-950">
                    Running OCR Verification
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/20">
                    <FileUp className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-zinc-950 uppercase tracking-widest">
                      Upload Document
                    </div>
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
                    className="bg-zinc-950 text-white rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zinc-950/20 hover:bg-zinc-800 transition-all"
                  >
                    Select Official ID
                  </button>
                </div>
              )}
            </div>

            <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Identity Number
              <input
                value={formData.idNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    idNumber: event.target.value,
                  }))
                }
                placeholder="Institutional ID data will appear here"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-blue-600/30 focus:bg-white transition-all"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="flex-1 bg-white border border-zinc-200 text-zinc-400 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:text-zinc-950 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("payment")}
                disabled={!formData.idNumber}
                className="flex-[2] bg-zinc-950 text-white rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                Proceed to Settlement
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "payment" ? (
        <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-blue-600 font-black mb-1">Step 3</div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
                Final Settlement
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500 font-medium sm:text-base">
                {hasUPI 
                  ? "Standard UPI settlement. Please upload a high-fidelity screenshot of the transaction for account routing."
                  : "Contact operations for manual bank transfer instructions."}
              </p>
            </div>

            {hasUPI && (
              <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center">
                {link.tenants?.business_qr_url && (
                  <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/5">
                    <img
                      src={link.tenants.business_qr_url}
                      alt="Business QR code"
                      className="h-full w-full rounded-[1.8rem] object-cover"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {link.tenants?.upi_id && (
                    <div className="bg-zinc-50 border border-zinc-200 flex items-center gap-3 rounded-[1.3rem] px-5 py-5">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Institutional UPI
                        </div>
                        <div className="text-sm font-black text-zinc-950">
                          {link.tenants.upi_id}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50/50 border border-blue-100 flex items-start gap-4 rounded-[1.3rem] px-5 py-5">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                    <p className="text-xs leading-relaxed text-blue-900 font-medium">
                      Account review and identity matching usually completes within one professional business hour.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Finalization Section */}
            <div className="rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 flex flex-col items-center gap-4">
              {screenshotPreview ? (
                <div className="relative inline-block group">
                  <img
                    src={screenshotPreview}
                    alt="Validation screenshot"
                    className="max-h-48 rounded-2xl border border-zinc-200 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full cursor-pointer">
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotUpload}
                    disabled={uploadingScreenshot}
                  />
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 py-8 text-center hover:border-blue-600/30 transition-all shadow-sm">
                    {uploadingScreenshot ? (
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    ) : (
                      <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-950">
                        Upload Transfer Proof
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">High-fidelity PNG or JPG (Max 5MB)</p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <button
                type="button"
                onClick={() => setStep("id_verification")}
                className="flex-1 bg-white border border-zinc-200 text-zinc-400 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:text-zinc-950 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePaymentComplete}
                disabled={loading}
                className="flex-[2] bg-zinc-950 text-white rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Authorize Final Solution
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "complete" ? (
        <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 py-12 text-center shadow-xl shadow-zinc-950/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-zinc-950 text-white shadow-2xl shadow-zinc-950/20">
              <Sparkles className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">
                Solution Initialized
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-500 leading-relaxed">
                Thank you for verifying your authority. Your ecosystem is now being provisioned and will be active shortly.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pt-6">
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-5 text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</div>
                <div className="text-sm font-black text-zinc-950 uppercase tracking-tighter">
                  Deployment Confirmed
                </div>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-5 py-5 text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600/50 mb-1">Assurance</div>
                <div className="text-sm font-black text-blue-600 uppercase tracking-tighter">
                  KYC Verified
                </div>
              </div>
            </div>
            <div className="pt-8 flex flex-col gap-3 sm:flex-row items-center justify-center border-t border-zinc-100 mt-4">
              <a
                href={`/chat/${link.tenant_id}`}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-all shadow-sm"
              >
                Operator Console
              </a>
              <button
                type="button"
                onClick={() => alert("Ecosystem provisioned successfully.")}
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all active:scale-95"
              >
                Close Deployment Tab
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
