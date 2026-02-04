"use client";

import { BrainCircuit } from "lucide-react";

export default function KaisaDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-saffron/10 rounded-xl flex items-center justify-center text-brand-saffron">
           <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="m-0">kaisa AI Documentation</h1>
      </div>
      
      <p className="lead">
        Kaisa is an agentic AI platform designed for Indian business contexts. Unlike generic LLMs, Kaisa is built to <strong>do</strong> things, not just say things.
      </p>

      <h2>Core Concepts</h2>
      <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
        <div className="glass-card p-6 rounded-xl border border-white/5">
           <h3 className="font-bold text-white mb-2">Agents</h3>
           <p className="text-sm text-white/60">Autonomous workers that can execute tasks. An agent has a role (e.g., "Receptionist") and a set of tools.</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white/5">
           <h3 className="font-bold text-white mb-2">Tools</h3>
           <p className="text-sm text-white/60">Functions that agents can call. Examples: `send_whatsapp`, `check_inventory`, `book_appointment`.</p>
        </div>
      </div>

      <h2>The Kaisa Architecture</h2>
      <p>
        Kaisa operates on a "Human-in-the-loop" model. Agents propose actions, and for sensitive tasks (like payments or external communications), they request human approval.
      </p>
      
      <h3>Model Context Protocol (MCP)</h3>
      <p>
        We use an in-house implementation of MCP to standardize how agents access data. This ensures:
      </p>
      <ul>
        <li><strong>Security:</strong> Agents only access data they are explicitly granted.</li>
        <li><strong>Sovereignty:</strong> Context data is processed in India-only inference zones.</li>
      </ul>

      <h2>Example: Creating a Receptionist Agent</h2>
      <p>
        Here is how you define a simple agent using the Kaisa SDK (Python):
      </p>

      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm overflow-x-auto">
<pre className="text-blue-300">
{`from kaisa import Agent, Tool

# Define a tool
def check_calendar(date):
    """Checks available slots for a given date"""
    return db.query("SELECT * FROM slots WHERE date = ?", date)

# Initialize Agent
receptionist = Agent(
    name="Anjali",
    role="Medical Receptionist",
    language="hi-IN",  # Hindi support
    tools=[check_calendar]
)

# Run a task
response = receptionist.run("Is there a slot free on Tuesday?")
print(response)`}
</pre>
      </div>

      <p>
        For full API details, see the <a href="/docs/kaisa/agents-api" className="text-brand-saffron">API Reference</a>.
      </p>
    </div>
  );
}
