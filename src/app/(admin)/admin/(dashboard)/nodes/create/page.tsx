
import { userService } from "@/lib/services/userService";
import { dcService } from "@/lib/services/datacenterService";
import CreateNodeForm from "@/components/admin/node/CreateNodeForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateNodePage() {
  const users = await userService.getUsers();
  const dcs = await dcService.getAll();

  const formattedUsers = users.map(u => ({
    id: u.identity.id,
    name: u.identity.email || u.identity.phone || u.identity.id
  }));

  const formattedDCs = dcs.map(dc => ({
    id: dc.id,
    name: dc.name,
    available: dc.capacity.total - dc.capacity.active
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/nodes" 
          className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Node</h1>
          <p className="text-zinc-400">Allocate new infrastructure participation.</p>
        </div>
      </div>

      <CreateNodeForm users={formattedUsers} dcs={formattedDCs} />
    </div>
  );
}
