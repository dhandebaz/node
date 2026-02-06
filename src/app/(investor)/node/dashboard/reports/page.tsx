export const dynamic = 'force-dynamic';


import { getInvestorReports } from "@/app/actions/investor";
import { FileText, Download, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const reports = await getInvestorReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-zinc-400" />
            Performance Reports
          </h1>
          <p className="text-zinc-400 mt-1">
            Periodic operational summaries and utilization snapshots.
          </p>
        </div>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
            <p className="font-bold text-blue-400 mb-1">Information Only</p>
            <p className="text-blue-200/80">
                These reports provide factual data regarding infrastructure utilization and aggregated revenue pools. 
                They do not constitute individual financial statements or guaranteed returns. 
                Nodebase is an infrastructure provider, not a financial investment platform.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((report) => (
            <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-zinc-800 rounded border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
                        <FileText className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    </div>
                    {report.isNew && (
                        <span className="px-2 py-0.5 bg-cyan-900/20 text-cyan-400 text-xs font-bold rounded border border-cyan-900/50">NEW</span>
                    )}
                </div>
                
                <h3 className="text-white font-bold mb-1">{report.title}</h3>
                <p className="text-zinc-500 text-sm mb-6">{report.period}</p>
                
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800">
                    <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                    <button className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-medium transition-colors">
                        <Download className="w-3 h-3" /> Download
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
