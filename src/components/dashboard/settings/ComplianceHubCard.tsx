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

    const apiType = typeMap[docType];
    
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
        setDocumentContent(res.markdown.text); // Fix: Access text property
        toast.success("Document Generated Successfully");
      }
    } catch (error) {
      toast.error("Failed to generate document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mt-8 shadow-sm">
      <div className="p-6 border-b border-border flex items-center gap-4">
        <div className="p-3 bg-muted rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Legal & Compliance Hub</h2>
          <p className="text-sm text-muted-foreground">Automated legal documents and guidelines</p>
        </div>
      </div>
      
      <div className="p-6">
        {!isVerified ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">Hub Locked</h3>
              <p className="text-muted-foreground text-sm">
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
                  className="h-auto py-4 flex flex-col items-center gap-3 border-border hover:bg-muted hover:text-foreground disabled:opacity-50 transition-all duration-200"
                  onClick={() => handleGenerate(doc)}
                >
                  <Sparkles className="w-5 h-5 text-primary/80" />
                  <span className="font-medium text-muted-foreground group-hover:text-foreground">{doc}</span>
                </Button>
              ))}
            </div>

            {loading && (
              <div className="mt-8 flex flex-col items-center justify-center space-y-3 animate-pulse">
                 <Loader2 className="w-8 h-8 text-primary animate-spin" />
                 <p className="text-primary/80 font-medium text-sm">AI Legal Engine is drafting your localized documents...</p>
              </div>
            )}

            {documentContent && (
              <div className="mt-8 relative">
                 <div className="absolute top-4 right-4 z-10">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDocumentContent(null)}
                        className="hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Close / Clear
                    </Button>
                 </div>
                 <div className="bg-muted/50 text-foreground border border-border p-8 rounded-xl prose prose-invert max-w-none shadow-inner">
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
