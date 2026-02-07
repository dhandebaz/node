
"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
    <div className="bg-[--color-brand-red] text-white selection:bg-white selection:text-[--color-brand-red]">
      {/* Header Section */}
      <section className="min-h-[40vh] flex flex-col justify-end px-6 pt-32 pb-12 border-b border-white/20">
        <div className="max-w-7xl mx-auto w-full">
          <Link 
            href="/node/apply"
            className="inline-block border border-white px-4 py-1.5 mb-12 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[--color-brand-red] transition-colors"
          >
            ← Back
          </Link>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white font-bold text-sm">
              1
            </span>
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">
              Basic Details
            </span>
          </div>
          
          <h1 className="text-display-large uppercase leading-[0.85] tracking-tighter mb-8">
            Applicant<br />
            Information
          </h1>
        </div>
      </section>

      {/* Form Section */}
      <section className="min-h-screen px-6 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest opacity-60">First Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-transparent border-b border-white/40 py-4 text-2xl font-bold focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest opacity-60">Last Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-transparent border-b border-white/40 py-4 text-2xl font-bold focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-4 mb-12">
              <label className="text-sm font-bold uppercase tracking-widest opacity-60">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-transparent border-b border-white/40 py-4 text-2xl font-bold focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-4 mb-12">
              <label className="text-sm font-bold uppercase tracking-widest opacity-60">Phone Number</label>
              <input 
                type="tel" 
                required 
                className="w-full bg-transparent border-b border-white/40 py-4 text-2xl font-bold focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                placeholder="+91 00000 00000"
              />
            </div>

            <div className="space-y-4 mb-24">
              <label className="text-sm font-bold uppercase tracking-widest opacity-60">Intended Node Units</label>
              <select className="w-full bg-transparent border-b border-white/40 py-4 text-2xl font-bold focus:outline-none focus:border-white transition-colors [&>option]:text-black cursor-pointer appearance-none rounded-none">
                <option value="1">1 Unit (₹10L)</option>
                <option value="2">2 Units (₹20L)</option>
                <option value="5">5 Units (₹50L)</option>
                <option value="10">10 Units (₹1Cr)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group flex items-center gap-4 text-4xl font-bold uppercase tracking-tighter hover:gap-8 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : <>Continue to KYC <ArrowRight className="w-8 h-8" /></>}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
