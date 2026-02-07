 "use client";
 
 import { useEffect, useState } from "react";
 import Link from "next/link";
 import { motion } from "framer-motion";
 import { AiManagerCard } from "@/components/ai-managers/AiManagerCard";
 import { fetchPublicPricing } from "@/lib/api/aiManagers";
 import { PublicPricingItem } from "@/types/ai-managers";
 
 export default function PricingPage() {
   const [items, setItems] = useState<PublicPricingItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     setLoading(true);
     fetchPublicPricing()
       .then((data) => {
         setItems(data);
         setError(null);
       })
       .catch((err) => {
         setError(err.message);
       })
       .finally(() => setLoading(false));
   }, []);
 
   const fadeInUp = {
     initial: { opacity: 0, y: 20 },
     animate: { opacity: 1, y: 0 },
     transition: { duration: 0.6 }
   };
 
   return (
     <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
       <section className="pt-32 pb-12 px-6 border-b border-brand-bone/10">
         <div className="container mx-auto max-w-6xl">
           <motion.div initial="initial" animate="animate" variants={fadeInUp}>
             <Link href="/employees" className="text-sm uppercase tracking-widest text-brand-bone/60">
               AI Employees Overview
             </Link>
             <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mt-6 mb-4">
               Pricing
             </h1>
             <p className="text-xl md:text-2xl text-brand-silver max-w-3xl font-light leading-relaxed">
               Live monthly base prices for each AI Manager. Usage-based AI credits apply separately.
             </p>
           </motion.div>
         </div>
       </section>
 
       <section className="py-16 md:py-24 px-6 border-b border-brand-bone/10">
         <div className="container mx-auto max-w-6xl">
           <div className="flex items-end justify-between gap-6 mb-8">
             <h2 className="text-3xl md:text-4xl font-bold uppercase leading-none text-brand-bone">
               AI Manager Pricing
             </h2>
           </div>
 
           {loading && (
             <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
               Loading live pricing...
             </div>
           )}
           {error && !loading && (
             <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200">
               {error}
             </div>
           )}
 
           {!loading && !error && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {items.map((item) => (
                 <AiManagerCard
                   key={item.slug}
                   name={item.name}
                   href={`/employees/${item.slug}`}
                   ctaLabel="View details"
                   price={item.status === "disabled" ? null : item.baseMonthlyPrice}
                   disabled={item.status === "disabled"}
                 />
               ))}
             </div>
           )}
         </div>
       </section>
     </div>
   );
 }
