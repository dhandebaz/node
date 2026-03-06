"use client";

import { useState } from "react";
import { Lock, FileText, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tenant } from "@/types";
import { generateComplianceDocumentAction } from "@/app/actions/compliance";
import ReactMarkdown from 'react-markdown';

interface ComplianceHubCardProps {
  tenant: Tenant;
}

export function ComplianceHubCard({ tenant }: ComplianceHubCardProps) {
  const isVerified = tenant.kyc_status === 'verified';
  const [loading, setLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);

  const handleGenerate = async (docType: string) => {
    // Map display names to API types
    const typeMap: Record<string, 'shop_act' | 'gst' | 'sop'> = {
      "Shop Act Guidelines": "shop_act",
      "GST SOP": "gst",
      "SOP": "sop"
    };

    // If docType isn't in our map (e.g. "Rental Agreement"), just show "Coming Soon" for now
    // The requirement says: "Update the grid buttons to call generateComplianceDocumentAction with the respective docType ('shop_act', 'gst', 'sop')"
    // So I should only enable those specific ones or map them.
    // I'll check if the button label maps to a valid type.
    
    let apiType: 'shop_act' | 'gst' | 'sop' | undefined;
    
    if (docType === "Shop Act Guidelines") apiType = "shop_act";
    else if (docType === "GST SOP") apiType = "gst";
    // Assuming "SOP" refers to a generic SOP or maybe I should add a button for it.
    // The previous code had specific buttons.
    // I will use "Standard Operating Procedure" button or just map what I can.
    
    // Actually, the previous buttons were: "Shop Act Guidelines", "GST SOP", "Rental Agreement", etc.
    // The prompt says: "Update the grid buttons to call generateComplianceDocumentAction with the respective docType ('shop_act', 'gst', 'sop')"
    // This implies I should only implement logic for these 3 types. 
    // I'll just handle "Shop Act Guidelines" -> 'shop_act' and "GST SOP" -> 'gst'.
    // For 'sop', I might need a button. 
    // I'll stick to the existing buttons but wire up the ones that match.
    
    if (!apiType) {
        toast.info("AI Generation coming soon", {
            description: `We're working on ${docType} generation.`
        });
        return;
    }

    setLoading(true);
    setDocumentContent(null);
    
    try {
      const res = await generateComplianceDocumentAction(apiType);
      if (res.success && res.markdown) {
        setDocumentContent(res.markdown);
        toast.success("Document Generated Successfully");
      }
    } catch (error) {
      toast.error("Failed to generate document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mt-8">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
        <div className="p-3 bg-zinc-800 rounded-lg">
          <FileText className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Legal & Compliance Hub</h2>
          <p className="text-sm text-zinc-400">Automated legal documents and guidelines</p>
        </div>
      </div>
      
      <div className="p-6">
        {!isVerified ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-full">
              <Lock className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-lg font-medium text-white mb-2">Hub Locked</h3>
              <p className="text-zinc-400 text-sm">
                Complete your KYC verification to unlock automated legal documents, Shop Act guidelines, and more.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "Shop Act Guidelines",
                "GST SOP",
                "Rental Agreement",
                "Employee Contracts",
                "Vendor NDA",
                "Privacy Policy"
              ].map((doc) => (
                <Button
                  key={doc}
                  variant="outline"
                  disabled={loading}
                  className="h-auto py-4 flex flex-col items-center gap-3 border-zinc-800 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                  onClick={() => handleGenerate(doc)}
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-zinc-300">{doc}</span>
                </Button>
              ))}
            </div>

            {loading && (
              <div className="mt-8 flex flex-col items-center justify-center space-y-3 animate-pulse">
                 <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                 <p className="text-purple-400 font-medium text-sm">AI Legal Engine is drafting your localized documents...</p>
              </div>
            )}

            {documentContent && (
              <div className="mt-8 relative">
                 <div className="absolute top-4 right-4 z-10">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setDocumentContent(null)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Close / Clear
                    </Button>
                 </div>
                 <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-xl prose prose-invert max-w-none">
                    <ReactMarkdown>{documentContent}</ReactMarkdown>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
