"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Bot,
  Mic,
  Eye,
  ShieldCheck,
  Phone,
  CreditCard,
  Calendar,
  MessageSquare,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";

const comparisonData = {
  pricing: {
    title: "Pricing",
    description: "Total cost of ownership",
    nodebase: {
      price: "₹999",
      period: "/month",
      note: "Flat rate, unlimited users",
    },
    kommo: {
      price: "$15-45",
      period: "/user/month",
      note: "Minimum 1 user, 6-month commitment",
    },
    respondio: {
      price: "$79-349",
      period: "/month",
      note: "Plus $12/user extra, AI add-ons",
    },
  },
  features: [
    {
      category: "AI Capabilities",
      icon: Bot,
      items: [
        { name: "Domain-Specific AI Agents", nodebase: true, kommo: false, respondio: false, note: "Host AI, Nurse AI, Dukan AI, Thrift AI" },
        { name: "Generic Chatbot Only", nodebase: false, kommo: true, respondio: true },
        { name: "AI Memory & Context", nodebase: true, kommo: false, respondio: false, note: "Kaisa AI memory layer" },
        { name: "AI Response Suggestions", nodebase: true, kommo: true, respondio: true },
      ],
    },
    {
      category: "Voice & Vision",
      icon: Mic,
      items: [
        { name: "Voice Calls (Telephony)", nodebase: true, kommo: false, respondio: "Partial", note: "Included at ₹999/mo" },
        { name: "IVR & Call Routing", nodebase: true, kommo: false, respondio: false },
        { name: "Vision/OCR", nodebase: true, kommo: false, respondio: false, note: "Nodebase Eyes" },
        { name: "Document Scanning", nodebase: true, kommo: false, respondio: false },
      ],
    },
    {
      category: "Compliance & KYC",
      icon: ShieldCheck,
      items: [
        { name: "Automated KYC", nodebase: true, kommo: false, respondio: false, note: "ID verification built-in" },
        { name: "Consent Management", nodebase: true, kommo: false, respondio: false },
        { name: "PII Masking", nodebase: true, kommo: false, respondio: false, note: "Aadhaar auto-masked" },
        { name: "Audit Trails", nodebase: true, kommo: true, respondio: true },
      ],
    },
    {
      category: "Messaging Channels",
      icon: MessageSquare,
      items: [
        { name: "WhatsApp", nodebase: true, kommo: true, respondio: true },
        { name: "Instagram", nodebase: true, kommo: true, respondio: true },
        { name: "Facebook Messenger", nodebase: true, kommo: true, respondio: true },
        { name: "Airbnb & Booking.com", nodebase: true, kommo: false, respondio: false, note: "Native integration" },
      ],
    },
    {
      category: "Integrations",
      icon: Globe,
      items: [
        { name: "Razorpay Payments", nodebase: true, kommo: false, respondio: true },
        { name: "Google Calendar", nodebase: true, kommo: false, respondio: false },
        { name: "Calendar Sync", nodebase: true, kommo: false, respondio: false },
        { name: "Zapier/Make", nodebase: true, kommo: true, respondio: true },
      ],
    },
    {
      category: "Business Model",
      icon: Users,
      items: [
        { name: "Unlimited Users", nodebase: true, kommo: false, respondio: false },
        { name: "No Per-User Fees", nodebase: true, kommo: false, respondio: false },
        { name: "Flat Pricing", nodebase: true, kommo: false, respondio: false },
        { name: "Usage-Based Add-ons", nodebase: false, kommo: false, respondio: true },
      ],
    },
  ],
};

function CheckIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />;
  }
  if (value === false) {
    return <XCircle className="w-5 h-5 text-zinc-400 mx-auto" />;
  }
  return <span className="text-sm text-zinc-600 font-bold mx-auto">{value}</span>;
}

export function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-bold mb-6">
            <Zap className="w-4 h-4" />
            The Clear Winner
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-950 mb-6">
            NodeBase vs Kommo vs Respond.io
          </h1>
          
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
            See why thousands of businesses are switching to NodeBase. 
            Better AI, more features, and a fraction of the cost.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Hero */}
      <section className="py-16 border-y border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">Pricing at a Glance</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* NodeBase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-gradient-to-b from-blue-50 to-white border-2 border-blue-600 shadow-xl shadow-blue-600/10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                BEST VALUE
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-zinc-950 mb-2">NodeBase</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-black text-blue-600">{comparisonData.pricing.nodebase.price}</span>
                  <span className="text-zinc-500">{comparisonData.pricing.nodebase.period}</span>
                </div>
                <p className="text-sm text-zinc-500 mb-6">{comparisonData.pricing.nodebase.note}</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Unlimited users
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Voice + Vision included
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Domain-specific AI
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Automated KYC
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Kommo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-white border border-zinc-200"
            >
              <div className="text-center">
                <h3 className="text-xl font-black text-zinc-950 mb-2">Kommo</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-black text-zinc-500">{comparisonData.pricing.kommo.price}</span>
                  <span className="text-zinc-500 font-medium">{comparisonData.pricing.kommo.period}</span>
                </div>
                <p className="text-sm text-zinc-500 font-medium mb-6">{comparisonData.pricing.kommo.note}</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    Per-user pricing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    Basic AI only
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    No voice/vision
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    No KYC built-in
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Respond.io */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-white border border-zinc-200"
            >
              <div className="text-center">
                <h3 className="text-xl font-black text-zinc-950 mb-2">Respond.io</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-black text-zinc-500">{comparisonData.pricing.respondio.price}</span>
                  <span className="text-zinc-500 font-medium">{comparisonData.pricing.respondio.period}</span>
                </div>
                <p className="text-sm text-zinc-500 font-medium mb-6">{comparisonData.pricing.respondio.note}</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    Extra user fees
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    Generic AI agents
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    Voice costs extra ($279+)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                    <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    No vision/OCR
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Feature Comparison</h2>
            <p className="text-lg text-zinc-600">Every feature you need, none of what you don't</p>
          </div>

          <div className="space-y-16">
            {comparisonData.features.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <category.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black">{category.category}</h3>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="text-left p-4 font-bold text-zinc-600">Feature</th>
                        <th className="w-32 p-4 font-bold text-center text-blue-600">NodeBase</th>
                        <th className="w-32 p-4 font-bold text-center text-zinc-500">Kommo</th>
                        <th className="w-32 p-4 font-bold text-center text-zinc-500">Respond.io</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, itemIndex) => (
                        <tr
                          key={item.name}
                          className={itemIndex % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                        >
                          <td className="p-4">
                            <span className="font-medium">{item.name}</span>
                            {item.note && (
                              <span className="block text-xs text-zinc-500 mt-1">{item.note}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <CheckIcon value={item.nodebase} />
                          </td>
                          <td className="p-4 text-center bg-zinc-50/30">
                            <CheckIcon value={item.kommo} />
                          </td>
                          <td className="p-4 text-center bg-zinc-50/30">
                            <CheckIcon value={item.respondio} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Real Cost Comparison</h2>
            <p className="text-lg text-zinc-600">
              See how much you save with NodeBase for a 10-person team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-zinc-200 text-center">
              <h3 className="text-lg font-black mb-4">NodeBase</h3>
              <div className="text-4xl font-black text-blue-600 mb-2">₹999</div>
              <p className="text-sm text-zinc-500">per month, forever</p>
              <div className="mt-6 p-4 rounded-xl bg-emerald-50">
                <span className="text-2xl font-black text-emerald-600">Save 95%+</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-zinc-200 text-center shadow-sm">
              <h3 className="text-lg font-black mb-4">Kommo</h3>
              <div className="text-4xl font-black text-zinc-500 mb-2">$150+</div>
              <p className="text-sm text-zinc-600 font-medium">per month (10 users)</p>
              <div className="mt-6 p-4 rounded-xl bg-zinc-50">
                <span className="text-sm text-zinc-600 font-bold">$15/user minimum</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-zinc-200 text-center shadow-sm">
              <h3 className="text-lg font-black mb-4">Respond.io</h3>
              <div className="text-4xl font-black text-zinc-500 mb-2">$279+</div>
              <p className="text-sm text-zinc-600 font-medium">per month (Growth plan)</p>
              <div className="mt-6 p-4 rounded-xl bg-zinc-50">
                <span className="text-sm text-zinc-600 font-bold">+ AI add-ons, user fees</span>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-zinc-500">
            * Prices converted from USD at ~₹83/$. Actual savings vary by plan selection.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Ready to switch?
          </h2>
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who chose NodeBase over Kommo and Respond.io.
            Get started in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 text-lg"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/company/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all text-lg"
            >
              Talk to Sales
            </Link>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            No credit card required. 14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 NodeBase. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/legal/terms" className="text-zinc-500 hover:text-zinc-950">Terms</Link>
              <Link href="/legal/privacy" className="text-zinc-500 hover:text-zinc-950">Privacy</Link>
              <Link href="/trust" className="text-zinc-500 hover:text-zinc-950">Trust</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
