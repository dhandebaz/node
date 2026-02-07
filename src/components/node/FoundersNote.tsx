
"use client";

import Image from "next/image";

export function FoundersNote() {
  return (
    <section className="py-24 bg-[--color-brand-red] border-t border-white/20 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          
          {/* Image Side */}
          <div className="relative w-full md:w-[400px] shrink-0">
            <div className="aspect-[4/5] relative bg-black">
              <Image 
                src="/images/azadnode.png" 
                alt="Founder of Nodebase"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold uppercase tracking-tight">Sheikh Arsalanullah Chishti</div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-60">Founder, Nodebase</div>
            </div>
          </div>

          {/* Text Side */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.9] mb-12">
              "We cannot build a sovereign future on rented land."
            </h3>
            
            <div className="space-y-8 text-xl opacity-80 leading-relaxed max-w-2xl">
              <p>
                India missed the semiconductor wave. We missed the operating system wave. 
                <strong className="text-white opacity-100"> We cannot afford to miss the AI infrastructure wave.</strong>
              </p>
              <p>
                Nodebase isn't just a data center company. It is a declaration of digital independence. 
                We are building the physical bedrock where India's intelligence will reside. Owned by us, 
                governed by us, and built for us.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
