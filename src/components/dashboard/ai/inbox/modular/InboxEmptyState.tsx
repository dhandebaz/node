import { OmniCompanion } from "@/components/ui/OmniCompanion";
import Link from "next/link";

interface InboxEmptyStateProps {
  labels: {
    listing: string;
    customers: string;
  };
}

export function InboxEmptyState({ labels }: InboxEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <OmniCompanion 
        state="thinking" 
        bubbleText={`I'm ready when you are! Let's add a ${labels.listing.toLowerCase()} to start the conversation.`}
        size="lg"
        className="mb-12"
      />
      
      <div className="space-y-6 max-w-xs">
        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
          Intelligence Hidden
        </h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          No {labels.listing.toLowerCase()}s found in your ecosystem.
        </p>
        
        <Link
          href="/dashboard/ai/listings"
          className="button-primary w-full"
        >
          Initialize {labels.listing}
        </Link>
      </div>
    </div>
  );
}
