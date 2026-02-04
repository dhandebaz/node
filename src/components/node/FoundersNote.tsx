"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

export function FoundersNote() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-zinc-900/50 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          
          {/* Image Side */}
          <div className="relative w-full md:w-[320px] shrink-0">
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 group">
              <div className="absolute inset-0 bg-brand-saffron/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
              {/* Note: User must place the image at public/images/founder.png */}
              <Image 
                src="/images/azadnode.png" 
                alt="Founder of Nodebase"
                fill
                className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-saffron/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-saffron/5 rounded-full blur-3xl -z-10" />
          </div>

          {/* Text Side */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <Quote className="w-12 h-12 text-brand-saffron opacity-50 mx-auto md:mx-0" />
            
            <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              "We cannot build a sovereign future on rented land."
            </h3>
            
            <div className="space-y-6 text-lg text-white/70 leading-relaxed font-light">
              <p>
                India missed the semiconductor wave. We missed the operating system wave. 
                <span className="text-white font-medium"> We cannot afford to miss the AI infrastructure wave.</span>
              </p>
              <p>
                Nodebase isn't just a data center company. It is a declaration of digital independence. 
                We are building the physical bedrock where India's intelligence will reside. Owned by us, 
                governed by us, and built for us.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 inline-block md:block">
              <div className="text-xl font-bold text-white">Sheikh Arsalanullah Chishti</div>
              <div className="text-sm text-brand-saffron font-medium uppercase tracking-wider mt-1">Founder, Nodebase</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
