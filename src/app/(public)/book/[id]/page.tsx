
import { PaymentLinkService } from "@/lib/services/paymentLinkService";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Home, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  QrCode,
  UserCheck,
  FileUp,
  MapPin,
  Sparkles,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuestCheckoutFlow } from "@/components/public/GuestCheckoutFlow";

export default async function PublicCheckoutPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  await searchParams; // Await to satisfy Next.js 15+
  const link = await PaymentLinkService.getLinkDetails(id);

  if (!link) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 py-12">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Secure Direct Booking</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {link.tenants?.name || "Nodebase Business"}
          </h1>
        </div>

        <GuestCheckoutFlow link={link} />

        {/* Footer */}
        <div className="flex justify-center items-center gap-6 text-white/20">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
            <ShieldCheck className="w-3 h-3" />
            PCI Compliant
          </div>
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
            <CheckCircle2 className="w-3 h-3" />
            Verified Host
          </div>
        </div>
      </div>
    </div>
  );
}
