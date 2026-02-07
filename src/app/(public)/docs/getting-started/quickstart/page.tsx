"use client";

import { Terminal, ChevronRight, CheckCircle2 } from "lucide-react";
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
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">Quickstart Guide</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/70 mb-8 font-light">
          Deploy your first application to Nodebase Space in less than 5 minutes. This guide covers installation, authentication, and deployment.
        </motion.p>

        <motion.div variants={fadeInUp} className="space-y-12">
          {/* Step 1 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-bone text-brand-deep-red font-bold text-lg">1</div>
              <h2 className="text-2xl font-bold text-brand-bone m-0 uppercase tracking-tight">Install the CLI</h2>
            </div>
            <p>
              The Nodebase CLI (Command Line Interface) is the primary tool for managing your projects. Ensure you have Node.js 18 or later installed.
            </p>
            <div className="bg-black/50 border border-brand-bone/10 rounded-xl overflow-hidden mt-4">
              <div className="flex items-center justify-between px-4 py-2 bg-brand-bone/5 border-b border-brand-bone/5">
                <span className="text-xs text-brand-bone/60 font-mono">Terminal</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="flex gap-2 text-brand-bone/80">
                  <span className="text-brand-bone">$</span>
                  <span>npm install -g nodebase-cli</span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-bone text-brand-deep-red font-bold text-lg">2</div>
              <h2 className="text-2xl font-bold text-brand-bone m-0 uppercase tracking-tight">Authenticate</h2>
            </div>
            <p>
              Log in to your Nodebase account. If you don't have one, this command will prompt you to create one.
            </p>
            <div className="bg-black/50 border border-brand-bone/10 rounded-xl overflow-hidden mt-4">
              <div className="px-4 py-2 bg-brand-bone/5 border-b border-brand-bone/5">
                <span className="text-xs text-brand-bone/60 font-mono">Terminal</span>
              </div>
              <div className="p-4 font-mono text-sm space-y-2">
                <div className="flex gap-2 text-brand-bone/80">
                  <span className="text-brand-bone">$</span>
                  <span>nb login</span>
                </div>
                <div className="text-brand-bone/60">
                  &gt; Opening browser for authentication...<br/>
                  &gt; Waiting for confirmation...<br/>
                  <span className="text-green-400">&gt; Success! Authenticated as developer@example.com</span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-bone text-brand-deep-red font-bold text-lg">3</div>
              <h2 className="text-2xl font-bold text-brand-bone m-0 uppercase tracking-tight">Deploy Your Project</h2>
            </div>
            <p>
              Navigate to your project directory. Nodebase supports most modern frameworks (Next.js, React, Vue, Svelte, Astro) out of the box with zero configuration.
            </p>
            <div className="bg-black/50 border border-brand-bone/10 rounded-xl overflow-hidden mt-4">
              <div className="px-4 py-2 bg-brand-bone/5 border-b border-brand-bone/5">
                <span className="text-xs text-brand-bone/60 font-mono">Terminal</span>
              </div>
              <div className="p-4 font-mono text-sm space-y-2">
                <div className="flex gap-2 text-brand-bone/80">
                  <span className="text-brand-bone">$</span>
                  <span>cd my-awesome-project</span>
                </div>
                <div className="flex gap-2 text-brand-bone/80">
                  <span className="text-brand-bone">$</span>
                  <span>nb deploy</span>
                </div>
                <div className="text-brand-bone/60 pt-2 border-t border-brand-bone/5 mt-2">
                  &gt; Detecting project type... <span className="text-brand-bone">Next.js</span><br/>
                  &gt; Building project...<br/>
                  &gt; Uploading assets to <span className="text-brand-bone">Okhla, Delhi (DC-DEL-01)</span>...<br/>
                  &gt; optimizing images...<br/>
                  <span className="text-green-400">&gt; Deployment Complete! 🚀</span><br/>
                  &gt; <a href="#" className="text-brand-bone underline">https://my-awesome-project.nodebase.app</a>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-brand-bone/5 rounded-2xl p-8 border border-brand-bone/10">
            <h2 className="text-xl font-bold text-brand-bone mb-4 m-0 uppercase tracking-tight">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/docs/space/cli" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-brand-bone/10 hover:border-brand-bone/30 group no-underline">
                <span className="text-brand-bone/80 font-medium group-hover:text-brand-bone">CLI Reference</span>
                <ChevronRight className="w-4 h-4 text-brand-bone/60 group-hover:text-brand-bone" />
              </a>
              <a href="/docs/space" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-brand-bone/10 hover:border-brand-bone/30 group no-underline">
                <span className="text-brand-bone/80 font-medium group-hover:text-brand-bone">Hosting Features</span>
                <ChevronRight className="w-4 h-4 text-brand-bone/60 group-hover:text-brand-bone" />
              </a>
              <a href="/docs/kaisa" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-brand-bone/10 hover:border-brand-bone/30 group no-underline">
                <span className="text-brand-bone/80 font-medium group-hover:text-brand-bone">Explore kaisa AI</span>
                <ChevronRight className="w-4 h-4 text-brand-bone/60 group-hover:text-brand-bone" />
              </a>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}
