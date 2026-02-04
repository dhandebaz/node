
"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Upload, FileText } from "lucide-react";
import Link from "next/link";

export default function ApplyKYCPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    setTimeout(() => {
        window.location.href = "/node/apply/success";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
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
                We are required to collect identity documents for all infrastructure participants.
                Your data is encrypted and stored securely.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* PAN Card Upload */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    PAN Card
                </h3>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-950 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-700 transition-colors">
                        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    </div>
                    <p className="text-sm text-zinc-300 font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-zinc-500">JPG, PNG or PDF (Max 5MB)</p>
                </div>
            </div>

            {/* Aadhar / Address Proof Upload */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    Aadhar Card / Address Proof
                </h3>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-950 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-700 transition-colors">
                        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    </div>
                    <p className="text-sm text-zinc-300 font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-zinc-500">Front and Back (Max 5MB)</p>
                </div>
            </div>

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
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Submitting Application..." : "Submit Application"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
