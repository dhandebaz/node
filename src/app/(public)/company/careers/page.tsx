"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Briefcase, Code2, Server, BrainCircuit, ArrowRight } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-saffron/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <PageHeader 
        title="Join the Mission" 
        description="We are looking for engineers, researchers, and builders who want to shape India's digital future."
        tag="Careers"
      >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-saffron)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="glass-card p-8 rounded-2xl border-l-4 border-white hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">Senior Frontend Engineer</h3>
                  <p className="text-white/60 text-sm mt-1">Engineering • Delhi • Remote Hybrid</p>
                </div>
                <Code2 className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-white/70 mb-6">
                Build the next generation of cloud interfaces. Work with React, Next.js, and WebGL to create immersive, high-performance dashboards for our users.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border-l-4 border-brand-saffron hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">AI Research Scientist</h3>
                  <p className="text-white/60 text-sm mt-1">Research • Delhi • On-site</p>
                </div>
                <BrainCircuit className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-white/70 mb-6">
                Advance the state of Indic LLMs. Work on fine-tuning, tokenization strategies for Indian languages, and optimizing inference on H100 clusters.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border-l-4 border-brand-green hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">Infrastructure Operations Lead</h3>
                  <p className="text-white/60 text-sm mt-1">Ops • Delhi • On-site</p>
                </div>
                <Server className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-white/70 mb-6">
                Manage our physical data center footprint. Oversee server deployment, network architecture, and ensure 99.99% uptime for our sovereign cloud.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
