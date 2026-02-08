"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messagesApi } from "@/lib/api/messages";
import { paymentsApi } from "@/lib/api/payments";
import { listingsApi } from "@/lib/api/listings";
import { guestsApi } from "@/lib/api/guests";
import { Message, Booking } from "@/types";
import { Loader2, CheckCircle, AlertCircle, MessageSquare, CreditCard, Calendar, UserCheck } from "lucide-react";

export function VisualFlow() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const steps = [
    { label: "Incoming Message", icon: MessageSquare, action: "Receive Inquiry" },
    { label: "AI Reply", icon: BrainCircuitIcon, action: "Send Response" },
    { label: "Payment Link", icon: CreditCard, action: "Generate Link" },
    { label: "Block Calendar", icon: Calendar, action: "Confirm Booking" },
    { label: "ID Verification", icon: UserCheck, action: "Verify Guest" },
  ];

  const handleStep = async (currentStep: number) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (currentStep) {
        case 0: // Incoming Message
          result = await messagesApi.getMessages("demo-listing", "airbnb");
          // Filter for inbound
          result = result.find((m: Message) => m.direction === 'inbound') || result[0];
          break;
        case 1: // AI Reply
          result = await messagesApi.sendAiReply("demo-msg-id");
          break;
        case 2: // Payment Link
          result = await paymentsApi.createPaymentLink({
            listingId: "demo-listing",
            guestName: "Demo Guest",
            guestPhone: null,
            guestEmail: null,
            amount: 5000,
            checkIn: new Date().toISOString().slice(0, 10),
            checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            notes: "Demo payment link"
          });
          break;
        case 3: // Block Calendar
          result = await listingsApi.blockCalendar("demo-listing", { 
            start: new Date().toISOString(), 
            end: new Date(Date.now() + 86400000).toISOString() 
          });
          break;
        case 4: // ID Verification
          // Simulating upload with a dummy file
          const dummyFile = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
          result = await guestsApi.uploadId("demo-guest-id", dummyFile);
          break;
      }
      setData(result);
      setTimeout(() => {
         if (currentStep < 4) setStep(currentStep + 1);
         else setStep(0); // Loop for demo
      }, 3000);
    } catch (err) {
      setError("Action failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleStep(step);
  }, [step]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-brand-bone/5 rounded-xl border border-brand-bone/10 p-6 backdrop-blur-sm">
      <div className="flex justify-between mb-8 relative">
        {/* Progress Bar */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-bone/10 -z-10" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-bone transition-all duration-500" 
          style={{ width: `${(step / (steps.length - 1)) * 100}%` }} 
        />
        
        {steps.map((s, i) => (
          <div key={i} className={`flex flex-col items-center gap-2 bg-brand-deep-red px-2 ${i <= step ? 'text-brand-bone' : 'text-brand-bone/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              i < step ? 'bg-brand-bone text-brand-deep-red border-brand-bone' :
              i === step ? 'border-brand-bone bg-brand-deep-red text-brand-bone' :
              'border-brand-bone/20 bg-brand-deep-red'
            }`}>
              {i < step ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className="text-xs font-mono uppercase tracking-wider hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-brand-bone/60" />
              <p className="text-brand-bone/60 font-mono text-sm">Processing {steps[step].action}...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 flex flex-col items-center gap-2"
            >
              <AlertCircle className="w-8 h-8" />
              <p>{error}</p>
              <button onClick={() => handleStep(step)} className="text-xs underline hover:text-red-300">Retry</button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-black/20 rounded-lg p-6 border border-brand-bone/5 font-mono text-left"
            >
              <div className="flex items-center gap-2 mb-4 text-brand-bone/40 text-xs uppercase tracking-widest border-b border-brand-bone/5 pb-2">
                <span>API Response</span>
                <span className="ml-auto text-green-400">200 OK</span>
              </div>
              <pre className="text-xs text-brand-silver overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BrainCircuitIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.97-3.284" />
      <path d="M17.97 14.716A4 4 0 0 1 18 18" />
    </svg>
  );
}
