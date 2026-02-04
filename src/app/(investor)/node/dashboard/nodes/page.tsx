
import { getInvestorNodes } from "@/app/actions/investor";
import { NodeList } from "@/components/investor/nodes/NodeList";
import { Server } from "lucide-react";

export const metadata = {
  title: "My Nodes",
};

export default async function MyNodesPage() {
  const nodes = await getInvestorNodes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-zinc-400" />
            My Nodes
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your infrastructure allocations and view operational status.
          </p>
        </div>
      </div>

      <NodeList nodes={nodes} />
    </div>
  );
}
