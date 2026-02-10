"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import Link from "next/link";
import { ShieldCheck, Lock, Database, FileText, CheckCircle2 } from "lucide-react";

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-6 container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 rounded-full">
            Trust Center
          </div>

          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 text-brand-bone">
            Built on Trust.<br />Secured by Design.
          </h1>
          <p className="text-xl text-brand-bone/60">
            Your business data is the lifeblood of your operation. We treat it with the highest level of security, privacy, and compliance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <TrustCard 
            icon={Database}
            title="Data Sovereignty"
            description="All sensitive user data is stored exclusively within India in Tier-4 data centers, fully compliant with the DPDP Act 2023."
          />
          <TrustCard 
            icon={Lock}
            title="Encryption Everywhere"
            description="Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). Guest IDs are stored in a separate, isolated vault."
          />
          <TrustCard 
            icon={ShieldCheck}
            title="No Public Training"
            description="We do NOT use your private guest conversations or proprietary business rules to train our public AI models."
          />
        </div>

        <div className="max-w-4xl mx-auto bg-brand-bone/5 border border-brand-bone/10 rounded-3xl p-8 md:p-12 mb-20 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Safety & Compliance FAQ</h2>
          <div className="space-y-6">
            <FAQItem 
              question="Does the AI read my private messages?"
              answer="The AI only accesses messages needed to perform its job (replying to guests). It does not scan your history for advertising or sell your data to third parties."
            />
            <FAQItem 
              question="How are Guest IDs handled?"
              answer="Guest IDs collected for verification are encrypted immediately. They are only accessible to you (the host) and the verified guest. Nodebase staff cannot view them."
            />
            <FAQItem 
              question="Can I delete my data?"
              answer="Yes. You retain full ownership. If you delete your account, all your business data is permanently erased from our active servers within 30 days."
            />
          </div>
        </div>

        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-white">Legal Resources</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/legal/privacy" className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
              <FileText className="w-4 h-4" />
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>
            <Link href="/legal/aup" className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
              <FileText className="w-4 h-4" />
              Acceptable Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-brand-bone/5 border border-brand-bone/10 hover:bg-brand-bone/10 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-brand-red/20 flex items-center justify-center mb-6 text-brand-red">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
      <h3 className="text-lg font-bold text-white mb-2 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand-red shrink-0 mt-1" />
        {question}
      </h3>
      <p className="text-white/60 pl-8">{answer}</p>
    </div>
  );
}
