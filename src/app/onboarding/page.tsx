"use client";

import { useState } from "react";
import { Bot, Cloud } from "lucide-react";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { BusinessTypeCard } from "@/components/onboarding/BusinessTypeCard";
import { BusinessDetailsForm } from "@/components/onboarding/BusinessDetailsForm";
import { completeOnboarding } from "@/app/actions/onboarding";
import { BusinessType } from "@/types";

interface OnboardingPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const initialStep = searchParams?.step === "business_type" ? "business_type" : "product";
  const [step, setStep] = useState<"product" | "business_type" | "details">(initialStep);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<"ai_employee" | "space" | null>(
    initialStep === "business_type" ? "ai_employee" : null
  );
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  const handleProductSelect = async (product: "ai_employee" | "space") => {
    if (product === "space") {
      try {
        setLoading(true);
        await completeOnboarding("space");
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    } else {
      setSelectedProduct("ai_employee");
      setStep("business_type");
    }
  };

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setStep("details");
  };

  const handleDetailsSubmit = async (details: { propertyCount: number; platforms: string[] }) => {
    try {
      setLoading(true);
      await completeOnboarding("ai_employee", selectedBusinessType!, details);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        
        {step === "product" && (
          <>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to Nodebase</h1>
              <p className="text-zinc-400 text-lg">What do you want to use Nodebase for?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <OnboardingCard
                title="AI Employee"
                description="For Airbnb hosts & property managers. Automate guest messaging, sync calendars, and manage bookings."
                icon={Bot}
                productType="ai_employee"
                gradient="from-blue-500/20 to-purple-500/20"
                borderColor="hover:border-blue-500/50"
                loading={loading && selectedProduct === "ai_employee"}
                onSelect={() => handleProductSelect("ai_employee")}
              />
              
              <OnboardingCard
                title="Nodebase Space"
                description="For developers & businesses. Deploy websites, manage domains, and scale cloud infrastructure."
                icon={Cloud}
                productType="space"
                gradient="from-emerald-500/20 to-teal-500/20"
                borderColor="hover:border-emerald-500/50"
                loading={loading && selectedProduct === "space"} // Though direct, for completeness
                onSelect={() => handleProductSelect("space")}
              />
            </div>
          </>
        )}

        {step === "business_type" && (
          <>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Select Business Type</h1>
              <p className="text-zinc-400 text-lg">Help us customize your AI Employee for your needs.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
              <BusinessTypeCard
                title="Airbnb Host"
                description="For homestays, guest houses, short stays"
                icon="🏠"
                selected={false}
                onSelect={() => handleBusinessTypeSelect("airbnb_host")}
              />
              <BusinessTypeCard
                title="Kirana Store"
                description="For local shops, daily orders, WhatsApp selling"
                icon="🛒"
                selected={false}
                onSelect={() => handleBusinessTypeSelect("kirana_store")}
              />
              <BusinessTypeCard
                title="Doctor / Clinic"
                description="For appointments and consultations"
                icon="🩺"
                selected={false}
                onSelect={() => handleBusinessTypeSelect("doctor_clinic")}
              />
              <BusinessTypeCard
                title="Thrift / Resale"
                description="For Instagram and WhatsApp selling"
                icon="🧥"
                selected={false}
                onSelect={() => handleBusinessTypeSelect("thrift_store")}
              />
            </div>
          </>
        )}

        {step === "details" && (
          <div className="max-w-xl mx-auto">
            <div className="space-y-2 mb-8">
              <h1 className="text-4xl font-bold tracking-tight">Almost Done</h1>
              <p className="text-zinc-400 text-lg">Tell us a bit more about your operations.</p>
            </div>
            <BusinessDetailsForm onSubmit={handleDetailsSubmit} loading={loading} />
          </div>
        )}
      </div>
      <div className="fixed bottom-6 left-0 right-0 text-center text-sm text-zinc-500">
        Having trouble? <a href="mailto:support@nodebase.com" className="text-zinc-400 underline hover:text-white transition-colors">Contact Support</a>
      </div>
    </div>
  );
}
