import { Metadata } from "next";
import { Terminal, ChevronRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Quickstart - Nodebase Docs",
  description: "Get started with Nodebase in minutes.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Quickstart Guide</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        Deploy your first application to Nodebase Space in less than 5 minutes. This guide covers installation, authentication, and deployment.
      </p>

      <div className="space-y-12">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-saffron text-black font-bold text-lg">1</div>
            <h2 className="text-2xl font-bold text-white m-0">Install the CLI</h2>
          </div>
          <p>
            The Nodebase CLI (Command Line Interface) is the primary tool for managing your projects. Ensure you have Node.js 18 or later installed.
          </p>
          <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden mt-4">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-xs text-zinc-500 font-mono">Terminal</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm">
              <div className="flex gap-2 text-zinc-300">
                <span className="text-brand-saffron">$</span>
                <span>npm install -g nodebase-cli</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-saffron text-black font-bold text-lg">2</div>
            <h2 className="text-2xl font-bold text-white m-0">Authenticate</h2>
          </div>
          <p>
            Log in to your Nodebase account. If you don't have one, this command will prompt you to create one.
          </p>
          <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden mt-4">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-xs text-zinc-500 font-mono">Terminal</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-2">
              <div className="flex gap-2 text-zinc-300">
                <span className="text-brand-saffron">$</span>
                <span>nb login</span>
              </div>
              <div className="text-zinc-500">
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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-saffron text-black font-bold text-lg">3</div>
            <h2 className="text-2xl font-bold text-white m-0">Deploy Your Project</h2>
          </div>
          <p>
            Navigate to your project directory. Nodebase supports most modern frameworks (Next.js, React, Vue, Svelte, Astro) out of the box with zero configuration.
          </p>
          <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden mt-4">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-xs text-zinc-500 font-mono">Terminal</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-2">
              <div className="flex gap-2 text-zinc-300">
                <span className="text-brand-saffron">$</span>
                <span>cd my-awesome-project</span>
              </div>
              <div className="flex gap-2 text-zinc-300">
                <span className="text-brand-saffron">$</span>
                <span>nb deploy</span>
              </div>
              <div className="text-zinc-500 pt-2 border-t border-white/5 mt-2">
                &gt; Detecting project type... <span className="text-white">Next.js</span><br/>
                &gt; Building project...<br/>
                &gt; Uploading assets to <span className="text-brand-saffron">Okhla, Delhi (DC-DEL-01)</span>...<br/>
                &gt; optimizing images...<br/>
                <span className="text-green-400">&gt; Deployment Complete! 🚀</span><br/>
                &gt; <a href="#" className="text-white underline">https://my-awesome-project.nodebase.app</a>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 m-0">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs/space/cli" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 hover:border-brand-saffron/50 group no-underline">
              <span className="text-zinc-300 font-medium group-hover:text-white">CLI Reference</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-saffron" />
            </a>
            <a href="/docs/space" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 hover:border-brand-saffron/50 group no-underline">
              <span className="text-zinc-300 font-medium group-hover:text-white">Hosting Features</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-saffron" />
            </a>
            <a href="/docs/kaisa" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 hover:border-brand-saffron/50 group no-underline">
              <span className="text-zinc-300 font-medium group-hover:text-white">Explore kaisa AI</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-saffron" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
