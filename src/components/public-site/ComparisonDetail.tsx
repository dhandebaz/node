"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Bot,
  MessageSquare,
  Mic,
  Eye,
  ShieldCheck,
  CreditCard,
  Globe,
  Users,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import { getComparisonContent, comparisonCategories } from "@/lib/data/comparisons";

interface ComparisonDetailProps {
  toolSlug: string;
}

export function ComparisonDetail({ toolSlug }: ComparisonDetailProps) {
  const data = getComparisonContent(toolSlug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-950 mb-4">Comparison not found</h1>
          <Link href="/compare" className="text-blue-600 hover:underline">
            Back to comparisons
          </Link>
        </div>
      </div>
    );
  }

  const { tool, content } = data;

  return (
    <div className="relative pb-32 pt-24 sm:pt-32 overflow-hidden bg-white">
      <div className="public-container relative z-10 space-y-16">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600 mb-6 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Head-to-Head Comparison
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-zinc-950 tracking-tight mb-6"
          >
            NodeBase vs <span className="text-blue-600">{tool.name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-600 max-w-2xl mx-auto mb-8 font-medium"
          >
            {tool.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20"
            >
              Try NodeBase Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={tool.website}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-950 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-sm"
            >
              Visit {tool.name} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>

        {/* QUICK VERDICT */}
        <section className="bg-zinc-50 border border-zinc-100 p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-3 h-3" />
                NodeBase Wins
              </div>
              <h2 className="text-2xl font-black text-zinc-950 mb-4">
                Why NodeBase is the Better Choice
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Domain-specific AI agents vs generic chatbots</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Voice + Vision + KYC all included at ₹999/mo</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited users - no per-user fees</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Built for any business - omnichannel & travel integrations</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-black uppercase tracking-widest mb-4">
                <Star className="w-3 h-3" />
                {tool.name}
              </div>
              <h2 className="text-2xl font-bold text-zinc-500 mb-4">
                {tool.name}'s Strengths
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-zinc-500 font-medium">
                  <Star className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{content.pros[0] || "Visual sales pipelines"}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-500 font-medium">
                  <Star className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{content.pros[1] || "Multi-channel inbox"}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-500 font-medium">
                  <Star className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{content.pros[2] || "Automation templates"}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* PRICING COMPARISON */}
        <section className="bg-white border border-zinc-100 p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <h2 className="text-3xl font-black text-zinc-950 mb-8 text-center">
            Pricing Comparison
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-blue-50 border-2 border-blue-600 shadow-xl shadow-blue-600/5">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-blue-600 mb-2">NodeBase</h3>
                <div className="text-5xl font-black text-zinc-950 mb-2">₹999</div>
                <div className="text-zinc-600 font-bold">per month, flat rate</div>
              </div>
              <ul className="space-y-3">
                {["Unlimited users", "Voice + Vision included", "Automated KYC", "Domain-specific AI", "Universal integrations", "Payment processing included"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-zinc-500 mb-2">{tool.name}</h3>
                <div className="text-5xl font-black text-zinc-500 mb-2">{tool.pricing.starting}</div>
                <div className="text-zinc-500 font-medium">{tool.pricing.model}</div>
              </div>
              <ul className="space-y-3">
                {["Per-user pricing model", "Basic AI features", "No voice capabilities", "No vision/OCR", "No built-in KYC", "Additional fees stack up"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-500 mt-6">
            * {tool.name} pricing shown as advertised. Actual costs often higher with add-ons.
          </p>
        </section>

        {/* DETAILED SECTIONS */}
        {content.sections.map((section, idx) => (
          <section key={section.title} className="bg-white border border-zinc-50 p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black">
                {idx + 1}
              </div>
              <h2 className="text-2xl font-black text-zinc-950">{section.title}</h2>
            </div>
            <p className="text-zinc-600 font-medium leading-relaxed">{section.content}</p>
          </section>
        ))}

        {/* FEATURE CATEGORIES */}
        <section>
          <h2 className="text-3xl font-black text-zinc-950 mb-8 text-center">
            Feature-by-Feature Analysis
          </h2>
          {Object.entries(comparisonCategories).map(([key, category]) => (
            <div key={key} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm">
                  <category.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950">{category.name}</h3>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left p-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Feature</th>
                      <th className="w-32 p-4 font-bold text-center text-blue-600 uppercase tracking-widest text-[10px]">NodeBase</th>
                      <th className="w-32 p-4 font-bold text-center text-zinc-500 uppercase tracking-widest text-[10px]">{tool.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.features.map((feature, fIdx) => (
                      <tr
                        key={feature.name}
                        className={fIdx % 2 === 0 ? "bg-white" : "bg-transparent"}
                      >
                        <td className="p-4">
                          <span className="text-zinc-950 font-bold">{feature.name}</span>
                          {feature.note && (
                            <span className="block text-xs text-zinc-500 mt-1 font-medium">{feature.note}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <FeatureIcon value={feature.nodebase} />
                        </td>
                        <td className="p-4 text-center bg-zinc-50/30">
                          <FeatureIcon value={feature.competitor} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* PROS & CONS */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-xl font-black text-emerald-700 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              {tool.name} Pros
            </h3>
            <ul className="space-y-3">
              {content.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-3 text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-xl font-black text-rose-700 mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              {tool.name} Cons
            </h3>
            <ul className="space-y-3">
              {content.cons.map((con) => (
                <li key={con} className="flex items-start gap-3 text-zinc-600 font-medium">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-blue-50 p-12 sm:p-20 rounded-[2.5rem] border border-blue-100 shadow-sm">
          <h2 className="text-4xl font-black text-zinc-950 mb-4">
            Ready to Choose the Winner?
          </h2>
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto font-medium">
            Stop paying per-user fees for basic chatbots. Get domain-specific AI, 
            Voice + Vision, and KYC at a flat ₹999/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all text-lg shadow-lg shadow-blue-600/20"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-950 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-sm"
            >
              View All Comparisons
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />;
  }
  if (value === false) {
    return <XCircle className="w-5 h-5 text-zinc-400 mx-auto" />;
  }
  return <span className="text-sm text-zinc-600 font-bold">{value}</span>;
}
