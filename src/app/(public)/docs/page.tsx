"use client";

import { ArrowRight, Book, Rocket, Code2, Server } from "lucide-react";
import Link from "next/link";

export default function DocsIndexPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-white">Documentation</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          Welcome to the Nodebase developer hub. Learn how to build, deploy, and scale your applications on India's first sovereign cloud.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/docs/getting-started" className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-colors group">
          <div className="w-10 h-10 bg-brand-saffron/10 rounded-lg flex items-center justify-center mb-4 text-brand-saffron">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-brand-saffron transition-colors">Quickstart Guide</h3>
          <p className="text-sm text-white/60 mb-4">Deploy your first application in less than 5 minutes.</p>
          <div className="flex items-center text-xs font-bold text-white/40 group-hover:text-white transition-colors">
            Start Building <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Link>

        <Link href="/docs/space/cli" className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-colors group">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4 text-brand-blue">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-brand-blue transition-colors">CLI Reference</h3>
          <p className="text-sm text-white/60 mb-4">Master the `nb` command line tool for deployment and management.</p>
          <div className="flex items-center text-xs font-bold text-white/40 group-hover:text-white transition-colors">
            View Commands <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Link>
      </div>

      <hr className="border-white/10" />

      {/* Sections */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Explore by Product</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="mb-4">
                <Code2 className="w-8 h-8 text-brand-saffron" />
              </div>
              <h3 className="font-bold mb-2">kaisa AI</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/docs/kaisa" className="hover:text-brand-saffron transition-colors">Agent Overview</Link></li>
                <li><Link href="/docs/kaisa/agents-api" className="hover:text-brand-saffron transition-colors">API Reference</Link></li>
                <li><Link href="/docs/kaisa/integrations" className="hover:text-brand-saffron transition-colors">WhatsApp Integration</Link></li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="mb-4">
                <Server className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="font-bold mb-2">Nodebase Space</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/docs/space" className="hover:text-brand-blue transition-colors">Hosting Basics</Link></li>
                <li><Link href="/docs/space/storage" className="hover:text-brand-blue transition-colors">Object Storage (S3)</Link></li>
                <li><Link href="/docs/space/cdn" className="hover:text-brand-blue transition-colors">CDN Configuration</Link></li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="mb-4">
                <Server className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="font-bold mb-2">Infrastructure</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/docs/infrastructure" className="hover:text-brand-green transition-colors">Node Participation</Link></li>
                <li><Link href="/docs/infrastructure/h100" className="hover:text-brand-green transition-colors">H100 Access</Link></li>
                <li><Link href="/docs/infrastructure/security" className="hover:text-brand-green transition-colors">Physical Security</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
