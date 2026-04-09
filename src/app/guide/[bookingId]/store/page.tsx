"use client";

import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function UpsellStore() {
  const params = useParams<{ bookingId: string }>();

  const extras = [
    {
      id: "early-checkin",
      title: "Early Check-in (11:00 AM)",
      amount: "₹1,500",
      description: "Arriving early? Secure early access to your villa.",
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "late-checkout",
      title: "Late Check-out (2:00 PM)",
      amount: "₹1,500",
      description: "Sleep in and take your time before you depart.",
      img: "https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "airport-pickup",
      title: "Airport Private Transfer",
      amount: "₹2,500",
      description: "Hassle-free AC cab pickup from GOX airport.",
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=60"
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
        name: "Nodebase Upsell Store",
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
          name: "Guest",
          email: "guest@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
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
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-3xl border-b border-white/5 py-4 px-6 flex items-center gap-4">
        <Link href={`/guide/${params?.bookingId}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-white">Host Store</h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Upgrade your stay</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center relative">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Enhance your experience at Villa Serenity. Just tap an extra to seamlessly add it to your booking tab.
        </p>

        <div className="grid gap-6">
          {extras.map((item) => (
            <div key={item.id} className="group relative bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-colors shadow-lg flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden shrink-0">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-mono text-white tracking-widest">{item.amount}</div>
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" /> Add
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
