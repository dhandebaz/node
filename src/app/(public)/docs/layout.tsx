"use client";

import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Search } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-20">
      
      {/* Mobile Search / Nav Header could go here */}
      <div className="lg:hidden p-4 border-b border-white/10 flex items-center gap-4 sticky top-20 bg-black z-20">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
           <input 
             type="text" 
             placeholder="Search docs..." 
             className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-saffron/50"
           />
         </div>
      </div>

      <div className="flex container mx-auto px-6 max-w-7xl">
        <DocsSidebar />
        
        <main className="flex-1 min-w-0 py-10 lg:pl-10">
          <div className="max-w-4xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
