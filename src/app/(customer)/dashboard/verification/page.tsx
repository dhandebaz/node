"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api/fetcher";

type HostMeResponse = {
  user?: {
    id: string;
    phone?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
  tenant?: {
    id: string;
    name?: string | null;
    address?: string | null;
    tax_id?: string | null;
    timezone?: string | null;
    username?: string | null;
    kyc_status?: string | null;
  } | null;
};

type VerificationExtractedData = {
  name?: string;
  dob?: string;
  document_number?: string;
  address?: string;
  document_type?: string;
  confidence?: number;
};

type UploadResponse = {
  success: boolean;
  extractedData?: VerificationExtractedData;
  filePath?: string;
  documentId?: string;
  error?: string;
};

type CanvasInputEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

function getCanvasCoordinates(
  event: CanvasInputEvent,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  const point =
    "touches" in event ? event.touches[0] : (event as React.MouseEvent);

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (point.clientX - rect.left) * scaleX,
    y: (point.clientY - rect.top) * scaleY,
  };
}

function SignaturePad({ onEnd }: { onEnd: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onEnd("");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "currentColor";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const startDrawing = (event: CanvasInputEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(event, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: CanvasInputEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (canvasRef.current) {
      onEnd(canvasRef.current.toDataURL("image/png"));
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="h-40 w-full touch-none rounded-2xl border border-zinc-200 bg-zinc-50 cursor-crosshair text-zinc-950"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clearPad}
        className="absolute bottom-3 right-3 rounded-lg bg-zinc-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string>("");

  const resolveDefaultTimezone = (phone?: string) => {
    const safePhone = (phone || "").replace(/\s+/g, "");
    if (safePhone.startsWith("+91") || safePhone.startsWith("91")) {
      return "Asia/Kolkata";
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  };

  const [details, setDetails] = useState({
    name: "",
    taxId: "",
    address: "",
    phone: "",
    timezone: resolveDefaultTimezone(),
  });
  const [extractedData, setExtractedData] =
    useState<VerificationExtractedData | null>(null);
  const [kycDocPath, setKycDocPath] = useState("");
  const [kycDocumentId, setKycDocumentId] = useState("");
  const [signature, setSignature] = useState("");
  const [handle, setHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleChecking, setHandleChecking] = useState(false);
  const handleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const publicProfilePrefix =
    typeof window !== "undefined" && window.location.origin
      ? `${window.location.origin}/@`
      : "https://nodebase.space/@";

  useEffect(() => {
    fetchWithAuth<HostMeResponse>("/api/host/me", { cache: "no-store" })
      .then((data) => {
        if (!data.tenant) return;

        setTenantId(data.tenant.id);
        setHandle(data.tenant.username || ""); if (data.tenant.username) setHandleAvailable(true);
        setDetails((prev) => ({
          ...prev,
          name: data.tenant?.name || "",
          phone: data.user?.phone || "",
          address: data.tenant?.address || "",
          taxId: data.tenant?.tax_id || "",
          timezone:
            data.tenant?.timezone ||
            resolveDefaultTimezone(data.user?.phone || ""),
        }));
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load verification details",
        );
      });
  }, []);

  const handleDetailsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedTaxId = details.taxId.trim().toUpperCase();
    if (normalizedTaxId) {
      const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedTaxId);
      const isGstin = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
        normalizedTaxId,
      );
      if (!isPan && !isGstin) {
        toast.error(
          "PAN/GSTIN invalid. Example PAN: ABCDE1234F, GSTIN: 07ABCDE1234F1Z5",
        );
        return;
      }
    }

    setLoading(true);
    try {
      await fetchWithAuth("/api/business/details", {
        method: "POST",
        body: JSON.stringify({ ...details, taxId: normalizedTaxId }),
      });
      setStep(2);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Error saving details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await fetchWithAuth<UploadResponse>(
        "/api/host/verification/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!data.success) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setExtractedData(data.extractedData || null);
      setKycDocPath(data.filePath || "");
      setKycDocumentId(data.documentId || "");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleKycConfirm = async () => {
    if (!extractedData) {
      toast.error("Upload and review your document first");
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth("/api/host/verification/confirm", {
        method: "POST",
        body: JSON.stringify({
          extractedData,
          documentPath: kycDocPath,
          documentId: kycDocumentId || undefined,
        }),
      });
      setStep(3);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Error confirming KYC",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAgreementSign = async () => {
    if (!signature) {
      toast.error("Please sign the agreement");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWithAuth<{ success: boolean; error?: string }>(
        "/api/host/verification/agreement",
        {
          method: "POST",
          body: JSON.stringify({
            signatureBase64: signature,
          }),
        },
      );

      if (!data.success) {
        toast.error(data.error || "Error signing agreement");
        return;
      }

      toast.success("Verification complete");
      setStep(4);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Error signing agreement",
      );
    } finally {
      setLoading(false);
    }
  };

  const checkHandle = useCallback((value: string) => {
    setHandle(value);
    setHandleAvailable(null);

    if (handleDebounceRef.current) {
      clearTimeout(handleDebounceRef.current);
    }

    if (value.length < 3) return;

    handleDebounceRef.current = setTimeout(async () => {
      setHandleChecking(true);
      try {
        const response = await fetch(
          `/api/user/handle?handle=${encodeURIComponent(value)}`,
        );
        const data = (await response.json()) as { available?: boolean };
        setHandleAvailable(data.available === true);
      } catch {
        setHandleAvailable(null);
      } finally {
        setHandleChecking(false);
      }
    }, 450);
  }, []);

  const handleUsernameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!handleAvailable || !handle || !tenantId) return;

    setLoading(true);
    try {
      await fetchWithAuth("/api/user/handle", {
        method: "POST",
        body: JSON.stringify({ handle, tenantId }),
      });
      toast.success("Your public profile is live");

      // Force a hard navigation to bypass VerificationGate caching stale kycStatus
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save your public handle",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10">
      <div className="mb-12 flex items-center justify-between">
        {[1, 2, 3, 4].map((currentStep) => (
          <div key={currentStep} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition-all ${
                step >= currentStep
                  ? "bg-zinc-950 text-white shadow-xl shadow-zinc-950/20"
                  : "bg-zinc-100 text-zinc-400 border border-zinc-200"
              }`}
            >
              {step > currentStep ? <CheckCircle2 size={18} strokeWidth={3} /> : currentStep}
            </div>
            {currentStep < 4 && (
              <div
                className={`mx-3 h-1 w-12 rounded-full transition-colors ${
                  step > currentStep ? "bg-zinc-950" : "bg-zinc-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 rounded-[2.5rem] bg-white border border-zinc-200 p-8 shadow-sm">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verification Step 1</div>
            <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Business Details</h2>
          </div>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Legal Business Name</Label>
              <Input
                value={details.name}
                onChange={(event) =>
                  setDetails({ ...details, name: event.target.value })
                }
                required
                className="bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 font-black text-zinc-950 focus:bg-white transition-all h-auto"
              />
            </div>
            <div className="grid gap-2">
              <Label>PAN / GSTIN (Optional)</Label>
              <Input
                value={details.taxId}
                onChange={(event) =>
                  setDetails({ ...details, taxId: event.target.value })
                }
                placeholder="ABCDE1234F or 07ABCDE1234F1Z5"
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                value={details.address}
                onChange={(event) =>
                  setDetails({ ...details, address: event.target.value })
                }
                required
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={details.phone}
                onChange={(event) =>
                  setDetails({ ...details, phone: event.target.value })
                }
                required
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid gap-2">
              <Label>Timezone</Label>
              <Input
                value={details.timezone}
                onChange={(event) =>
                  setDetails({ ...details, timezone: event.target.value })
                }
                required
                className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-auto py-4 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all active:scale-95">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save & Authorize"
              )}
            </Button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 rounded-[2.5rem] bg-white border border-zinc-200 p-8 shadow-sm">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verification Step 2</div>
            <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Identity Validation</h2>
          </div>
          {!extractedData ? (
            <div className="rounded-[2rem] border-2 border-dashed border-zinc-200 p-8 text-center transition-all bg-zinc-50">
              <Upload className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
              <p className="mb-6 text-sm font-medium text-zinc-500 leading-relaxed max-w-xs mx-auto">
                Securely upload an official government-issued ID (PAN, Aadhaar, or Passport).
              </p>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={loading}
                className="mx-auto max-w-xs"
              />
              {loading ? (
                <Loader2 className="mx-auto mt-4 animate-spin" />
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-900/20 p-4">
                <CheckCircle2 className="text-green-500" />
                <span className="text-green-200">
                  Document processed successfully
                </span>
              </div>

              <div className="grid gap-4 rounded-lg bg-muted/50 text-foreground p-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <div className="font-medium">
                      {extractedData.name || " - "}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">DOB</Label>
                    <div className="font-medium">
                      {extractedData.dob || " - "}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Document Type
                    </Label>
                    <div className="font-medium">
                      {extractedData.document_type || "Government ID"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Document No</Label>
                    <div className="font-medium">
                      {extractedData.document_number || " - "}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleKycConfirm}
                disabled={loading}
                className="w-full h-auto py-4 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirm Identity Details"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 rounded-[2.5rem] bg-white border border-zinc-200 p-8 shadow-sm">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verification Step 3</div>
            <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Legal Agreement</h2>
          </div>
          <div className="h-64 overflow-y-auto rounded-2xl bg-zinc-50 border border-zinc-100 p-8 text-sm font-serif text-zinc-950 leading-relaxed">
            <h3 className="mb-6 text-xl font-black uppercase tracking-tighter font-sans">
              Operational Terms & Acknowledgement
            </h3>
            <p className="mb-4">
              This institutional record is generated for:
            </p>
            <div className="mb-6 space-y-1 bg-white p-4 rounded-xl border border-zinc-100 font-sans">
              <p className="text-[10px] uppercase font-black text-zinc-400">Authorized Entity</p>
              <p className="text-sm font-black">{details.name || " - "}</p>
              <p className="text-[10px] uppercase font-black text-zinc-400 mt-2">Registration ID</p>
              <p className="text-sm font-black">{details.taxId ? details.taxId.toUpperCase() : "Electronic Verification Pending"}</p>
            </div>
            <p className="mb-4">
              By applying your electronic signature, you authorize Nodebase to provision the requested business ecosystem and verify the submitted credentials for regulatory compliance.
            </p>
            <p className="text-xs text-zinc-500 italic">
              Execution date: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authorized Signature</Label>
            <SignaturePad onEnd={setSignature} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 text-center">
              Apply digital stroke for authentication
            </p>
          </div>

          <Button
            onClick={handleAgreementSign}
            disabled={loading}
            className="w-full h-auto py-4 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-950/20 hover:bg-zinc-800 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Finalize Execution"
            )}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 rounded-[2.5rem] bg-white border border-zinc-200 p-10 text-center shadow-2xl shadow-zinc-950/5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-950 text-white shadow-xl shadow-zinc-950/20 mb-4">
             <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Verification Complete</div>
            <h2 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">Claim Handle</h2>
            <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
              Define your high-fidelity public profile URL to complete the deployment.
            </p>
          </div>

          <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Base URL</div>
            <div className="flex items-center gap-1 w-full">
              <span className="text-xs font-black text-zinc-300">@</span>
              <Input
                value={handle}
                onChange={(event) =>
                  checkHandle(
                    event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="my-business"
                className="bg-white border-zinc-200 text-zinc-950 font-black h-12 rounded-xl text-center placeholder:text-zinc-200"
              />
            </div>
            
            <div className="h-6">
              {handleChecking ? (
                <p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Authenticating Handle
                </p>
              ) : null}
              {!handleChecking && handleAvailable === true ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Handle Secured</p>
              ) : null}
              {!handleChecking &&
              handleAvailable === false &&
              handle.length >= 3 ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Handle Already Provisioned</p>
              ) : null}
            </div>
          </div>

          <Button
            onClick={handleUsernameSubmit}
            disabled={!handleAvailable || loading}
            className="mx-auto w-full max-w-sm h-auto py-5 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-zinc-950/30 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Deploy Ecosystem"}
          </Button>
        </div>
      )}
    </div>
  );
}
