"use client";

import { motion } from "framer-motion";
import { Server, Shield, Zap, Globe, Cpu, Database, ArrowRight, TrendingUp, Leaf, Network } from "lucide-react";
import { OpticalFiberAnimation } from "@/components/node/OpticalFiberAnimation";
import Link from "next/link";

export default function InfrastructurePage() {
  const specs = [
    {
      icon: Server,
      title: "Data Center (Delhi)",
      details: [
        "Tier-IV certified facility (Okhla)",
        "Current Active Nodes: 6",
        "Total Facility Capacity: 160 Nodes",
        "24/7 physical security & biometric access"
      ]
    },
    {
      icon: Cpu,
      title: "Compute",
      details: [
        "NVIDIA H100 & A100 Tensor Core GPUs",
        "AMD EPYC™ 9004 Series Processors",
        "High-density rack configurations",
        "Liquid cooling ready infrastructure"
      ]
    },
    {
      icon: Database,
      title: "Storage",
      details: [
        "All-NVMe storage arrays",
        "Triple-redundant replication",
        "Object storage compatible (S3)",
        "Immutable backup snapshots"
      ]
    },
    {
      icon: Globe,
      title: "Network",
      details: [
        "100 Gbps core network backbone",
        "Direct peering with major ISPs",
        "DDoS mitigation at edge",
        "Low-latency North India routing"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-saffron/10 text-brand-saffron text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-saffron opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-saffron"></span>
            </span>
            Operational: Okhla, Delhi
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
          >
            Sovereign Infrastructure <br/>
            <span className="text-white/40">Built for India.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60 max-w-3xl leading-relaxed"
          >
            We don't rely on foreign cloud providers. Nodebase builds, owns, and manages its own hardware stack. 
            Currently operating from our primary facility in Okhla, Delhi, ensuring full data sovereignty and focused operational efficiency.
          </motion.p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Our Philosophy</h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p>
                  <strong>Hardware Ownership:</strong> Renting cloud credits is a liability. Owning silicon is an asset. We prioritize CAPEX on tangible hardware over OPEX on rented services.
                </p>
                <p>
                  <strong>Data Residency:</strong> Indian data should stay in India. Our infrastructure complies with the DPDP Act 2023 by design, ensuring critical business data never crosses borders.
                </p>
                <p>
                  <strong>Vertical Integration:</strong> By controlling the stack from the server rack to the API endpoint, we can optimize performance for our specific AI workloads (kaisa) better than generic cloud providers.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-bold text-brand-saffron mb-2">99.9%</span>
                  <span className="text-sm text-white/50">Uptime SLA</span>
               </div>
               <div className="bg-black p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-bold text-brand-saffron mb-2">160</span>
                  <span className="text-sm text-white/50">Node Capacity (Delhi)</span>
               </div>
               <div className="bg-black p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-bold text-brand-saffron mb-2">100%</span>
                  <span className="text-sm text-white/50">Data Residency</span>
               </div>
               <div className="bg-black p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-bold text-brand-saffron mb-2">24/7</span>
                  <span className="text-sm text-white/50">NOC Monitoring</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
           <h2 className="text-3xl font-bold text-white mb-16 text-center">Technical Specifications</h2>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {specs.map((spec, i) => (
               <div key={i} className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-colors">
                 <spec.icon className="w-10 h-10 text-white/80 mb-6" />
                 <h3 className="text-xl font-bold text-white mb-6">{spec.title}</h3>
                 <ul className="space-y-3">
                   {spec.details.map((detail, j) => (
                     <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                       <span className="w-1.5 h-1.5 rounded-full bg-brand-saffron mt-1.5 shrink-0"></span>
                       {detail}
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Expansion Strategy */}
      <section className="py-24 bg-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
           <div className="flex items-start gap-6 mb-12">
             <div className="p-3 bg-brand-saffron/10 rounded-xl text-brand-saffron">
               <TrendingUp className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-white mb-4">Infrastructure Expansion Strategy</h2>
               <p className="text-xl text-white/60 leading-relaxed max-w-3xl">
                 Nodebase follows a strictly sequential expansion model. We prioritize fully utilizing our Okhla facility before committing to new geographies.
               </p>
             </div>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black p-8 rounded-2xl border border-white/10 border-l-4 border-l-brand-saffron">
                <div className="mb-4 text-xs font-bold text-brand-saffron uppercase tracking-wider">Phase 1 (Current)</div>
                <h3 className="text-lg font-bold text-white mb-3">Maximize Okhla</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Focus on deploying up to 160 Nodes at our Delhi facility. This centralization ensures operational stability, lower overhead, and faster deployment cycles.
                </p>
              </div>
              <div className="bg-black p-8 rounded-2xl border border-white/10 opacity-60">
                <div className="mb-4 text-xs font-bold text-white/40 uppercase tracking-wider">Phase 2</div>
                <h3 className="text-lg font-bold text-white mb-3">Demand-Driven Expansion</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Identify the next strategic location based on verified demand, latency needs, and power availability. We build the next facility fully before moving further.
                </p>
              </div>
              <div className="bg-black p-8 rounded-2xl border border-white/10 opacity-60">
                <div className="mb-4 text-xs font-bold text-white/40 uppercase tracking-wider">Phase 3 (Future)</div>
                <h3 className="text-lg font-bold text-white mb-3">Geographic Distribution</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Establish multi-region availability zones with internal high-speed interconnects, reducing dependency on public internet routes.
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* Future Connectivity (Phase 3) */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
           <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
                 <Network className="w-3 h-3" />
                 <span>Future Architecture (Phase 3)</span>
               </div>
               <h2 className="text-3xl font-bold text-white mb-6">Internal Optical Backbone</h2>
               <p className="text-lg text-white/60 leading-relaxed mb-6">
                 As we expand beyond a single site, our roadmap includes deploying a private, high-bandwidth optical fiber network to connect our data centers directly.
               </p>
               <ul className="space-y-4 text-white/70">
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   Direct DC-to-DC connectivity (bypassing public internet)
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   Secure, low-latency internal traffic
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   Underground optical fiber links for maximum reliability
                 </li>
               </ul>
             </div>
             <div className="flex-1 w-full">
               <OpticalFiberAnimation />
               <p className="text-white/40 text-sm italic text-center mt-4">
                 "This internal connectivity layer is a future-state goal designed to activate once we have established multiple operational facilities."
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* Environmental Responsibility */}
      <section className="py-24 border-t border-white/5 bg-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
           <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium mb-6">
                 <Leaf className="w-3 h-3" />
                 <span>Responsible Operation</span>
               </div>
               <h2 className="text-3xl font-bold text-white mb-6">Efficiency First</h2>
               <p className="text-lg text-white/60 leading-relaxed mb-6">
                 Our current single-site focus allows for rigorous optimization of power and cooling. We don't greenwash—we optimize.
               </p>
               <ul className="space-y-4 text-white/70">
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-saffron" />
                   <strong>Current:</strong> Centralized setup reduces redundancy waste.
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-saffron" />
                   <strong>Current:</strong> Titanium-rated power supplies for max efficiency.
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-saffron" />
                   <strong>Future:</strong> Distributed thermal balancing across regions.
                 </li>
               </ul>
             </div>
             <div className="flex-1 w-full">
               <div className="bg-black border border-white/10 p-8 rounded-2xl">
                 <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Our Stance</h3>
                 <p className="text-white/80 leading-relaxed italic border-l-2 border-brand-saffron pl-4">
                   "We acknowledge the environmental impact of AI infrastructure. While we do not claim 'net zero' today, we are committed to measuring our footprint and optimizing every watt of power used for productive compute."
                 </p>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to participate?</h2>
          <Link href="/node/nodes" className="px-8 py-4 bg-brand-saffron text-black rounded-full font-bold hover:bg-brand-saffron/90 transition-all inline-flex items-center gap-2">
            View Node Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-white/30 mt-4">Participation limited to Okhla facility capacity.</p>
        </div>
      </section>
    </div>
  );
}