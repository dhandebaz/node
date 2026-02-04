import { NodeNav } from "@/components/node/NodeNav";
import { FoundersNote } from "@/components/node/FoundersNote";

export default function NodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand-saffron/30">
      <NodeNav />
      <div className="flex-1">
        {children}
      </div>
      <FoundersNote />
    </div>
  );
}
