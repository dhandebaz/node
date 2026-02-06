export const dynamic = 'force-dynamic';


import { getInvestorDocuments } from "@/app/actions/investor";
import { FileCheck, Download, Eye } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const docs = await getInvestorDocuments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-zinc-400" />
            Legal Documents
          </h1>
          <p className="text-zinc-400 mt-1">
            Access your signed agreements and participation terms.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Signed Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{doc.title}</div>
                    <div className="text-xs text-zinc-500 font-mono">{doc.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 capitalize">
                    {doc.type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {doc.signedDate ? new Date(doc.signedDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    v{doc.version}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/node/dashboard/documents/${doc.id}`}>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded transition-colors">
                        <Eye className="w-3 h-3" /> View
                        </button>
                    </Link>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded transition-colors">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
