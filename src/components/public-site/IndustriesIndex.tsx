"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Bot,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";
import { industries, type Industry } from "@/lib/data/industries";

function IndustryCard({ industry, index }: { industry: Industry; index: number }) {
  const Icon = industry.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/industries/${industry.slug}`}
        className="block group h-full"
      >
        <div className="glass-panel p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 h-full flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <Icon className="w-8 h-8 text-blue-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mb-4">
            <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-2">
              {industry.name}
            </h3>
            <p className="text-sm text-zinc-500">{industry.tagline}</p>
          </div>

          <p className="text-sm text-zinc-400 mb-6 flex-grow">
            {industry.description}
          </p>

          {industry.caseStudy && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">CASE STUDY</span>
              </div>
              <p className="text-sm font-bold text-white">{industry.caseStudy.business}</p>
              <p className="text-xs text-zinc-400 mb-2">{industry.caseStudy.type}</p>
              <p className="text-sm text-emerald-400 font-medium">
                {industry.caseStudy.metric}
              </p>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Bot className="w-4 h-4" />
              {industry.aiAgent.name}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function IndustriesIndex() {
  return (
    <div className="relative pb-32 pt-24 sm:pt-32 overflow-hidden">
      <div className="public-container relative z-10 space-y-32">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-sm font-bold text-blue-400 mb-6"
          >
            <Bot className="w-4 h-4" />
            Domain-Specific AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-white tracking-tight mb-6"
          >
            AI Built for{" "}
            <span className="text-gradient-primary">Your Industry</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8"
          >
            Generic chatbots don't understand your business. NodeBase deploys AI employees 
            trained specifically for hospitality, healthcare, retail, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/industries/hospitality"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              Explore Hospitality <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              View Pricing
            </Link>
          </motion.div>
        </section>

        {/* WHAT MAKES US DIFFERENT */}
        <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] border border-blue-500/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Why Industry-Specific AI Matters
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              A generic chatbot needs training and still makes mistakes. 
              NodeBase's AI employees understand your industry from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-black text-rose-400 mb-4">Generic AI</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="text-rose-400 font-bold">✗</span>
                  Needs extensive setup and training
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="text-rose-400 font-bold">✗</span>
                  Doesn't understand industry terminology
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="text-rose-400 font-bold">✗</span>
                  Can't handle domain-specific workflows
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="text-rose-400 font-bold">✗</span>
                  High error rate on specialized queries
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30">
              <h3 className="text-xl font-black text-emerald-400 mb-4">NodeBase AI</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  Works out of the box for your industry
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  Understands industry-specific language
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  Handles domain workflows automatically
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  High accuracy on specialized queries
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* INDUSTRIES GRID */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Choose Your Industry
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Click any industry below to see how NodeBase transforms your operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <IndustryCard key={industry.id} industry={industry} index={index} />
            ))}
          </div>
        </section>

        {/* AI EMPLOYEES SHOWCASE */}
        <section className="glass-panel p-8 sm:p-12 rounded-[2.5rem]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Meet Your AI Employees
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Each AI agent is purpose-built for its industry with specialized knowledge, 
              workflows, and integrations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <div
                  key={industry.id}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">
                    {industry.aiAgent.name}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4">{industry.aiAgent.description}</p>
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Learn more →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMMON FEATURES */}
        <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] border border-blue-500/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Included in Every Industry
            </h2>
            <p className="text-zinc-400">
              All NodeBase plans include these enterprise features
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: "Multi-Channel", desc: "WhatsApp, Instagram, Airbnb, web" },
              { icon: Bot, title: "AI Automation", desc: "Domain-specific responses" },
              { icon: Calendar, title: "Scheduling", desc: "Calendar sync & reminders" },
              { icon: Users, title: "Team Inbox", desc: "Collaborative customer view" },
              { icon: CheckCircle2, title: "KYC", desc: "ID verification built-in" },
              { icon: MessageSquare, title: "Payments", desc: "Razorpay/Stripe links" },
              { icon: Bot, title: "Analytics", desc: "Performance insights" },
              { icon: CheckCircle2, title: "Support", desc: "24/7 AI + human backup" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <feature.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center glass-panel-glow p-12 sm:p-20 rounded-[2.5rem] border border-emerald-500/30">
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to Deploy Your AI Employee?
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Get industry-specific AI that works from day one. 
            Start your free trial and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-lg"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Compare with Others
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
