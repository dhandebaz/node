
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";

export const metadata = {
  title: "Apply for Node Participation",
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 text-blue-400 border border-blue-900/50 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" /> Nodebase Phase 2B
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Apply for Node Participation
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Join the Nodebase infrastructure network as a participant. 
            Secure physical data center assets and earn from infrastructure utilization.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">Participation Prerequisites</h3>
          <ul className="space-y-4 mb-8">
            {[
              "Minimum commitment of 1 Node Unit (₹10,00,000)",
              "Valid Indian KYC (PAN, Aadhar)",
              "Bank account in own name for payouts",
              "Agreement to 3-year infrastructure lock-in"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg mb-8">
            <p className="text-sm text-zinc-400">
              <strong className="text-white">Note:</strong> This is a formal application process. 
              Submission of interest does not guarantee allocation. 
              All applications are reviewed by the Nodebase admin team.
            </p>
          </div>

          <Link 
            href="/node/apply/details"
            className="block w-full py-4 bg-white text-black text-center font-bold text-lg rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Start Application
          </Link>
        </div>

        <div className="text-center text-zinc-500 text-sm">
          Already a participant? <Link href="/node/dashboard" className="text-white hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
