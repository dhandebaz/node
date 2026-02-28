"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                At Nodebase, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our AI Employee platform.
              </p>

              <h3>1. Information We Collect</h3>
              <p>
                We collect information that you provide directly to us, as well as information collected automatically when you use our Services.
              </p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, password, and billing details provided during registration.</li>
                <li><strong>Business Data:</strong> Information regarding your business operations, including property details, service listings, and operational preferences configured for your AI Employee.</li>
                <li><strong>Communication Data:</strong> Logs of interactions between your AI Employee and your customers/guests, which are processed to provide the automation service.</li>
                <li><strong>Usage Data:</strong> Information about how you access and use the platform, including device information, log files, and interaction metrics.</li>
              </ul>

              <h3>2. Use of Information</h3>
              <p>
                We use the collected information for the following purposes:
              </p>
              <ul>
                <li>To provide, maintain, and improve our AI Employee services.</li>
                <li>To process transactions and manage your subscription.</li>
                <li>To facilitate integrations with third-party platforms (e.g., syncing calendars or messages).</li>
                <li>To communicate with you regarding updates, security alerts, and support.</li>
                <li>To detect, prevent, and address technical issues and fraudulent activity.</li>
              </ul>

              <h3>3. Third-Party Integrations</h3>
              <p>
                Our platform integrates with various third-party services to function effectively. By connecting these services, you authorize us to access and process data from them.
              </p>
              <ul>
                <li><strong>Google Services:</strong> Integration with Google Calendar and Gmail to manage scheduling and communications. Data accessed via Google APIs is used strictly in accordance with the Google API Services User Data Policy.</li>
                <li><strong>Booking Platforms:</strong> Integration with platforms like Airbnb, Booking.com, and others to sync reservation data.</li>
                <li><strong>Payment Processors:</strong> We use secure third-party payment processors (e.g., Stripe) to handle financial transactions. We do not store your complete credit card information.</li>
              </ul>

              <h3>4. Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to track activity on our Services and hold certain information.
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Necessary for the operation of the website (e.g., session management).</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform so we can improve the experience.</li>
              </ul>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>

              <h3>5. Data Protection and Security</h3>
              <p>
                We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul>
                <li><strong>Encryption:</strong> Sensitive data is encrypted at rest and in transit using industry-standard protocols (TLS/SSL).</li>
                <li><strong>Access Control:</strong> Access to personal data is restricted to authorized personnel who need to know that information to process it.</li>
                <li><strong>Data Retention:</strong> We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.</li>
              </ul>

              <h3>6. Your Data Rights</h3>
              <p>
                Depending on your jurisdiction, you may have the right to access, correct, update, or request deletion of your personal information. You can manage most of your data directly within your account settings or contact us for assistance.
              </p>

              <h3>7. Changes to This Policy</h3>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>

              <h3>8. Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy, please contact us at support@nodebase.space.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
