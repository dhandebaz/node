import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Client Portal | NodeBase Digital Assistant',
  description: 'Everything you need to know about your upcoming service or project engagement.',
  themeColor: '#ffffff',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-white text-zinc-950 selection:bg-blue-100 antialiased`}>
      {/* Background ambient glow effect - Light Mode Optimized */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] opacity-30" />
      </div>
      
      {/* Scrollable content container */}
      <div className="relative z-10 max-w-md mx-auto sm:max-w-2xl min-h-screen flex flex-col shadow-2xl bg-white border-x border-zinc-100">
        {children}
      </div>
    </div>
  );
}
