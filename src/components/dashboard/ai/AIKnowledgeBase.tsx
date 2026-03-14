
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  BookOpen,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AIKnowledgeBase() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/knowledge/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast.error("Only PDF and TXT files are supported currently.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        toast.success("Document uploaded and processing...");
        fetchDocuments();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document and its knowledge?")) return;
    try {
      const res = await fetch(`/api/knowledge/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        toast.success("Document removed");
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-white">Knowledge Base (RAG 2.0)</CardTitle>
              <CardDescription className="text-white/50">
                Upload PDFs of house rules, guides, or manuals for Kaisa to learn from.
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Upload Doc
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.txt" 
            onChange={handleUpload}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Knowledge Insights */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
           <div className="flex items-center gap-2 text-blue-400">
             <Info className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-tight">AI Training Tip</span>
           </div>
           <p className="text-[11px] text-blue-200/70 leading-relaxed">
             Kaisa uses **Vector Search** to retrieve relevant snippets from your documents. 
             Upload clearly formatted PDFs for best results. Responses based on your docs will be tagged as "Verified Knowledge".
           </p>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/20" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
              <FileText className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <h3 className="text-white font-medium">No documents yet</h3>
              <p className="text-white/30 text-sm">Upload your first guide to train Kaisa.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div 
                key={doc.id} 
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg text-white/40">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{doc.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase tracking-wider px-1.5 py-0 h-4 border-none",
                        doc.status === 'active' ? "bg-emerald-500/20 text-emerald-400" :
                        doc.status === 'processing' ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      )}>
                        {doc.status}
                      </Badge>
                      <span className="text-[10px] text-white/20 font-mono">
                        {doc.file_type.toUpperCase()} • {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
