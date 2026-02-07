"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AupPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-6 container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
            Legal
          </div>

          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-12 text-brand-bone">
            {t("legal.aup.title")}
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                This Acceptable Use Policy (AUP) outlines the prohibited uses of the nodebase network, systems, and services. 
                All users must comply with this policy.
              </p>

              <h3>1. Prohibited Content</h3>
              <p>You may not use our services to host, store, or transmit:</p>
              <ul>
                <li>Child Sexual Abuse Material (CSAM). We have a zero-tolerance policy and will report to authorities immediately.</li>
                <li>Content that promotes terrorism, violence, or hate speech.</li>
                <li>Phishing sites, scam pages, or fraudulent schemes.</li>
                <li>Copyrighted material without the explicit permission of the owner.</li>
              </ul>

              <h3>2. System Abuse</h3>
              <p>You may not:</p>
              <ul>
                <li>Attempt to disrupt, degrade, or interfere with the integrity of the nodebase network (DDoS).</li>
                <li>Perform unauthorized vulnerability scanning or penetration testing.</li>
                <li>Use shared hosting resources excessively to the detriment of other users ("noisy neighbor" behavior).</li>
                <li>Send unsolicited bulk email (SPAM).</li>
              </ul>

              <h3>3. Resource Usage</h3>
              <ul>
                <li><strong>Crypto Mining:</strong> Cryptocurrency mining is strictly prohibited on Shared Hosting and VPS plans. It is allowed only on Dedicated Servers with prior approval.</li>
                <li><strong>Proxies/VPNs:</strong> Public proxies and VPN endpoints are prohibited on Shared Hosting.</li>
              </ul>

              <h3>4. Enforcement</h3>
              <p>
                Nodebase reserves the right to investigate any violation of this AUP. We may:
              </p>
              <ul>
                <li>Remove or block access to prohibited content.</li>
                <li>Suspend or terminate your account without notice.</li>
                <li>Report illegal activities to law enforcement agencies.</li>
              </ul>
              <p className="mt-4">
                If you suspect a violation of this policy, please report it to <span className="text-brand-bone font-bold">abuse@nodebase.space</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
