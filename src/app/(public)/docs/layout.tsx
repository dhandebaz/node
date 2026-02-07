"use client";

import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Search } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone pt-20 relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <NetworkBackground />
      </div>
      
      {/* Mobile Search / Nav Header could go here */}
      <div className="lg:hidden p-4 border-b border-brand-bone/10 flex items-center gap-4 sticky top-20 bg-brand-deep-red/90 backdrop-blur-md z-20">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bone/40" />
           <input 
             type="text" 
             placeholder="Search docs..." 
             className="w-full bg-brand-bone/5 border border-brand-bone/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-bone/30 text-brand-bone placeholder:text-brand-bone/30"
           />
         </div>
      </div>

      <div className="flex container mx-auto px-6 max-w-7xl relative z-10">
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
