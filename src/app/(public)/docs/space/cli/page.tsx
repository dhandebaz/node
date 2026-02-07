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
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">CLI Reference</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60 mb-8">
          The <code>nb</code> command-line interface is your primary tool for managing Nodebase resources.
        </motion.p>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Core Commands</motion.h2>

        {/* nb login */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb login</h3>
          <p>Authenticate with your Nodebase account.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 border border-brand-bone/5 backdrop-blur-sm">
            <span className="text-brand-saffron">$</span> nb login
          </div>
          <p className="text-sm text-brand-bone/50">Opens a browser window to complete authentication via GitHub, Google, or Email.</p>
        </motion.div>

        {/* nb init */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb init</h3>
          <p>Initialize a new project in the current directory.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 border border-brand-bone/5 backdrop-blur-sm">
            <span className="text-brand-saffron">$</span> nb init
          </div>
          <p className="text-sm text-brand-bone/50">Creates a <code>nodebase.json</code> configuration file.</p>
        </motion.div>

        {/* nb deploy */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb deploy</h3>
          <p>Deploy the current project to Space.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 border border-brand-bone/5 backdrop-blur-sm">
            <span className="text-brand-saffron">$</span> nb deploy [path] [--prod]
          </div>
          <ul className="text-sm text-brand-bone/50">
            <li><code>path</code>: Optional path to project (default: current directory)</li>
            <li><code>--prod</code>: Deploy to production environment (default: preview)</li>
          </ul>
        </motion.div>

        {/* nb link */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb link</h3>
          <p>Link the current directory to an existing Nodebase project.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 border border-brand-bone/5 backdrop-blur-sm">
            <span className="text-brand-saffron">$</span> nb link
          </div>
        </motion.div>

        {/* nb env */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb env</h3>
          <p>Manage environment variables.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 space-y-2 border border-brand-bone/5 backdrop-blur-sm">
            <div><span className="text-brand-saffron">$</span> nb env ls</div>
            <div><span className="text-brand-saffron">$</span> nb env add KEY=VALUE</div>
            <div><span className="text-brand-saffron">$</span> nb env rm KEY</div>
            <div><span className="text-brand-saffron">$</span> nb env pull .env.local</div>
          </div>
        </motion.div>

        {/* nb logs */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-brand-bone font-mono text-xl mb-4">nb logs</h3>
          <p>Stream logs from your deployments.</p>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-sm mb-4 border border-brand-bone/5 backdrop-blur-sm">
            <span className="text-brand-saffron">$</span> nb logs [deployment-id]
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Global Options</motion.h2>
        <motion.table variants={fadeInUp} className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-bone/10">
              <th className="py-2 text-brand-bone uppercase text-xs tracking-wider">Flag</th>
              <th className="py-2 text-brand-bone uppercase text-xs tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="text-sm text-brand-bone/60">
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">--debug</td>
              <td className="py-2">Enable debug output.</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">--token &lt;token&gt;</td>
              <td className="py-2">Use a specific API token instead of local login.</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-mono text-brand-saffron/80">--team &lt;slug&gt;</td>
              <td className="py-2">Run command context for a specific team.</td>
            </tr>
          </tbody>
        </motion.table>
      </motion.div>
    </div>
  );
}
