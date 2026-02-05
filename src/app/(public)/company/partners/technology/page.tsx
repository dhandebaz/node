import { PageHeader } from "@/components/ui/PageHeader";
import { Plug, ArrowRight, Database, LayoutGrid, Code2 } from "lucide-react";
import Link from "next/link";

export default function TechnologyPartnersPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-saffron/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <PageHeader 
        title="Technology Partners" 
        description="Integrate your software with Nodebase and reach thousands of Indian businesses."
        tag="Partner Program"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-saffron)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h2 className="text-3xl font-bold mb-6">Build for the Sovereign Cloud</h2>
            <p className="text-xl text-white/70">
              Join our ecosystem of ISVs, SaaS providers, and developer tools. 
              Nodebase provides the APIs and marketplace distribution you need to grow in the Indian market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="w-14 h-14 bg-brand-saffron/10 rounded-xl flex items-center justify-center mb-6 text-brand-saffron group-hover:scale-110 transition-transform">
                <Plug className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">API Integrations</h3>
              <p className="text-white/60">
                Connect your platform with Kaisa AI agents and Space infrastructure. 
                Enable seamless workflows for mutual customers.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Marketplace Listing</h3>
              <p className="text-white/60">
                Publish your application to the Nodebase Marketplace. 
                Get discovered by enterprises looking for sovereign-compliant tools.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="w-14 h-14 bg-brand-green/10 rounded-xl flex items-center justify-center mb-6 text-brand-green group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Data Solutions</h3>
              <p className="text-white/60">
                Offer specialized databases, analytics, or storage solutions 
                optimized for our NVMe-native infrastructure.
              </p>
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-12 text-center max-w-4xl mx-auto border border-white/10">
            <div className="flex flex-col items-center">
              <Code2 className="w-12 h-12 text-white/40 mb-6" />
              <h2 className="text-3xl font-bold mb-6">Developer First</h2>
              <p className="text-xl text-white/60 mb-8 max-w-2xl">
                We provide comprehensive SDKs, webhooks, and sandbox environments 
                to make integration a breeze.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="mailto:partners@nodebase.in?subject=Technology%20Partnership" 
                  className="px-8 py-4 bg-brand-saffron text-white font-bold rounded-xl hover:bg-brand-saffron/90 transition-colors flex items-center justify-center gap-2">
                  Build Integration <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/docs/kaisa/integrations" 
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                  View API Docs
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
