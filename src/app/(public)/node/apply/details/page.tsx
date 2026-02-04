
"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ApplyDetailsPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    setTimeout(() => {
        window.location.href = "/node/apply/kyc"; // Next step
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/node/apply" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">1</span>
                <span className="text-zinc-500 font-medium">Basic Details</span>
            </div>
            <h1 className="text-3xl font-bold">Applicant Information</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">First Name</label>
                    <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Last Name</label>
                    <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Email Address</label>
                <input type="email" required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Phone Number</label>
                <input type="tel" required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Intended Node Units</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors">
                    <option value="1">1 Unit (₹10L)</option>
                    <option value="2">2 Units (₹20L)</option>
                    <option value="5">5 Units (₹50L)</option>
                    <option value="10">10 Units (₹1Cr)</option>
                </select>
            </div>

            <div className="pt-6">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <>Continue to KYC <ArrowRight className="w-5 h-5" /></>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
