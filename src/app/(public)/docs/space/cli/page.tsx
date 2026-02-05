import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI Reference - Nodebase Space Docs",
  description: "Command line interface documentation.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">CLI Reference</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        The <code>nb</code> command-line interface is your primary tool for managing Nodebase resources.
      </p>

      <h2 className="text-white mt-12">Core Commands</h2>

      {/* nb login */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb login</h3>
        <p>Authenticate with your Nodebase account.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
          <span className="text-brand-saffron">$</span> nb login
        </div>
        <p className="text-sm text-zinc-400">Opens a browser window to complete authentication via GitHub, Google, or Email.</p>
      </div>

      {/* nb init */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb init</h3>
        <p>Initialize a new project in the current directory.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
          <span className="text-brand-saffron">$</span> nb init
        </div>
        <p className="text-sm text-zinc-400">Creates a <code>nodebase.json</code> configuration file.</p>
      </div>

      {/* nb deploy */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb deploy</h3>
        <p>Deploy the current project to Space.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
          <span className="text-brand-saffron">$</span> nb deploy [path] [--prod]
        </div>
        <ul className="text-sm text-zinc-400">
          <li><code>path</code>: Optional path to project (default: current directory)</li>
          <li><code>--prod</code>: Deploy to production environment (default: preview)</li>
        </ul>
      </div>

      {/* nb link */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb link</h3>
        <p>Link the current directory to an existing Nodebase project.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
          <span className="text-brand-saffron">$</span> nb link
        </div>
      </div>

      {/* nb env */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb env</h3>
        <p>Manage environment variables.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4 space-y-2">
          <div><span className="text-brand-saffron">$</span> nb env ls</div>
          <div><span className="text-brand-saffron">$</span> nb env add KEY=VALUE</div>
          <div><span className="text-brand-saffron">$</span> nb env rm KEY</div>
          <div><span className="text-brand-saffron">$</span> nb env pull .env.local</div>
        </div>
      </div>

      {/* nb logs */}
      <div className="mb-12">
        <h3 className="text-white font-mono text-xl border-b border-white/10 pb-2 mb-4">nb logs</h3>
        <p>Stream logs from your deployments.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
          <span className="text-brand-saffron">$</span> nb logs [deployment-id]
        </div>
      </div>

      <h2 className="text-white mt-12">Global Options</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-2 text-white">Flag</th>
            <th className="py-2 text-white">Description</th>
          </tr>
        </thead>
        <tbody className="text-sm text-zinc-400">
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">--debug</td>
            <td className="py-2">Enable debug output.</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">--token &lt;token&gt;</td>
            <td className="py-2">Use a specific API token instead of local login.</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono">--team &lt;slug&gt;</td>
            <td className="py-2">Run command context for a specific team.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
