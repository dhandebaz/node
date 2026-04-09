import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Your Stay | Digital Welcome Guide',
  description: 'Everything you need for your upcoming stay.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-black text-white selection:bg-primary/30 antialiased`}>
      {/* Background ambient glow effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-50" />
      </div>
      
      {/* Scrollable content container */}
      <div className="relative z-10 max-w-md mx-auto sm:max-w-2xl min-h-screen flex flex-col shadow-2xl bg-zinc-950/40 backdrop-blur-3xl border-x border-white/5">
        {children}
      </div>
    </div>
  );
}
