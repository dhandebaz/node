"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Rocket, 
  Code2, 
  Server, 
  Cpu, 
  Shield, 
  Terminal,
  Book,
  Globe,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function DocsIndexPage() {
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
    <motion.div 
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.div variants={fadeInUp} className="border-b border-brand-bone/10 pb-12">
        <div className="inline-flex items-center gap-2 border border-brand-bone/20 px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/80 rounded-full">
          <Terminal className="w-3 h-3" />
          <span>Developer Hub v2.0</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-brand-bone uppercase tracking-tighter leading-[0.9]">
          Build on<br/>Sovereign Ground.
        </h1>
        <p className="text-xl text-brand-bone/70 leading-relaxed font-light max-w-2xl">
          Complete documentation for the Nodebase ecosystem. 
          Deploy AI agents, manage bare metal nodes, and scale sovereign applications.
        </p>
      </motion.div>

      {/* Quick Start Grid */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-bone/40 mb-6">Start Here</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/docs/getting-started/quickstart" className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-all group">
            <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 text-brand-bone group-hover:scale-110 transition-transform">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-brand-bone uppercase tracking-tight">Quickstart Guide</h3>
            <p className="text-brand-bone/60 mb-6 leading-relaxed">
              Deploy your first kaisa AI agent or static site in under 5 minutes using the CLI.
            </p>
            <div className="flex items-center text-sm font-bold text-brand-bone/60 group-hover:text-brand-bone transition-colors uppercase tracking-wider">
              Start Building <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/docs/space/cli" className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-all group">
            <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 text-brand-bone group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-brand-bone uppercase tracking-tight">CLI Reference</h3>
            <p className="text-brand-bone/60 mb-6 leading-relaxed">
              Master the <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs border border-brand-bone/20">nb</code> command line tool. Authenticate, deploy, and monitor resources.
            </p>
            <div className="flex items-center text-sm font-bold text-brand-bone/60 group-hover:text-brand-bone transition-colors uppercase tracking-wider">
              View Commands <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Product Documentation */}
      <motion.div variants={fadeInUp} className="space-y-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-bone/40 border-t border-brand-bone/10 pt-8">Products & APIs</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* kaisa AI */}
          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 bg-brand-bone/10 rounded-lg">
                <Code2 className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-lg font-bold text-brand-bone uppercase tracking-tight">kaisa AI</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/kaisa/agents-api" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Agents API</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/kaisa/integrations" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Integrations (WhatsApp)</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/kaisa/memory" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Memory & Context</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Nodebase Space */}
          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 bg-brand-bone/10 rounded-lg">
                <Server className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-lg font-bold text-brand-bone uppercase tracking-tight">Space</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/space/compute" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Compute Instances</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/space/storage" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Object Storage (S3)</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/space/cdn" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Global CDN</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 bg-brand-bone/10 rounded-lg">
                <Cpu className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-lg font-bold text-brand-bone uppercase tracking-tight">Nodes</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/infrastructure/participation" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Participation Guide</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/infrastructure/h100" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>H100 Specs</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/docs/infrastructure/security" className="group flex items-center justify-between text-sm text-brand-bone/70 hover:text-brand-bone transition-colors">
                  <span>Physical Security</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Developer Resources */}
      <motion.div variants={fadeInUp}>
        <div className="p-8 rounded-2xl border border-brand-bone/10 bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold text-brand-bone uppercase tracking-tight mb-2">Need Support?</h3>
              <p className="text-brand-bone/60">
                Join our Discord community or contact our engineering support team for complex implementations.
              </p>
            </div>
            <div className="flex gap-4">
               <a href="#" className="px-6 py-3 rounded-xl bg-brand-bone/10 hover:bg-brand-bone hover:text-brand-deep-red transition-colors font-bold text-sm uppercase tracking-wider text-brand-bone">
                 Join Discord
               </a>
               <a href="#" className="px-6 py-3 rounded-xl border border-brand-bone/20 hover:bg-brand-bone/10 transition-colors font-bold text-sm uppercase tracking-wider text-brand-bone">
                 Contact Support
               </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}