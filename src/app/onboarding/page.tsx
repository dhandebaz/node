"use client";

import { useState } from "react";
import { Bot, ArrowRight, CheckCircle2 } from "lucide-react";
import { BusinessTypeCard } from "@/components/onboarding/BusinessTypeCard";
import { BusinessDetailsForm } from "@/components/onboarding/BusinessDetailsForm";
import { completeOnboarding } from "@/app/actions/onboarding";
import { BusinessType } from "@/types";
import { Logo } from "@/components/ui/Logo";

export default function OnboardingPage() {
  const [step, setStep] = useState<"business_type" | "details">("business_type");
  const [loading, setLoading] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setStep("details");
  };

  const handleDetailsSubmit = async (details: { propertyCount: number; platforms: string[] }) => {
    try {
      setLoading(true);
      await completeOnboarding(selectedBusinessType!, details);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 font-sans bg-grid-pattern flex flex-col">
      {/* Header */}
      <div className="p-6 md:p-8 flex justify-between items-center">
        <Logo className="w-8 h-8 md:w-10 md:h-10" />
        <div className="text-xs font-bold uppercase tracking-widest opacity-60">
            Setup Step {step === 'business_type' ? '1' : '2'} of 2
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-20">
        <div className="max-w-5xl w-full space-y-12 text-center">
          
          {step === "business_type" && (
            <>
              <div className="space-y-4">
                <div className="inline-block border border-brand-bone/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 mb-2">
                    Welcome to Nodebase
                </div>
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                    Who are you hiring for?
                </h1>
                <p className="text-xl text-brand-bone/60 max-w-2xl mx-auto">
                    Select your business model to configure your AI Employee's training data.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                <BusinessTypeCard
                  title="Airbnb Host"
                  description="Homestays & Rentals"
                  icon="🏠"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("airbnb_host")}
                />
                <BusinessTypeCard
                  title="Kirana Store"
                  description="Local Shops & Retail"
                  icon="🛒"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("kirana_store")}
                />
                <BusinessTypeCard
                  title="Doctor / Clinic"
                  description="Appointments & FAQ"
                  icon="🩺"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("doctor_clinic")}
                />
                <BusinessTypeCard
                  title="Thrift Store"
                  description="Instagram Sales"
                  icon="🧥"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("thrift_store")}
                />
              </div>
            </>
          )}

          {step === "details" && selectedBusinessType && (
            <div className="max-w-xl mx-auto text-left">
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">Almost Done</h1>
                <p className="text-brand-bone/60">Tell us a bit more about your operations.</p>
              </div>
              
              <div className="bg-brand-bone/5 border border-brand-bone/10 rounded-3xl p-8 backdrop-blur-sm">
                  <BusinessDetailsForm 
                    businessType={selectedBusinessType} 
                    onSubmit={handleDetailsSubmit} 
                    loading={loading} 
                  />
              </div>
              
              <button 
                onClick={() => setStep("business_type")}
                className="mt-6 text-sm text-brand-bone/40 hover:text-brand-bone uppercase tracking-wider font-bold mx-auto block transition-colors"
              >
                ← Back to Selection
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-6 left-0 right-0 text-center text-xs text-brand-bone/30 uppercase tracking-widest">
        Need help? <a href="mailto:support@nodebase.com" className="text-brand-bone/60 hover:text-brand-bone underline transition-colors">Contact Support</a>
      </div>
    </div>
  );
}
