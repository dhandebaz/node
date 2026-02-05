
import { getInvestorDocument } from "@/app/actions/investor";
import { ArrowLeft, Calendar, FileText, GitCommit, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentViewerPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getInvestorDocument(id);

  if (!doc) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/node/dashboard/documents" 
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {doc.type.toUpperCase().replace("_", " ")}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Signed: {doc.signedDate ? new Date(doc.signedDate).toLocaleDateString() : "Pending"}
            </span>
            <span className="flex items-center gap-1.5">
              <GitCommit className="w-4 h-4" />
              v{doc.version}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Document Content */}
      <div className="bg-white text-black p-8 rounded-lg shadow-xl min-h-[600px]">
        {doc.content ? (
          <div 
            className="prose max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:mt-6 prose-p:my-3 prose-ul:list-disc prose-ul:ml-6 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-20">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Document preview not available.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-zinc-500 text-sm">
        Document ID: {doc.id} • Digital Signature Verified
      </div>
    </div>
  );
}
