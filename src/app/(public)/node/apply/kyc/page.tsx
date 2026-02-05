
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { verifyAndUploadDocumentAction } from "@/app/actions/kyc";
import { KYCDocument } from "@/types/user";
import { KaisaVerificationOverlay } from "@/components/kaisa/KaisaVerificationOverlay";

export default function ApplyKYCPage() {
  const [loading, setLoading] = useState(false);
  const [panDoc, setPanDoc] = useState<KYCDocument | null>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<KYCDocument | null>(null);
  
  // Overlay State
  const [showOverlay, setShowOverlay] = useState(false);
  const [processingType, setProcessingType] = useState<"PAN" | "AADHAAR" | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: boolean, data?: any, error?: string } | null>(null);
  const [animationFinished, setAnimationFinished] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Effect to handle completion of both upload and animation
  useEffect(() => {
    if (uploadResult && animationFinished && showOverlay) {
        if (uploadResult.success && uploadResult.data) {
            if (processingType === "PAN") {
                setPanDoc(uploadResult.data as KYCDocument);
            } else {
                setAadhaarDoc(uploadResult.data as KYCDocument);
            }
        } else {
            setError(uploadResult.error || "Upload failed");
        }
        
        // Small delay to let the user see the "Verified" state in the overlay if we wanted,
        // but the overlay already handles the "Verified" text at the end.
        // We close it now.
        setShowOverlay(false);
        setProcessingType(null);
        setUploadResult(null);
        setAnimationFinished(false);
    }
  }, [uploadResult, animationFinished, showOverlay, processingType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "PAN" | "AADHAAR") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Reset states
    setError(null);
    setProcessingType(type);
    setUploadResult(null);
    setAnimationFinished(false);
    setShowOverlay(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // TODO: Get actual user ID from session context
      const userId = "USR-001"; 

      const result = await verifyAndUploadDocumentAction(userId, formData, type);
      setUploadResult(result);

    } catch (err) {
      console.error(err);
      setUploadResult({ success: false, error: "An unexpected error occurred" });
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panDoc || !aadhaarDoc) {
      setError("Please upload both documents to proceed");
      return;
    }

    setLoading(true);
    // Simulate submission delay
    setTimeout(() => {
        window.location.href = "/node/apply/success";
    }, 1500);
  };

  const renderUploadBox = (type: "PAN" | "AADHAAR", doc: KYCDocument | null) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            {type === "PAN" ? "PAN Card" : "Aadhaar Card / Address Proof"}
        </h3>
        
        {doc ? (
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                doc.verified ? "border-green-900/50 bg-green-900/10" : "border-yellow-900/50 bg-yellow-900/10"
            }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    doc.verified ? "bg-green-900/20 text-green-400" : "bg-yellow-900/20 text-yellow-400"
                }`}>
                    {doc.verified ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <p className={`text-sm font-medium mb-1 ${doc.verified ? "text-green-200" : "text-yellow-200"}`}>
                    {doc.verified ? "Verified Successfully" : "Verification Pending/Review Needed"}
                </p>
                {doc.verificationDetails?.name && (
                    <p className="text-xs text-zinc-400 mt-2">
                        Detected: {doc.verificationDetails.name}
                    </p>
                )}
                <button 
                    type="button"
                    onClick={() => type === "PAN" ? setPanDoc(null) : setAadhaarDoc(null)}
                    className="text-xs text-zinc-500 hover:text-white mt-4 underline"
                >
                    Upload Different File
                </button>
            </div>
        ) : (
            <div className="relative border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-950 transition-colors cursor-pointer group">
                <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, type)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={showOverlay}
                />
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-700 transition-colors">
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                </div>
                <p className="text-sm text-zinc-300 font-medium mb-1">
                    Click to upload or drag and drop
                </p>
                <p className="text-xs text-zinc-500">JPG, PNG or PDF (Max 5MB)</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <KaisaVerificationOverlay 
        isVisible={showOverlay} 
        onComplete={() => setAnimationFinished(true)}
        documentType={processingType || "PAN"}
      />
      
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/node/apply/details" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">2</span>
                <span className="text-zinc-500 font-medium">KYC Documents</span>
            </div>
            <h1 className="text-3xl font-bold">Identity Verification</h1>
            <p className="text-zinc-400 mt-2">
                We use AI to instantly verify your identity documents. Please upload clear photos.
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            {renderUploadBox("PAN", panDoc)}
            {renderUploadBox("AADHAAR", aadhaarDoc)}

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
                <div className="flex gap-3">
                    <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-offset-0" />
                    <label>
                        I certify that the information provided is accurate and I agree to the 
                        <Link href="/legal/privacy" className="text-white hover:underline mx-1">Privacy Policy</Link>
                        and
                        <Link href="/legal/terms" className="text-white hover:underline mx-1">Terms of Service</Link>.
                    </label>
                </div>
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={loading || !panDoc || !aadhaarDoc}
                    className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting Application..." : "Submit Application"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
