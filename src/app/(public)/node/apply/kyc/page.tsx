
"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
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
      setUploadResult(result ?? null);

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
    <div className="border border-white/20 p-8">
        <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-3">
            <FileText className="w-5 h-5" />
            {type === "PAN" ? "PAN Card" : "Aadhaar / Address"}
        </h3>
        
        {doc ? (
            <div className={`p-6 border ${
                doc.verified ? "border-white bg-white/10" : "border-white/50 bg-transparent"
            }`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        doc.verified ? "border-white bg-white text-[--color-brand-red]" : "border-white/50 text-white"
                    }`}>
                        {doc.verified ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <p className="font-bold uppercase tracking-wider text-sm">
                        {doc.verified ? "Verified" : "Pending Review"}
                    </p>
                </div>
                
                {doc.verificationDetails?.name && (
                    <p className="text-sm opacity-60 mb-4 font-mono">
                        Detected: {doc.verificationDetails.name}
                    </p>
                )}
                <button 
                    type="button"
                    onClick={() => type === "PAN" ? setPanDoc(null) : setAadhaarDoc(null)}
                    className="text-xs font-bold uppercase tracking-widest border-b border-white hover:opacity-70 transition-opacity"
                >
                    Replace File
                </button>
            </div>
        ) : (
            <div className="relative border border-dashed border-white/30 p-8 text-center hover:bg-white hover:text-[--color-brand-red] transition-all cursor-pointer group">
                <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, type)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={showOverlay}
                />
                <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm mb-2">
                    Upload Document
                </p>
                <p className="text-xs opacity-60 group-hover:opacity-80">JPG, PNG or PDF (Max 5MB)</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="bg-[--color-brand-red] text-white selection:bg-white selection:text-[--color-brand-red]">
      <KaisaVerificationOverlay 
        isVisible={showOverlay} 
        onComplete={() => setAnimationFinished(true)}
        documentType={processingType || "PAN"}
      />
      
      {/* Header Section */}
      <section className="min-h-[40vh] flex flex-col justify-end px-6 pt-32 pb-12 border-b border-white/20">
        <div className="max-w-7xl mx-auto w-full">
          <Link href="/node/apply/details" className="inline-block border border-white px-4 py-1.5 mb-12 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[--color-brand-red] transition-colors">
              ← Back
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white font-bold text-sm">
              2
            </span>
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">
              KYC Documents
            </span>
          </div>

          <h1 className="text-display-large uppercase leading-[0.85] tracking-tighter mb-8">
             Identity<br />
             Verification
          </h1>
          
          <p className="text-editorial-body max-w-2xl">
              We use AI to instantly verify your identity documents. Please upload clear photos.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="min-h-screen px-6 py-24">
        <div className="max-w-7xl mx-auto w-full">
            {error && (
                <div className="mb-12 p-4 border border-white bg-white text-[--color-brand-red] text-sm font-bold flex items-center gap-4">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {renderUploadBox("PAN", panDoc)}
                    {renderUploadBox("AADHAAR", aadhaarDoc)}
                </div>

                <div className="mb-12 p-6 border border-white/20">
                    <div className="flex gap-4 items-start">
                        <input type="checkbox" required className="mt-1 w-5 h-5 border-2 border-white bg-transparent appearance-none checked:bg-white checked:after:content-['✓'] checked:after:text-[--color-brand-red] checked:after:block checked:after:text-center checked:after:text-sm checked:after:font-bold cursor-pointer" />
                        <label className="text-lg opacity-80 leading-relaxed">
                            I certify that the information provided is accurate and I agree to the 
                            <Link href="/legal/privacy" className="border-b border-white mx-2 hover:opacity-70">Privacy Policy</Link>
                            and
                            <Link href="/legal/terms" className="border-b border-white mx-2 hover:opacity-70">Terms of Service</Link>.
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || !panDoc || !aadhaarDoc}
                    className="group flex items-center gap-4 text-4xl font-bold uppercase tracking-tighter hover:gap-8 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting..." : <>Submit Application <ArrowRight className="w-8 h-8" /></>}
                </button>
            </form>
        </div>
      </section>
    </div>
  );
}
