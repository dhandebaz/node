"use client";

import { Cloud, Server, Database, Globe } from "lucide-react";
import Link from "next/link";

export default function SpaceDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
           <Cloud className="w-6 h-6" />
        </div>
        <h1 className="m-0 text-white">Nodebase Space</h1>
      </div>
      
      <p className="lead text-xl text-zinc-400">
        Space is our sovereign cloud platform, providing the fundamental primitives for building modern applications: Compute, Storage, and Networking. All data is strictly resident in India.
      </p>

      <h2 className="text-white mt-12">The Space Stack</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        <div className="p-6 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">App Platform</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Zero-config deployment for frontend frameworks and Node.js APIs. Just push code.
          </p>
          <ul className="text-sm text-zinc-500 list-disc list-inside">
            <li>Next.js, React, Vue, Svelte</li>
            <li>Automatic SSL</li>
            <li>Instant Rollbacks</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Object Storage</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            S3-compatible storage for assets, backups, and user uploads.
          </p>
          <Link href="/docs/space/storage" className="text-brand-saffron text-sm hover:underline">View Documentation &rarr;</Link>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-500">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Edge CDN</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Content delivery network optimized for Indian geography.
          </p>
          <Link href="/docs/space/cdn" className="text-brand-saffron text-sm hover:underline">View Documentation &rarr;</Link>
        </div>
      </div>

      <h2 className="text-white mt-12">Regions</h2>
      <p>
        Nodebase Space is currently available in the following zones:
      </p>
      <div className="not-prose overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-left border-collapse bg-zinc-900/50">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-sm">
              <th className="py-3 px-4">Region ID</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Services</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3 px-4 font-mono text-brand-saffron">ind-del-1</td>
              <td className="py-3 px-4">
                <div className="font-bold">New Delhi (HQ)</div>
                <div className="text-xs text-zinc-500">Okhla Industrial Estate</div>
              </td>
              <td className="py-3 px-4">Compute, Storage, GPU, Edge</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-white mt-12">Data Sovereignty</h2>
      <p>
        Unlike international cloud providers, Nodebase guarantees that your data never leaves Indian borders.
      </p>
      <ul>
        <li><strong>Compliance:</strong> Ready for DPDP Act 2023.</li>
        <li><strong>Latency:</strong> Optimized for users within the subcontinent.</li>
        <li><strong>Jurisdiction:</strong> Legal contracts under Indian law.</li>
      </ul>

      <h2 className="text-white mt-12">Getting Started</h2>
      <p>
        The best way to interact with Space is via our CLI.
      </p>
      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm">
        <div className="text-green-400">
          $ npm install -g nodebase-cli
        </div>
      </div>
      <p>
        See the <Link href="/docs/space/cli" className="text-brand-saffron hover:underline">CLI Reference</Link> for more commands.
      </p>
    </div>
  );
}
