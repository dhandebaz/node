"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { IntegrationLogoRow } from "@/components/ai-managers/IntegrationLogoRow";
import { fetchAiManager } from "@/lib/api/aiManagers";
import { AiManager } from "@/types/ai-managers";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function AiManagerDetailPage(props: {
  slug: string;
  title: string;
  intro: string;
  responsibilities: string[];
  disclaimer?: string;
}) {
  const { slug, title, intro, responsibilities, disclaimer } = props;
  const [manager, setManager] = useState<AiManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAiManager(slug)
      .then((data) => {
        setManager(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const priceLine = useMemo(() => {
    if (loading) return "Loading price...";
    if (error || !manager) return "Pricing unavailable";
    return `Starting at ₹${formatPrice(manager.baseMonthlyPrice)} / month`;
  }, [loading, error, manager]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      <section className="pt-32 pb-12 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl">
          <Link href="/employees" className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 hover:text-brand-bone hover:border-brand-bone/40 transition-colors">
            ← AI Employees
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 leading-[0.85]">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-brand-silver max-w-3xl font-light leading-relaxed">
            {intro}
          </p>
        </div>
      </section>

      <section className="py-20 px-6 border-b border-brand-bone/10 bg-brand-deep-red/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-10 flex items-center gap-3">
            <span className="w-8 h-1 bg-brand-bone/20"></span>
            Responsibilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {responsibilities.map((item) => (
              <div key={item} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-brand-bone mb-4 opacity-70" />
                <p className="text-brand-bone/90 text-lg leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          {disclaimer && (
            <p className="text-brand-bone/40 text-sm mt-8 font-mono uppercase tracking-wide">
              * {disclaimer}
            </p>
          )}
        </div>
      </section>

      <section className="py-20 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-10 flex items-center gap-3">
            <span className="w-8 h-1 bg-brand-bone/20"></span>
            Tools & Integrations
          </h2>
          <IntegrationLogoRow />
        </div>
      </section>

      <section className="py-20 px-6 border-b border-brand-bone/10 bg-brand-bone/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
             <span className="w-8 h-1 bg-brand-bone/20"></span>
             Pricing
          </h2>
          <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-8">
             <div>
                <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{priceLine}</p>
                <p className="text-brand-bone/60 text-lg uppercase tracking-wider">Base Salary</p>
             </div>
             <div className="hidden md:block text-4xl font-light opacity-30">+</div>
             <div>
                <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">₹1 / Reply</p>
                <p className="text-brand-bone/60 text-lg uppercase tracking-wider">Operational Cost</p>
             </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2">
                Hire {title}
              </h2>
              <p className="text-brand-bone/60">
                Start with the same Nodebase Core, tailored for this role.
              </p>
            </div>
            {manager?.status === "disabled" ? (
              <div className="px-8 py-3 border border-brand-bone/20 text-brand-bone/40 rounded-lg font-bold uppercase tracking-wide text-center">
                Unavailable
              </div>
            ) : (
              <Link
                href="/login"
                className="w-full md:w-auto px-8 py-3 bg-brand-bone text-brand-deep-red rounded-lg font-bold uppercase tracking-wide hover:bg-white transition-all text-center flex items-center justify-center gap-2"
              >
                Hire {title}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
