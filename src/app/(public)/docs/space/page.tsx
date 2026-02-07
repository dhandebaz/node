"use client";

import { Cloud, Server, Database, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SpaceDocsPage() {
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
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center text-brand-bone">
             <Cloud className="w-6 h-6" />
          </div>
          <h1 className="m-0 text-brand-bone uppercase tracking-tighter">Nodebase Space</h1>
        </motion.div>
        
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60">
          Space is our sovereign cloud platform, providing the fundamental primitives for building modern applications: Compute, Storage, and Networking. All data is strictly resident in India.
        </motion.p>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">The Space Stack</motion.h2>
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
          <div className="p-6 rounded-2xl glass-card border border-brand-bone/5 bg-brand-bone/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone">App Platform</h3>
            </div>
            <p className="text-sm text-brand-bone/60 mb-4">
              Zero-config deployment for frontend frameworks and Node.js APIs. Just push code.
            </p>
            <ul className="text-sm text-brand-bone/50 list-disc list-inside">
              <li>Next.js, React, Vue, Svelte</li>
              <li>Automatic SSL</li>
              <li>Instant Rollbacks</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-brand-bone/5 bg-brand-bone/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone">Object Storage</h3>
            </div>
            <p className="text-sm text-brand-bone/60 mb-4">
              S3-compatible storage for assets, backups, and user uploads.
            </p>
            <Link href="/docs/space/storage" className="text-brand-saffron text-sm hover:underline">View Documentation &rarr;</Link>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-brand-bone/5 bg-brand-bone/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-500">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone">Edge CDN</h3>
            </div>
            <p className="text-sm text-brand-bone/60 mb-4">
              Content delivery network optimized for Indian geography.
            </p>
            <Link href="/docs/space/cdn" className="text-brand-saffron text-sm hover:underline">View Documentation &rarr;</Link>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Regions</motion.h2>
        <motion.p variants={fadeInUp}>
          Nodebase Space is currently available in the following zones:
        </motion.p>
        <motion.div variants={fadeInUp} className="not-prose overflow-hidden rounded-lg border border-brand-bone/10">
          <table className="w-full text-left border-collapse bg-brand-bone/5">
            <thead>
              <tr className="border-b border-brand-bone/10 text-brand-bone/50 text-sm">
                <th className="py-3 px-4 uppercase tracking-wider">Region ID</th>
                <th className="py-3 px-4 uppercase tracking-wider">Location</th>
                <th className="py-3 px-4 uppercase tracking-wider">Services</th>
              </tr>
            </thead>
            <tbody className="text-brand-bone/80">
              <tr className="border-b border-brand-bone/5 hover:bg-brand-bone/5 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-saffron">ind-del-1</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-brand-bone">New Delhi (HQ)</div>
                  <div className="text-xs text-brand-bone/50">Okhla Industrial Estate</div>
                </td>
                <td className="py-3 px-4">Compute, Storage, GPU, Edge</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Data Sovereignty</motion.h2>
        <motion.p variants={fadeInUp}>
          Unlike international cloud providers, Nodebase guarantees that your data never leaves Indian borders.
        </motion.p>
        <motion.ul variants={fadeInUp}>
          <li><strong>Compliance:</strong> Ready for DPDP Act 2023.</li>
          <li><strong>Latency:</strong> Optimized for users within the subcontinent.</li>
          <li><strong>Jurisdiction:</strong> Legal contracts under Indian law.</li>
        </motion.ul>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Getting Started</motion.h2>
        <motion.p variants={fadeInUp}>
          The best way to interact with Space is via our CLI.
        </motion.p>
        <motion.div variants={fadeInUp} className="bg-black/40 border border-brand-bone/10 rounded-xl p-4 my-6 font-mono text-sm backdrop-blur-sm">
          <div className="text-green-400">
            $ npm install -g nodebase-cli
          </div>
        </motion.div>
        <motion.p variants={fadeInUp}>
          See the <Link href="/docs/space/cli" className="text-brand-saffron hover:underline">CLI Reference</Link> for more commands.
        </motion.p>
      </motion.div>
    </div>
  );
}
