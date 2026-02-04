"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Handshake, Building2, Code2, Cpu } from "lucide-react";

export default function PartnersPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <PageHeader 
        title="Partner Ecosystem" 
        description="Collaborate with Nodebase to build sovereign solutions for India."
        tag="Partners"
      >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-green)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <div className="glass-card p-8 rounded-2xl text-center hover:bg-white/5 transition-colors">
              <div className="w-16 h-16 mx-auto bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 text-brand-blue">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">System Integrators</h3>
              <p className="text-white/60 mb-6">
                Deploy private kaisa AI instances for your enterprise clients.
              </p>
              <button className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Become an SI Partner
              </button>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover:bg-white/5 transition-colors">
              <div className="w-16 h-16 mx-auto bg-brand-saffron/10 rounded-2xl flex items-center justify-center mb-6 text-brand-saffron">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Technology Partners</h3>
              <p className="text-white/60 mb-6">
                Integrate your SaaS tools with the Nodebase ecosystem.
              </p>
              <button className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Build Integration
              </button>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover:bg-white/5 transition-colors">
              <div className="w-16 h-16 mx-auto bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 text-brand-green">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Hardware OEMs</h3>
              <p className="text-white/60 mb-6">
                Certify your hardware for the Nodebase physical network.
              </p>
              <button className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Certify Hardware
              </button>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto glass-dark rounded-3xl p-12 text-center">
             <h2 className="text-3xl font-bold mb-6">Ready to partner?</h2>
             <p className="text-xl text-white/60 mb-8">
               Contact our partnerships team to explore collaboration opportunities.
             </p>
             <a href="mailto:partners@nodebase.in" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
               <Handshake className="w-5 h-5" />
               Contact Partnerships
             </a>
          </div>

        </div>
      </section>
    </div>
  );
}
