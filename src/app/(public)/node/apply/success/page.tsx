
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Application Submitted",
};

export default function ApplySuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-900/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-900/50">
            <CheckCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Application Submitted</h1>
        
        <p className="text-zinc-400 mb-8 leading-relaxed">
            Thank you for your interest in joining the Nodebase network. 
            Our team is reviewing your application and documents.
            <br/><br/>
            You will receive an email update within 48 hours with the next steps regarding the MoU and allocation process.
        </p>

        <div className="space-y-4">
            <Link 
                href="/"
                className="block w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
                Return to Home
            </Link>
            
            <p className="text-xs text-zinc-600">
                Application Reference: #APP-{(Math.random() * 100000).toFixed(0)}
            </p>
        </div>
      </div>
    </div>
  );
}
