"use client";

import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClientStore() {
  const params = useParams<{ bookingId: string }>();

  const extras = [
    {
      id: "premium-onboarding",
      title: "Premium Onboarding",
      amount: "₹4,999",
      description: "Dedicated success manager to project manage your rollout.",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "priority-sla",
      title: "24/7 Priority SLA",
      amount: "₹9,999",
      description: "Guaranteed 15-minute response time for critical issues.",
      img: "https://images.unsplash.com/photo-1454165833762-02651d58d92c?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "compliance-audit",
      title: "Compliance Audit",
      amount: "₹14,999",
      description: "Full regulatory review of your automated AI workflows.",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60"
    }
  ];

  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePurchase = async (item: typeof extras[0]) => {
    try {
      setIsProcessing(true);
      // Create backend order
      const amountValue = parseInt(item.amount.replace(/[^0-9]/g, ""), 10);
      
      const res = await fetch(`/api/guide/${params?.bookingId}/store/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: params?.bookingId || "default", // Context from route
          items: [item],
          totalAmount: amountValue
        })
      });

      const data = await res.json();
      
      if (!data.success) {
        alert("Payment initialization failed");
        return;
      }

      // Initialize Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_missing",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Nodebase Client Store",
        description: item.title,
        order_id: data.order.id,
        handler: async function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // Send verification to backend
          try {
            await fetch(`/api/guide/${params?.bookingId}/store/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              })
            });
          } catch (err) {
            console.error("Verification failed", err);
          }
        },
        prefill: {
          name: "Client",
          email: "client@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#09090b"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (e) {
      console.error(e);
      alert("Error initializing checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-zinc-200 py-4 px-6 flex items-center gap-4 shadow-sm">
        <Link href={`/guide/${params?.bookingId}`} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-black text-zinc-950 uppercase tracking-tighter">Client Solutions</h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Upgrade your project</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center relative shadow-sm shadow-blue-600/5">
          <ShoppingBag className="w-4 h-4 text-blue-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
          Enhance your project outcome with our specialized add-ons. Tap any solution to secure institutional-grade service.
        </p>

        <div className="grid gap-6">
          {extras.map((item) => (
            <div key={item.id} className="group relative bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden shrink-0 bg-zinc-50">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-950 mb-2 uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-mono text-zinc-950 tracking-widest font-black">{item.amount}</div>
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg shadow-zinc-950/20 active:scale-95"
                  >
                    <Plus className="w-3 h-3" /> Add Solution
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
