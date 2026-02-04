import { FileText, Edit } from "lucide-react";

export default function ContentManagementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Pages & Content</h1>
      <div className="space-y-4">
        {["Home", "About Us", "Legal / Privacy", "Kaisa Product Page", "Space Product Page"].map((page) => (
            <div key={page} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-500" />
                    <span className="text-white">{page}</span>
                </div>
                <button className="flex items-center gap-2 text-sm text-brand-blue hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
