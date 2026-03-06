"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      
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
                Effective Date: March 6, 2026<br/>
                This Privacy Policy is published in compliance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (the "SPDI Rules").
              </p>

              <h3>1. Scope and Consent</h3>
              <p>
                By using Nodebase ("we," "us," or "our"), you consent to the collection, storage, and use of your information as described in this policy. If you do not agree, please do not use our services. This policy applies to all users accessing our platform from India and globally.
              </p>

              <h3>2. Collection of Information</h3>
              <p>We collect the following types of information:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, phone number, email address, and GSTIN/PAN details provided during registration (KYC).</li>
                <li><strong>Sensitive Personal Data:</strong> Financial information such as bank account details or UPI IDs for payouts, processed via secured payment gateways (Razorpay). We do not store full credit card numbers on our servers.</li>
                <li><strong>Business Data:</strong> Property listings, inventory details, patient records (for Nurse AI), and customer conversations processed by our AI.</li>
              </ul>

              <h3>3. Use of Information</h3>
              <p>Your data is used for:</p>
              <ul>
                <li>Provisioning AI Employees (Host AI, Dukan AI, etc.) to automate your business operations.</li>
                <li>Processing payments and managing your wallet balance.</li>
                <li>Complying with Indian legal obligations, including tax (GST) and cyber security regulations.</li>
              </ul>

              <h3>4. Data Transfer and Storage</h3>
              <p>
                Your data may be processed on servers located in India and abroad (e.g., for AI model inference). We ensure that any international transfer of data complies with applicable laws and maintains the same level of data protection as required under the IT Act, 2000.
              </p>

              <h3>5. Disclosure to Third Parties</h3>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Razorpay (for payments), Cloud providers (AWS/GCP), and AI model providers (OpenAI/Anthropic) strictly for service delivery.</li>
                <li><strong>Legal Authorities:</strong> When required by law, court order, or government agency (e.g., CERT-In) for cyber security incidents or legal investigations.</li>
              </ul>

              <h3>6. Grievance Officer</h3>
              <p>
                In accordance with the IT Act, 2000 and the Rules made thereunder, the name and contact details of the Grievance Officer are provided below:
              </p>
              <div className="bg-brand-bone/10 p-4 rounded-lg border border-brand-bone/10 not-prose">
                <p className="font-bold text-white mb-1">Mr. Rahul Varma</p>
                <p className="text-sm">Designation: Grievance Officer</p>
                <p className="text-sm">Nodebase Technologies Pvt. Ltd.</p>
                <p className="text-sm">Email: grievance@nodebase.space</p>
                <p className="text-sm">Address: Indiranagar, Bangalore, Karnataka - 560038, India</p>
              </div>

              <h3>7. Data Security</h3>
              <p>
                We implement reasonable security practices and procedures (IS/ISO/IEC 27001 standard equivalent) to protect your data. However, no digital transmission is completely secure. You acknowledge this risk when using our services.
              </p>

              <h3>8. Updates to Policy</h3>
              <p>
                We reserve the right to modify this policy. Significant changes will be notified via email or platform alerts. Continued use implies acceptance of the updated terms.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
