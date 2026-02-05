import { Metadata } from "next";
import { MessageCircle, Mail, Calendar, CreditCard, ShoppingBag, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations - kaisa AI Docs",
  description: "Connect kaisa AI with your favorite tools.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Integrations</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        kaisa agents become powerful when connected to your business tools. We support a wide range of native integrations tailored for Indian businesses.
      </p>

      <h2 className="text-white mt-12 mb-6">Communication</h2>
      <div className="grid grid-cols-1 gap-6 not-prose">
        
        <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-white/5">
          <div className="bg-[#25D366]/20 p-3 rounded-lg text-[#25D366]">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">WhatsApp Business</h3>
            <p className="text-sm text-zinc-400 mb-3">
              The primary interface for kaisa agents. Enable agents to read, reply, and manage WhatsApp conversations automatically.
            </p>
            <ul className="text-sm text-zinc-500 list-disc list-inside">
              <li>Automatic reply handling</li>
              <li>Template message sending</li>
              <li>Media handling (images/documents)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-white/5">
          <div className="bg-blue-500/20 p-3 rounded-lg text-blue-500">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Email (Gmail / Outlook)</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Allow agents to draft, send, and categorize emails. Great for handling support tickets or vendor inquiries.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-white mt-12 mb-6">Productivity & Scheduling</h2>
      <div className="grid grid-cols-1 gap-6 not-prose">
        <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-white/5">
          <div className="bg-orange-500/20 p-3 rounded-lg text-orange-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Google Calendar</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Real-time slot checking and appointment booking. kaisa respects your "Busy" status and working hours.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-white mt-12 mb-6">Payments (India Stack)</h2>
      <div className="grid grid-cols-1 gap-6 not-prose">
        <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-white/5">
          <div className="bg-indigo-500/20 p-3 rounded-lg text-indigo-500">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Razorpay & UPI</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Generate payment links and verify transaction status.
            </p>
            <div className="bg-black/40 p-3 rounded text-xs font-mono text-zinc-400">
              Agent: "I've booked your slot. Please pay ₹500 using this link: https://rzp.io/l/xxxxx"
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-white mt-12 mb-6">Industry Specific</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        <div className="p-6 glass-card rounded-xl border border-white/5">
           <div className="flex items-center gap-2 mb-3">
             <Stethoscope className="w-5 h-5 text-red-400" />
             <h3 className="font-bold text-white">Cowin / ABDM</h3>
           </div>
           <p className="text-sm text-zinc-400">
             For clinics: Verify vaccination status or link health records (requires ABDM compliance).
           </p>
        </div>

        <div className="p-6 glass-card rounded-xl border border-white/5">
           <div className="flex items-center gap-2 mb-3">
             <ShoppingBag className="w-5 h-5 text-purple-400" />
             <h3 className="font-bold text-white">Shopify / WooCommerce</h3>
           </div>
           <p className="text-sm text-zinc-400">
             For retail: Check inventory, order status, and process returns.
           </p>
        </div>
      </div>
    </div>
  );
}
