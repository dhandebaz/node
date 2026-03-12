"use client";

import { BrainCircuit, Briefcase, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

export default function KaisaDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center text-brand-bone">
             <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="m-0 text-brand-bone uppercase tracking-tighter">kaisa AI Overview</h1>
        </div>
        
        <p className="lead text-xl text-brand-bone/70 font-light">
          Kaisa is an <strong>agentic manager</strong> platform designed specifically for the Indian business ecosystem. Unlike generic chatbots, Kaisa agents are designed to function as &quot;digital employees&quot; with specific roles, responsibilities, and tools.
        </p>

        <h2 className="mt-12 uppercase tracking-tight">The &quot;Digital Employee&quot; Concept</h2>
        <p>
          We believe that small businesses (SMBs) don&apos;t want &quot;AI Models&quot;—they want <strong>staff</strong>. Kaisa abstracts the complexity of LLMs into familiar employment concepts.
        </p>

        <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
          <div className="p-6 rounded-xl border border-brand-bone/10 bg-brand-bone/5">
             <div className="flex items-center gap-3 mb-3">
               <Briefcase className="w-5 h-5 text-brand-bone" />
               <h3 className="font-bold text-brand-bone m-0 uppercase tracking-tight">Roles, Not Prompts</h3>
             </div>
             <p className="text-sm text-brand-bone/60">
               You don&apos;t prompt Kaisa. You hire a &quot;Receptionist&quot; or a &quot;Sales Associate&quot;. These roles come pre-trained with industry-specific knowledge and workflows.
             </p>
          </div>
          <div className="p-6 rounded-xl border border-brand-bone/10 bg-brand-bone/5">
             <div className="flex items-center gap-3 mb-3">
               <IndianRupee className="w-5 h-5 text-brand-bone" />
               <h3 className="font-bold text-brand-bone m-0 uppercase tracking-tight">Wages, Not Tokens</h3>
             </div>
             <p className="text-sm text-brand-bone/60">
               Pricing is calculated in &quot;Credits/Hour&quot; based on the agent&apos;s active work time. No confusing token calculations or API metering.
             </p>
          </div>
        </div>

        <h2 className="mt-12 uppercase tracking-tight">Target Sectors</h2>
        <div className="grid md:grid-cols-3 gap-6 not-prose">
          <div className="bg-brand-bone/5 p-4 rounded-lg border border-brand-bone/10">
              <h4 className="text-brand-bone font-bold mb-2 uppercase tracking-tight">Healthcare</h4>
              <p className="text-sm text-brand-bone/60">Appointment scheduling, patient follow-ups, and Cowin integration for clinics.</p>
          </div>
          <div className="bg-brand-bone/5 p-4 rounded-lg border border-brand-bone/10">
              <h4 className="text-brand-bone font-bold mb-2 uppercase tracking-tight">Hospitality</h4>
              <p className="text-sm text-brand-bone/60">Homestay booking management, guest check-in coordination via WhatsApp.</p>
          </div>
          <div className="bg-brand-bone/5 p-4 rounded-lg border border-brand-bone/10">
              <h4 className="text-brand-bone font-bold mb-2 uppercase tracking-tight">Retail</h4>
              <p className="text-sm text-brand-bone/60">Inventory inquiries, order status updates, and catalog browsing.</p>
          </div>
        </div>

        <h2 className="mt-12 uppercase tracking-tight">Core Architecture</h2>
        <p>
          Kaisa operates on a proprietary &quot;Human-in-the-Loop&quot; (HITL) architecture.
        </p>
        <ul>
          <li><strong>Autonomy Levels:</strong> Configure agents to act fully autonomously or require approval for sensitive actions (like refunds).</li>
          <li><strong>Tool Use:</strong> Agents can use tools like `send_whatsapp`, `check_calendar`, and `create_invoice`.</li>
          <li><strong>Memory:</strong> Long-term memory of customer interactions ensures context is never lost.</li>
        </ul>

        <h3 className="uppercase tracking-tight">Example: Medical Receptionist</h3>
        <p>
          A &quot;Receptionist&quot; agent for a clinic is pre-configured to:
        </p>
        <ol>
          <li>Answer calls/messages via WhatsApp (WAHA / Linked Devices).</li>
          <li>Check the doctor&apos;s calendar (Google Calendar/Outlook).</li>
          <li>Verify patient details.</li>
          <li>Book the slot and send a confirmation.</li>
        </ol>

        <div className="bg-black/50 border border-brand-bone/10 rounded-xl p-4 my-6 font-mono text-sm overflow-x-auto">
<pre className="text-brand-bone/80">
{`# Example Agent Configuration
agent:
  role: "Medical Receptionist"
  name: "Priya"
  languages: ["en-IN", "hi-IN"]
  tools:
    - google_calendar
    - whatsapp_waha
  constraints:
    - "Never double book slots"
    - "Always ask for patient age"`}
</pre>
        </div>

        <p>
          Ready to build? Check out the <a href="/docs/kaisa/agents-api" className="text-brand-bone font-bold hover:underline decoration-brand-bone/30">Agents API</a>.
        </p>
      </motion.div>
    </div>
  );
}
