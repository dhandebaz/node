"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookiesPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.cookies.title")} 
        description={t("legal.cookies.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-purple-500)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               This Cookie Policy explains how nodebase uses cookies and similar technologies to recognize you when you visit our website.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. What are Cookies?</h3>
             <p>
               Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work 
               more efficiently and to provide reporting information.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. How We Use Cookies</h3>
             <p>We use cookies for the following purposes:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Essential Cookies:</strong> These are strictly necessary for the website to function (e.g., logging into your account, maintaining your session).</li>
               <li><strong>Performance & Analytics:</strong> These allow us to measure and improve the performance of our site. We use self-hosted analytics to ensure data sovereignty.</li>
               <li><strong>Functionality:</strong> These enable enhanced functionality and personalization (e.g., remembering your language preference).</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. Third-Party Cookies</h3>
             <p>
               We minimize the use of third-party cookies. However, we may use trusted third-party services for:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Payment processing (Stripe, Razorpay).</li>
               <li>Bot detection and security (Cloudflare, Imunify360).</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Managing Cookies</h3>
             <p>
               You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. 
               If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
