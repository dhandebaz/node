
import { getBillingHistory } from "@/app/actions/billing";
import { Download, Search, Filter } from "lucide-react";
import Link from "next/link";

export default async function BillingHistoryPage() {
  const invoices = await getBillingHistory();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Link href="/dashboard/billing" className="hover:text-white transition-colors">Billing</Link>
            <span>/</span>
            <span className="text-white">History</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Billing History</h1>
        </div>
        <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg border border-zinc-800 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download All
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Filters (Mock) */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search invoices..." 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-zinc-700"
                />
            </div>
            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium">Invoice ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                   <td className="px-6 py-4 text-zinc-300">
                    {inv.items[0]?.description || "Subscription Charge"}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {inv.currency} {inv.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
                No invoices found.
            </div>
        )}
      </div>
    </div>
  );
}
