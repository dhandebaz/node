"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Mic,
  Eye,
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Globe,
} from "lucide-react";
import { comparisonTools, type ComparisonTool } from "@/lib/data/comparisons";

function ToolCard({ tool, index }: { tool: ComparisonTool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/compare/${tool.slug}`}
        className="block group h-full"
      >
        <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:border-blue-200 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-black text-blue-600">
                  {tool.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-950 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-zinc-600 font-medium">{tool.tagline}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <p className="text-sm text-zinc-600 mb-6 flex-grow font-medium leading-relaxed">
            {tool.description}
          </p>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Starting Price</span>
              <span className="text-lg font-black text-zinc-950">{tool.pricing.starting}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Pricing Model</span>
              <span className="text-sm font-bold text-zinc-700">{tool.pricing.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Per-User Fees</span>
              {tool.pricing.perUser ? (
                <span className="text-sm font-black text-rose-600">Yes (Costs more)</span>
              ) : (
                <span className="text-sm font-black text-emerald-600">No</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-zinc-950">{tool.rating}</span>
                <span className="text-xs text-zinc-500">({tool.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CompareIndex() {
  return (
    <div className="relative pb-32 pt-36 sm:pt-48 lg:pt-56 overflow-hidden bg-white">
      <div className="public-container relative z-10 space-y-32">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600 mb-6 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Complete Analysis</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-zinc-950 tracking-tight mb-6"
          >
            NodeBase vs{" "}
            <span className="text-blue-600">Every Competitor</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-600 max-w-2xl mx-auto font-medium"
          >
            Comprehensive comparisons with every major messaging, CRM, and AI platform. 
            See why NodeBase's domain-specific AI, Voice + Vision, and flat pricing wins.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/compare/kommo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg"
            >
              Start with Kommo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compare/respondio"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-950 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-sm"
            >
              Or Respond.io
            </Link>
          </motion.div>
        </section>

        {/* WHY NODEBASE WINS - Quick Summary */}
        <section className="bg-zinc-50 border border-zinc-100 p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-950 mb-4">
              Why Businesses Switch to NodeBase
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto font-medium">
              We compared NodeBase against every major platform. Here's why businesses are making the switch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: "Domain-Specific AI",
                description: "Not generic bots. AI trained for your exact business context.",
                advantage: true,
              },
              {
                icon: Mic,
                title: "Voice + Vision",
                description: "Phone calls and document scanning included. No extra cost.",
                advantage: true,
              },
              {
                icon: CreditCard,
                title: "Flat Pricing",
                description: "₹999/month vs $79-349/month. No per-user fees ever.",
                advantage: true,
              },
              {
                icon: ShieldCheck,
                title: "Built-in KYC",
                description: "ID verification, consent forms, compliance - all included.",
                advantage: true,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* COMPARISON TOOLS GRID */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-950 mb-4">
              Detailed Comparisons
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto font-medium">
              Click any platform below for a full feature-by-feature breakdown, 
              pricing analysis, and why NodeBase wins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {comparisonTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </section>

        {/* FEATURE COMPARISON TABLE */}
        <section className="bg-zinc-50 border border-zinc-100 p-8 sm:p-12 rounded-[2.5rem] shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-950 mb-4">
              Feature-by-Feature
            </h2>
            <p className="text-zinc-600 font-medium leading-relaxed">
              The key differences that matter for your business
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left p-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Feature</th>
                  <th className="w-40 p-4 font-bold text-center text-emerald-600 uppercase tracking-widest text-[10px]">NodeBase</th>
                  <th className="w-40 p-4 font-bold text-center text-zinc-500 uppercase tracking-widest text-[10px]">Others</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Domain-Specific AI Agents", nodebase: true, others: false },
                  { name: "Voice Calls Included", nodebase: true, others: false },
                  { name: "Vision/OCR", nodebase: true, others: false },
                  { name: "Automated KYC", nodebase: true, others: false },
                  { name: "Unlimited Users", nodebase: true, others: false },
                  { name: "Flat Monthly Price", nodebase: true, others: false },
                  { name: "Airbnb/Booking Integration", nodebase: true, others: false },
                  { name: "WhatsApp + Instagram + More", nodebase: true, others: true },
                  { name: "Payment Link Generation", nodebase: true, others: true },
                  { name: "Calendar Sync", nodebase: true, others: false },
                ].map((row, i) => (
                  <tr
                    key={row.name}
                    className={i % 2 === 0 ? "bg-white" : "bg-transparent"}
                  >
                    <td className="p-4 text-zinc-950 font-bold">{row.name}</td>
                    <td className="p-4 text-center">
                      {row.nodebase ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-zinc-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center bg-zinc-50/30">
                      {row.others ? (
                        <CheckCircle2 className="w-5 h-5 text-zinc-400 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-zinc-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PRICING COMPARISON */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "NodeBase", price: "₹999", period: "/month", features: ["Everything included", "Unlimited users", "Voice + Vision", "KYC built-in"], color: "emerald" },
            { name: "Respond.io", price: "$159+", period: "/month", features: ["Basic features", "User fees extra", "Voice costs more", "AI add-ons extra"], color: "zinc" },
            { name: "Kommo", price: "$15+", period: "/user/mo", features: ["Per-user pricing", "Basic AI", "No voice", "No KYC"], color: "zinc" },
            { name: "Wati", price: "$49+", period: "/month", features: ["WhatsApp focused", "Limited AI", "No vision", "Basic features"], color: "zinc" },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${
                plan.color === "emerald"
                  ? "bg-emerald-50 border-emerald-200 shadow-sm"
                  : "bg-white border-zinc-100 shadow-sm"
              }`}
            >
              <div className="text-center mb-6">
                <h3 className={`text-lg font-black mb-2 ${plan.color === "emerald" ? "text-emerald-700" : "text-zinc-500"}`}>
                  {plan.name}
                </h3>
                <div className={`text-3xl font-black ${plan.color === "emerald" ? "text-zinc-950" : "text-zinc-400"}`}>
                  {plan.price}
                  <span className="text-sm font-normal text-zinc-500">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    {plan.color === "emerald" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span className={plan.color === "emerald" ? "text-zinc-950 font-bold" : "text-zinc-500 font-medium"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        {/* CTA */}
        <section className="text-center bg-blue-50 p-12 sm:p-20 rounded-[2.5rem] border border-blue-100 shadow-sm">
          <h2 className="text-4xl font-black text-zinc-950 mb-4">
            Ready to Switch?
          </h2>
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of businesses who chose NodeBase over generic chatbot platforms. 
            Get started in minutes, not days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-950 font-bold rounded-xl hover:bg-zinc-50 transition-all shadow-sm"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
