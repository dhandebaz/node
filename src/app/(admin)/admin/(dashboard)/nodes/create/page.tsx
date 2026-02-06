
"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import CreateNodeForm from "@/components/admin/node/CreateNodeForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCreateNodePageData } from "@/app/actions/admin-data";

export default function CreateNodePage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getCreateNodePageData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreateNodePageData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  const { users, dcs } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/nodes" 
          className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Allocate New Node</h1>
          <p className="text-zinc-400 text-sm">Provision a new physical node to a participant</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <CreateNodeForm users={users} dcs={dcs} />
      </div>
    </div>
  );
}
