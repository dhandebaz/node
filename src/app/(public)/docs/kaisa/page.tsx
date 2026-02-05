"use client";

import { BrainCircuit, MessageSquare, Briefcase, IndianRupee, Users } from "lucide-react";

export default function KaisaDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-saffron/10 rounded-xl flex items-center justify-center text-brand-saffron">
           <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="m-0 text-white">kaisa AI Overview</h1>
      </div>
      
      <p className="lead text-xl text-zinc-400">
        Kaisa is an <strong>agentic manager</strong> platform designed specifically for the Indian business ecosystem. Unlike generic chatbots, Kaisa agents are designed to function as "digital employees" with specific roles, responsibilities, and tools.
      </p>

      <h2 className="text-white mt-12">The "Digital Employee" Concept</h2>
      <p>
        We believe that small businesses (SMBs) don't want "AI Models"—they want <strong>staff</strong>. Kaisa abstracts the complexity of LLMs into familiar employment concepts.
      </p>

      <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
        <div className="glass-card p-6 rounded-xl border border-white/5">
           <div className="flex items-center gap-3 mb-3">
             <Briefcase className="w-5 h-5 text-brand-saffron" />
             <h3 className="font-bold text-white m-0">Roles, Not Prompts</h3>
           </div>
           <p className="text-sm text-zinc-400">
             You don't prompt Kaisa. You hire a "Receptionist" or a "Sales Associate". These roles come pre-trained with industry-specific knowledge and workflows.
           </p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white/5">
           <div className="flex items-center gap-3 mb-3">
             <IndianRupee className="w-5 h-5 text-green-400" />
             <h3 className="font-bold text-white m-0">Wages, Not Tokens</h3>
           </div>
           <p className="text-sm text-zinc-400">
             Pricing is calculated in "Credits/Hour" based on the agent's active work time. No confusing token calculations or API metering.
           </p>
        </div>
      </div>

      <h2 className="text-white mt-12">Target Sectors</h2>
      <div className="grid md:grid-cols-3 gap-6 not-prose">
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
            <h4 className="text-white font-bold mb-2">Healthcare</h4>
            <p className="text-sm text-zinc-400">Appointment scheduling, patient follow-ups, and Cowin integration for clinics.</p>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
            <h4 className="text-white font-bold mb-2">Hospitality</h4>
            <p className="text-sm text-zinc-400">Homestay booking management, guest check-in coordination via WhatsApp.</p>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
            <h4 className="text-white font-bold mb-2">Retail</h4>
            <p className="text-sm text-zinc-400">Inventory inquiries, order status updates, and catalog browsing.</p>
        </div>
      </div>

      <h2 className="text-white mt-12">Core Architecture</h2>
      <p>
        Kaisa operates on a proprietary "Human-in-the-Loop" (HITL) architecture.
      </p>
      <ul>
        <li><strong>Autonomy Levels:</strong> Configure agents to act fully autonomously or require approval for sensitive actions (like refunds).</li>
        <li><strong>Tool Use:</strong> Agents can use tools like `send_whatsapp`, `check_calendar`, and `create_invoice`.</li>
        <li><strong>Memory:</strong> Long-term memory of customer interactions ensures context is never lost.</li>
      </ul>

      <h3 className="text-white">Example: Medical Receptionist</h3>
      <p>
        A "Receptionist" agent for a clinic is pre-configured to:
      </p>
      <ol>
        <li>Answer calls/messages via WhatsApp.</li>
        <li>Check the doctor's calendar (Google Calendar/Outlook).</li>
        <li>Verify patient details.</li>
        <li>Book the slot and send a confirmation.</li>
      </ol>

      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm overflow-x-auto">
<pre className="text-blue-300">
{`# Example Agent Configuration
agent:
  role: "Medical Receptionist"
  name: "Priya"
  languages: ["en-IN", "hi-IN"]
  tools:
    - google_calendar
    - whatsapp_business
  constraints:
    - "Never double book slots"
    - "Always ask for patient age"`}
</pre>
      </div>

      <p>
        Ready to build? Check out the <a href="/docs/kaisa/agents-api" className="text-brand-saffron hover:underline">Agents API</a>.
      </p>
    </div>
  );
}
