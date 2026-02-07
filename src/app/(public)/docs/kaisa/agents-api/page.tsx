"use client";

import { motion } from "framer-motion";

export default function Page() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">Agents API Reference</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60 mb-8">
          The Kaisa Agents API allows you to programmatically manage agents, trigger tasks, and retrieve interaction logs.
        </motion.p>

        <motion.div variants={fadeInUp} className="not-prose bg-brand-bone/5 border border-brand-bone/10 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-saffron/20 text-brand-saffron px-2 py-1 rounded text-xs font-bold">BASE URL</span>
            <code className="text-brand-bone">https://api.nodebase.com/v1/kaisa</code>
          </div>
          <p className="text-sm text-brand-bone/50 m-0">All requests must include the `Authorization: Bearer &lt;token&gt;` header.</p>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-8 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Resources</motion.h2>

        {/* List Agents */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone/90 mb-4 text-xl font-medium">List Agents</h3>
          <p>Retrieve a list of all active agents in your organization.</p>
          
          <div className="bg-black/40 rounded-lg p-4 font-mono text-sm mb-4 border border-brand-bone/5">
            <span className="text-brand-bone font-bold">GET</span> <span className="text-brand-bone/60">/agents</span>
          </div>

          <h4 className="text-brand-bone text-sm font-bold mb-2 uppercase tracking-wide">Response Example</h4>
          <div className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-brand-bone/5 backdrop-blur-sm">
            <pre className="text-xs text-brand-bone/80 font-mono">
{`{
  "data": [
    {
      "id": "ag_123456789",
      "name": "Anjali",
      "role": "Receptionist",
      "status": "active",
      "wage_per_hour": 150
    },
    {
      "id": "ag_987654321",
      "name": "Rahul",
      "role": "Sales Associate",
      "status": "paused",
      "wage_per_hour": 200
    }
  ]
}`}
            </pre>
          </div>
        </motion.div>

        {/* Run Task */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone/90 mb-4 text-xl font-medium">Run Task</h3>
          <p>Trigger an agent to perform a specific task immediately.</p>
          
          <div className="bg-black/40 rounded-lg p-4 font-mono text-sm mb-4 border border-brand-bone/5">
            <span className="text-brand-saffron font-bold">POST</span> <span className="text-brand-bone/60">/agents/{`{agent_id}`}/run</span>
          </div>

          <h4 className="text-brand-bone text-sm font-bold mb-2 uppercase tracking-wide">Request Body</h4>
          <div className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-brand-bone/5 mb-4 backdrop-blur-sm">
            <pre className="text-xs text-brand-bone/80 font-mono">
{`{
  "input": "Check availability for Dr. Sharma on Tuesday morning.",
  "context": {
    "user_id": "usr_555"
  }
}`}
            </pre>
          </div>

          <h4 className="text-brand-bone text-sm font-bold mb-2 uppercase tracking-wide">Response Example</h4>
          <div className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-brand-bone/5 backdrop-blur-sm">
            <pre className="text-xs text-brand-bone/80 font-mono">
{`{
  "task_id": "tsk_abc123",
  "status": "processing",
  "estimated_completion": "5s"
}`}
            </pre>
          </div>
        </motion.div>

        {/* Agent History */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone/90 mb-4 text-xl font-medium">Get Interaction History</h3>
          <p>Retrieve the chat/action history for a specific agent.</p>
          
          <div className="bg-black/40 rounded-lg p-4 font-mono text-sm mb-4 border border-brand-bone/5">
            <span className="text-brand-bone font-bold">GET</span> <span className="text-brand-bone/60">/agents/{`{agent_id}`}/history</span>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Error Codes</motion.h2>
        <motion.table variants={fadeInUp} className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-bone/10">
              <th className="py-2 text-brand-bone uppercase text-xs tracking-wider">Code</th>
              <th className="py-2 text-brand-bone uppercase text-xs tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="text-sm text-brand-bone/60">
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">401 Unauthorized</td>
              <td className="py-2">Invalid or missing API token.</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">402 Payment Required</td>
              <td className="py-2">Insufficient credits to run the agent.</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">429 Too Many Requests</td>
              <td className="py-2">Rate limit exceeded.</td>
            </tr>
          </tbody>
        </motion.table>
      </motion.div>
    </div>
  );
}
