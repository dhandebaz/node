import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agents API - kaisa AI Docs",
  description: "API reference for kaisa AI Agents.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Agents API Reference</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        The Kaisa Agents API allows you to programmatically manage agents, trigger tasks, and retrieve interaction logs.
      </p>

      <div className="not-prose bg-zinc-900 border border-white/10 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-saffron/20 text-brand-saffron px-2 py-1 rounded text-xs font-bold">BASE URL</span>
          <code className="text-zinc-300">https://api.nodebase.com/v1/kaisa</code>
        </div>
        <p className="text-sm text-zinc-500 m-0">All requests must include the `Authorization: Bearer &lt;token&gt;` header.</p>
      </div>

      <h2 className="text-white mt-8">Resources</h2>

      {/* List Agents */}
      <div className="mb-12">
        <h3 className="text-white border-b border-white/10 pb-2 mb-4">List Agents</h3>
        <p>Retrieve a list of all active agents in your organization.</p>
        
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm mb-4">
          <span className="text-white font-bold">GET</span> <span className="text-zinc-400">/agents</span>
        </div>

        <h4 className="text-white text-sm font-bold mb-2">Response Example</h4>
        <div className="bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-white/5">
          <pre className="text-xs text-zinc-300">
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
      </div>

      {/* Run Task */}
      <div className="mb-12">
        <h3 className="text-white border-b border-white/10 pb-2 mb-4">Run Task</h3>
        <p>Trigger an agent to perform a specific task immediately.</p>
        
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm mb-4">
          <span className="text-brand-saffron font-bold">POST</span> <span className="text-zinc-400">/agents/{`{agent_id}`}/run</span>
        </div>

        <h4 className="text-white text-sm font-bold mb-2">Request Body</h4>
        <div className="bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-white/5 mb-4">
          <pre className="text-xs text-zinc-300">
{`{
  "input": "Check availability for Dr. Sharma on Tuesday morning.",
  "context": {
    "user_id": "usr_555"
  }
}`}
          </pre>
        </div>

        <h4 className="text-white text-sm font-bold mb-2">Response Example</h4>
        <div className="bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-white/5">
          <pre className="text-xs text-zinc-300">
{`{
  "task_id": "tsk_abc123",
  "status": "processing",
  "estimated_completion": "5s"
}`}
          </pre>
        </div>
      </div>

      {/* Agent History */}
      <div className="mb-12">
        <h3 className="text-white border-b border-white/10 pb-2 mb-4">Get Interaction History</h3>
        <p>Retrieve the chat/action history for a specific agent.</p>
        
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm mb-4">
          <span className="text-white font-bold">GET</span> <span className="text-zinc-400">/agents/{`{agent_id}`}/history</span>
        </div>
      </div>

      <h2 className="text-white mt-12">Error Codes</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-2 text-white">Code</th>
            <th className="py-2 text-white">Description</th>
          </tr>
        </thead>
        <tbody className="text-sm text-zinc-400">
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">401 Unauthorized</td>
            <td className="py-2">Invalid or missing API token.</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">402 Payment Required</td>
            <td className="py-2">Insufficient credits to run the agent.</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">429 Too Many Requests</td>
            <td className="py-2">Rate limit exceeded.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
