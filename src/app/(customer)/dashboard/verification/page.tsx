"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Upload, FileText, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { getCustomerProfile } from "@/app/actions/customer"; // We can't use server action directly in useEffect easily, better to fetch via API or pass as props. But this is a client page. I'll fetch via API or assume user context.

// Simple Signature Canvas
function SignaturePad({ onEnd }: { onEnd: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
      }
    }
  }, []);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onEnd(canvasRef.current.toDataURL());
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-lg touch-none cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const resolveDefaultTimezone = (phone?: string) => {
    const safePhone = (phone || "").replace(/\s+/g, "");
    if (safePhone.startsWith("+91") || safePhone.startsWith("91"))
      return "Asia/Kolkata";
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  };

  // Step 1 State
  const [details, setDetails] = useState({
    name: "",
    taxId: "",
    address: "",
    phone: "",
    timezone: resolveDefaultTimezone(),
  });

  // Step 2 State
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [kycDocPath, setKycDocPath] = useState("");
  const [kycDocumentId, setKycDocumentId] = useState<string>("");

  // Step 3 State
  const [signature, setSignature] = useState("");

  // Load initial data
  useEffect(() => {
    fetch("/api/host/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.tenant) {
          setDetails((prev) => ({
            ...prev,
            name: data.tenant.name || "",
            phone: data.user?.phone || "",
            address: data.tenant.address || "",
            taxId: data.tenant.tax_id || "",
            timezone:
              data.tenant.timezone ||
              resolveDefaultTimezone(data.user?.phone || ""),
          }));
        }
      });
  }, []);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error) {
      toast.error((error as Error)?.message || "Error saving details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setKycFile(file);
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const data = await fetchWithAuth<{
          success: boolean;
          extractedData?: any;
          filePath?: string;
          documentId?: string;
          error?: string;
        }>("/api/kyc/upload", {
          method: "POST",
          body: formData,
        });
        if (data.success) {
          setExtractedData(data.extractedData);
          setKycDocPath(data.filePath || "");
          setKycDocumentId(data.documentId || "");
        } else {
          toast.error(data.error);
        }
      } catch (error) {
        toast.error("Upload failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKYCConfirm = async () => {
    setLoading(true);
    try {
      await fetchWithAuth("/api/kyc/confirm", {
        method: "POST",
        body: JSON.stringify({
          extractedData,
          documentPath: kycDocPath,
          documentId: kycDocumentId || undefined,
        }),
      });
      setStep(3);
    } catch (error) {
      toast.error("Error confirming KYC");
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
        "/api/kyc/agreement",
        {
          method: "POST",
          body: JSON.stringify({
            signatureBase64: signature,
          }),
        },
      );
      if (data.success) {
        toast.success("Verification Complete!");
        // Step 4: One-time Public Username (Redirect or Modal?)
        // The prompt says "Immediately after KYC approval, prompt for a unique handle"
        // So we should go to Step 4 instead of redirecting to dashboard immediately.
        setStep(4);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error signing agreement");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Username
  const [handle, setHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const [handleChecking, setHandleChecking] = useState(false);
  const handleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkHandle = useCallback((val: string) => {
    setHandle(val);
    setHandleAvailable(null);

    if (handleDebounceRef.current) {
      clearTimeout(handleDebounceRef.current);
    }

    if (val.length < 3) return;

    handleDebounceRef.current = setTimeout(async () => {
      setHandleChecking(true);
      try {
        const res = await fetch(
          `/api/user/handle?handle=${encodeURIComponent(val)}`,
        );
        const data = await res.json();
        setHandleAvailable(data.available === true);
      } catch {
        setHandleAvailable(null);
      } finally {
        setHandleChecking(false);
      }
    }, 450);
  }, []);

  const handleUsernameSubmit = async () => {
    if (!handleAvailable || !handle) return;
    setLoading(true);
    try {
      // Resolve tenantId from profile
      const profileRes = await fetch("/api/host/me");
      const profileData = await profileRes.json();
      const tenantId = profileData?.tenant?.id;

      if (!tenantId) {
        toast.error("Could not resolve workspace. Please try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/user/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, tenantId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to save handle");
        setLoading(false);
        return;
      }

      toast.success("Your public profile is live!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-1 mx-2 ${step > s ? "bg-purple-600" : "bg-zinc-800"}`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
          <h2 className="text-xl font-bold">Business Details</h2>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Business Name</Label>
              <Input
                value={details.name}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
                required
                className="bg-zinc-950 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid gap-2">
              <Label>PAN / GSTIN (Optional)</Label>
              <Input
                value={details.taxId}
                onChange={(e) =>
                  setDetails({ ...details, taxId: e.target.value })
                }
                placeholder="ABCDE1234F or 07ABCDE1234F1Z5"
                className="bg-zinc-950 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                value={details.address}
                onChange={(e) =>
                  setDetails({ ...details, address: e.target.value })
                }
                required
                className="bg-zinc-950 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={details.phone}
                onChange={(e) =>
                  setDetails({ ...details, phone: e.target.value })
                }
                required
                className="bg-zinc-950 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid gap-2">
              <Label>Timezone</Label>
              <Input
                value={details.timezone}
                onChange={(e) =>
                  setDetails({ ...details, timezone: e.target.value })
                }
                required
                className="bg-zinc-950 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save & Continue"
              )}
            </Button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
          <h2 className="text-xl font-bold">Identity Verification (KYC)</h2>
          {!extractedData ? (
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
              <Upload className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
              <p className="text-zinc-400 mb-4">
                Upload Aadhaar or Passport (Max 5MB)
              </p>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={loading}
                className="max-w-xs mx-auto"
              />
              {loading && <Loader2 className="animate-spin mx-auto mt-4" />}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <span className="text-green-200">
                  Document Processed Successfully
                </span>
              </div>

              <div className="grid gap-4 bg-zinc-950 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-zinc-500">Name</Label>
                    <div className="font-medium">{extractedData.name}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">DOB</Label>
                    <div className="font-medium">{extractedData.dob}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Document No</Label>
                    <div className="font-medium">
                      {extractedData.document_number}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleKYCConfirm}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirm Details"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
          <h2 className="text-xl font-bold">Legal Agreement</h2>
          <div className="bg-white text-black p-6 rounded-lg h-64 overflow-y-auto text-sm font-serif">
            <h3 className="font-bold text-lg mb-4">
              Zero-Liability & Platform Terms Acknowledgement
            </h3>
            <p className="mb-3">
              This document will be generated specifically for:
            </p>
            <p className="mb-3">
              <strong>Business:</strong> {details.name || "—"}
            </p>
            <p className="mb-3">
              <strong>Address:</strong> {details.address || "—"}
            </p>
            <p className="mb-3">
              <strong>PAN/GSTIN:</strong>{" "}
              {details.taxId ? details.taxId.toUpperCase() : "Not provided"}
            </p>
            <p className="mb-3">
              By signing, you authorize Nodebase to generate a signed PDF record
              and store it securely for compliance.
            </p>
            <p>
              <strong>Governing law:</strong> India (configurable).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sign Below</Label>
            <SignaturePad onEnd={setSignature} />
            <p className="text-xs text-zinc-500">
              Draw your signature using mouse or touch.
            </p>
          </div>

          <Button
            onClick={handleAgreementSign}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Sign & Complete Verification"
            )}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6 text-center">
          <h2 className="text-xl font-bold">Claim your Handle</h2>
          <p className="text-zinc-400">
            Choose a unique username for your public profile.
          </p>

          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <span className="text-zinc-500">nodebase.co/@</span>
            <Input
              value={handle}
              onChange={(e) =>
                checkHandle(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                )
              }
              placeholder="my-business"
              className="bg-zinc-950"
            />
          </div>

          {handleChecking && (
            <p className="text-zinc-400 text-sm flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Checking…
            </p>
          )}
          {!handleChecking && handleAvailable === true && (
            <p className="text-green-500 text-sm">✓ Handle available!</p>
          )}
          {!handleChecking &&
            handleAvailable === false &&
            handle.length >= 3 && (
              <p className="text-red-400 text-sm">✗ Handle taken or invalid</p>
            )}

          <Button
            onClick={handleUsernameSubmit}
            disabled={!handleAvailable || loading}
            className="w-full max-w-sm"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Launch Site"}
          </Button>
        </div>
      )}
    </div>
  );
}
