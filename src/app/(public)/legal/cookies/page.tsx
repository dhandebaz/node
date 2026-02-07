"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookiesPage() {
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
            {t("legal.cookies.title")}
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                This Cookie Policy explains how nodebase uses cookies and similar technologies to recognize you when you visit our website.
              </p>

              <h3>1. What are Cookies?</h3>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work 
                more efficiently and to provide reporting information.
              </p>

              <h3>2. How We Use Cookies</h3>
              <p>We use cookies for the following purposes:</p>
              <ul>
                <li><strong>Essential Cookies:</strong> These are strictly necessary for the website to function (e.g., logging into your account, maintaining your session).</li>
                <li><strong>Performance & Analytics:</strong> These allow us to measure and improve the performance of our site. We use self-hosted analytics to ensure data sovereignty.</li>
                <li><strong>Functionality:</strong> These enable enhanced functionality and personalization (e.g., remembering your language preference).</li>
              </ul>

              <h3>3. Third-Party Cookies</h3>
              <p>
                We minimize the use of third-party cookies. However, we may use trusted third-party services for:
              </p>
              <ul>
                <li>Payment processing (Stripe, Razorpay).</li>
                <li>Bot detection and security (Cloudflare, Imunify360).</li>
              </ul>

              <h3>4. Managing Cookies</h3>
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. 
                If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
