"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Server, Cloud, Shield, Zap } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { LightsaberSlider } from "@/components/ui/LightsaberSlider";

export default function SpacePage() {
  const [sliderValue, setSliderValue] = useState(50);

  // Mock pricing logic based on slider
  const getPricing = (val: number) => {
    // Map 0-100 to plans
    if (val < 33) return { 
      plan: "Shared Hosting", 
      price: "₹199", 
      specs: "2 vCPU • 4GB RAM • 50GB NVMe",
      desc: "Perfect for personal sites and blogs."
    };
    if (val < 66) return { 
      plan: "VPS Starter", 
      price: "₹899", 
      specs: "4 vCPU • 8GB RAM • 100GB NVMe",
      desc: "For growing businesses and apps."
    };
    return { 
      plan: "Dedicated Instance", 
      price: "₹2,499", 
      specs: "8 vCPU • 32GB RAM • 500GB NVMe",
      desc: "Maximum performance and isolation."
    };
  };

  const currentPlan = getPricing(sliderValue);

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone selection:text-brand-deep-red relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <NetworkBackground />
      </div>
      
      {/* HERO SECTION */}
      <section className="relative min-h-auto md:min-h-[80vh] flex flex-col justify-center items-center pt-32 md:pt-24 pb-16 px-6 overflow-hidden border-b border-brand-bone/20 z-10">
        
        <div className="container mx-auto relative z-10 max-w-6xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="inline-block border border-brand-bone px-4 py-1.5 mb-8 text-sm font-bold uppercase tracking-widest bg-brand-deep-red">
              Sovereign Cloud
            </div>

            <h1 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8">
              Migrate to<br />India.
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl font-light leading-relaxed text-brand-bone/80">
              Data sovereignty is not optional. Host your infrastructure on Indian soil. 
              Low latency, high compliance, and rupee-based pricing.
            </p>

            <Link 
              href="/login?deploy=space" 
              className="px-8 py-4 bg-brand-bone text-brand-deep-red font-bold uppercase tracking-wide hover:bg-white transition-colors flex items-center gap-2"
            >
              Deploy Now <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-16 md:py-24 px-6 border-b border-brand-bone/20 bg-brand-deep-red/90 backdrop-blur-sm z-10 relative">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-display-large uppercase leading-none mb-16 text-center">
            Simple Pricing
          </h2>

          <div className="bg-brand-deep-red border border-brand-bone/20 p-8 md:p-12 rounded-none relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              
              <h3 className="text-4xl font-bold uppercase mb-2">{currentPlan.plan}</h3>
              <div className="text-6xl font-bold mb-4">{currentPlan.price}<span className="text-2xl opacity-60 font-normal">/mo</span></div>
              <p className="text-xl opacity-80 mb-12">{currentPlan.desc}</p>
              
              <div className="w-full max-w-lg mb-12">
                <LightsaberSlider 
                  value={sliderValue} 
                  min={0} 
                  max={100} 
                  onChange={setSliderValue}
                  color="red"
                  className="w-full"
                />
                <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest opacity-60">
                  <span>Shared</span>
                  <span>VPS</span>
                  <span>Dedicated</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
                <div className="p-4 border border-brand-bone/10 bg-brand-bone/5 text-center">
                  <div className="font-bold uppercase opacity-60 text-xs mb-1">Compute</div>
                  <div className="font-mono text-lg">{currentPlan.specs.split("•")[0]}</div>
                </div>
                <div className="p-4 border border-brand-bone/10 bg-brand-bone/5 text-center">
                  <div className="font-bold uppercase opacity-60 text-xs mb-1">Memory</div>
                  <div className="font-mono text-lg">{currentPlan.specs.split("•")[1]}</div>
                </div>
                <div className="p-4 border border-brand-bone/10 bg-brand-bone/5 text-center">
                  <div className="font-bold uppercase opacity-60 text-xs mb-1">Storage</div>
                  <div className="font-mono text-lg">{currentPlan.specs.split("•")[2]}</div>
                </div>
              </div>

              <Link href="/login?deploy=space" className="text-lg font-bold uppercase underline decoration-2 underline-offset-4 hover:opacity-80 decoration-brand-bone">
                Configure & Deploy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 z-10 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <Server className="w-12 h-12 mb-2 text-brand-bone" />
              <h3 className="text-2xl font-bold uppercase">Shared Hosting</h3>
              <p className="opacity-80">
                High-performance shared environments isolated by CloudLinux. 
                Perfect for static sites and CMS.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Cloud className="w-12 h-12 mb-2 text-brand-bone" />
              <h3 className="text-2xl font-bold uppercase">Virtual Private Servers</h3>
              <p className="opacity-80">
                Dedicated kernel resources with root access. 
                Powered by KVM and NVMe storage.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Zap className="w-12 h-12 mb-2 text-brand-bone" />
              <h3 className="text-2xl font-bold uppercase">Direct Peering</h3>
              <p className="opacity-80">
                Connected directly to major Indian ISPs (Jio, Airtel) via NIXI 
                for &lt; 20ms latency nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}