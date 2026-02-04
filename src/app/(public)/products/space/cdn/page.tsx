import { PageHeader } from "@/components/ui/PageHeader";

export default function CdnPage() {
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <PageHeader 
        title="CDN" 
        description="Content Delivery Network optimized for Indian geography and networks."
        tag="nodebase Space"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-blue)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>

      <div className="container mx-auto px-6 py-24 text-center relative z-10">
        <div className="glass-card p-12 max-w-2xl mx-auto rounded-3xl">
          <p className="text-white/80 text-xl">Product details coming soon.</p>
        </div>
      </div>
    </div>
  );
}
