import { PageHeader } from "@/components/ui/PageHeader";
import { Server, Cpu, ShieldCheck, ArrowRight, HardDrive } from "lucide-react";
import Link from "next/link";

export default function HardwarePartnersPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <PageHeader 
        title="Hardware Certification" 
        description="Validate your servers and components for the Nodebase sovereign cloud."
        tag="Partner Program"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-green)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold mb-6 text-center">Powering the Next-Gen Cloud</h2>
            <p className="text-xl text-white/70 text-center mb-12">
              Nodebase runs on bare metal. We partner with leading OEMs to certify 
              high-performance computing hardware, storage arrays, and networking equipment 
              for our data centers in India.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                 <Server className="w-8 h-8 text-brand-green shrink-0" />
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Server Platforms</h3>
                   <p className="text-zinc-400 text-sm">
                     x86 and ARM-based rack servers optimized for density and thermal efficiency.
                   </p>
                 </div>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                 <Cpu className="w-8 h-8 text-brand-green shrink-0" />
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Accelerators</h3>
                   <p className="text-zinc-400 text-sm">
                     GPUs, TPUs, and FPGAs for AI training and inference workloads.
                   </p>
                 </div>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                 <HardDrive className="w-8 h-8 text-brand-green shrink-0" />
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Storage Components</h3>
                   <p className="text-zinc-400 text-sm">
                     Enterprise-grade NVMe SSDs and high-capacity HDDs for object storage.
                   </p>
                 </div>
               </div>
               <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                 <ShieldCheck className="w-8 h-8 text-brand-green shrink-0" />
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Security Modules</h3>
                   <p className="text-zinc-400 text-sm">
                     HSMs and TPMs ensuring root-of-trust and encryption compliance.
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-12 text-center max-w-4xl mx-auto border-l-4 border-brand-green">
            <h2 className="text-3xl font-bold mb-6">Certification Process</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
              <div>
                <div className="text-brand-green font-mono text-xl mb-2">01</div>
                <h4 className="font-bold text-white mb-2">Submission</h4>
                <p className="text-sm text-white/60">Submit hardware specs and samples to our Okhla lab.</p>
              </div>
              <div>
                <div className="text-brand-green font-mono text-xl mb-2">02</div>
                <h4 className="font-bold text-white mb-2">Validation</h4>
                <p className="text-sm text-white/60">We run automated stress tests and kernel compatibility checks.</p>
              </div>
              <div>
                <div className="text-brand-green font-mono text-xl mb-2">03</div>
                <h4 className="font-bold text-white mb-2">Listing</h4>
                <p className="text-sm text-white/60">Certified hardware is listed on our HCL and procurement portal.</p>
              </div>
            </div>

            <Link href="mailto:partners@nodebase.in?subject=Hardware%20Certification" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-black font-bold rounded-xl hover:bg-brand-green/90 transition-colors">
              Certify Hardware <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
