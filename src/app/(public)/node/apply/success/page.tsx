
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Application Submitted",
};

export default function ApplySuccessPage() {
  return (
    <div className="bg-[--color-brand-red] text-white selection:bg-white selection:text-[--color-brand-red] min-h-screen flex flex-col justify-center px-6 py-24">
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-2xl">
          <div className="mb-12">
            <CheckCircle className="w-24 h-24 text-white" strokeWidth={1} />
          </div>
          
          <h1 className="text-display-large uppercase leading-[0.85] tracking-tighter mb-8">
            Application<br />
            Submitted
          </h1>
          
          <p className="text-xl opacity-80 leading-relaxed mb-12">
            Thank you for your interest in joining the Nodebase network. 
            Our team is reviewing your application and documents.
            <br/><br/>
            You will receive an email update within 48 hours with the next steps regarding the MoU and allocation process.
          </p>

          <div className="flex flex-col gap-6">
            <div className="text-sm font-bold uppercase tracking-widest opacity-60">
              Application Reference: #APP-{(Math.random() * 100000).toFixed(0)}
            </div>
            
            <Link 
              href="/"
              className="group flex items-center gap-4 text-2xl font-bold uppercase tracking-tight hover:gap-6 transition-all"
            >
              Return to Home <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
