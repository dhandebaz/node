
import { Logo } from "@/components/ui/Logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-white" />
            <span className="text-xl font-bold uppercase tracking-tighter text-white">Nodebase</span>
        </div>
      </div>
      {children}
    </div>
  );
}
