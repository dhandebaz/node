"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      
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
            Terms of Service
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                Welcome to Nodebase. These Terms of Service ("Terms") govern your access to and use of the Nodebase platform, including our AI Employee services, website, and related applications (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms.
              </p>

              <h3>1. User Accounts</h3>
              <p>
                To access certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. Nodebase will not be liable for any loss or damage arising from your failure to comply with these requirements.
              </p>

              <h3>2. AI Employee Services</h3>
              <p>
                Nodebase provides AI-powered autonomous agents ("AI Employees") designed to automate business tasks such as customer communication, scheduling, and data management.
              </p>
              <ul>
                <li><strong>Autonomy:</strong> AI Employees operate autonomously based on the instructions and parameters you configure. You acknowledge that AI systems may occasionally produce unpredictable results.</li>
                <li><strong>Supervision:</strong> You retain ultimate responsibility for supervising the activities of your AI Employees and for reviewing their outputs for accuracy and appropriateness.</li>
              </ul>

              <h3>3. Subscription and Billing</h3>
              <p>
                The Services are offered on a subscription basis and may include usage-based charges for AI compute resources ("Credits").
              </p>
              <ul>
                <li><strong>Subscriptions:</strong> Subscription fees are billed in advance on a monthly or annual basis. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.</li>
                <li><strong>AI Credits:</strong> Usage of AI models consumes Credits. Credits may be purchased in bundles or included in your subscription. Unused Credits do not expire but are non-refundable.</li>
                <li><strong>Changes to Fees:</strong> We reserve the right to change our pricing upon notice to you. Continued use of the Service after a price change constitutes your agreement to pay the changed amount.</li>
              </ul>

              <h3>4. Acceptable Use of AI</h3>
              <p>
                You agree to use the Services only for lawful purposes and in accordance with these Terms. You shall not use the Services to:
              </p>
              <ul>
                <li>Generate or disseminate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</li>
                <li>Engage in automated interactions that deceive others or misrepresent the nature of the interaction (e.g., failing to disclose AI involvement where required by law).</li>
                <li>Attempt to reverse engineer, decompile, or disassemble any aspect of the AI models or underlying software.</li>
                <li>Use the Services to develop a competing AI model or platform.</li>
              </ul>

              <h3>5. Intellectual Property</h3>
              <p>
                The Services, including the Nodebase platform, algorithms, software, and visual interfaces, are the exclusive property of Nodebase and its licensors. You retain ownership of the data you upload to the Service ("User Data"). By using the Service, you grant Nodebase a limited license to process User Data solely for the purpose of providing and improving the Services.
              </p>

              <h3>6. Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NODEBASE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
              </p>

              <h3>7. Termination</h3>
              <p>
                We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Services will immediately cease.
              </p>

              <h3>8. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nodebase is incorporated, without regard to its conflict of law provisions.
              </p>

              <h3>9. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us at support@nodebase.space.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
