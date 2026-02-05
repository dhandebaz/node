import { PageHeader } from "@/components/ui/PageHeader";
import { CheckCircle2, ArrowRight, Building2, Users, Trophy } from "lucide-react";
import Link from "next/link";

export default function SystemIntegratorsPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-saffron/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <PageHeader 
        title="System Integrators" 
        description="Empower your enterprise clients with sovereign AI and cloud infrastructure."
        tag="Partner Program"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Partner with Nodebase?</h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                As a System Integrator, you are the trusted advisor to your clients. By partnering with Nodebase, 
                you can offer them the only sovereign cloud stack in India that is fully compliant with the DPDP Act 2023.
                Unlock new revenue streams by deploying kaisa AI agents and managing private cloud infrastructure.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Recurring revenue share on all managed compute",
                  "Priority access to H100 GPU clusters",
                  "Dedicated solution architect support",
                  "White-label kaisa AI capabilities"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="glass-card p-6 rounded-2xl border-l-4 border-white">
                <Users className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold mb-2">Consulting Services</h3>
                <p className="text-white/60">
                  Help clients migrate legacy workloads to a modern, sovereign cloud architecture.
                </p>
              </div>
              <div className="glass-card p-6 rounded-2xl border-l-4 border-brand-saffron">
                <Trophy className="w-8 h-8 text-brand-saffron mb-4" />
                <h3 className="text-xl font-bold mb-2">Implementation</h3>
                <p className="text-white/60">
                  Deploy and configure kaisa AI agents for customer support, sales, and operations.
                </p>
              </div>
              <div className="glass-card p-6 rounded-2xl border-l-4 border-brand-green">
                <Building2 className="w-8 h-8 text-brand-green mb-4" />
                <h3 className="text-xl font-bold mb-2">Managed Services</h3>
                <p className="text-white/60">
                  Provide 24/7 monitoring and management of client infrastructure on Nodebase.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Start Your Journey</h2>
            <p className="text-xl text-white/60 mb-8">
              Join the network of elite integrators shaping India's digital future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:partners@nodebase.in?subject=SI%20Partnership%20Application" 
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                Apply as Partner <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/docs/kaisa" 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Explore Solutions
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
