
"use client";

import { toggleKaisaModuleAction } from "@/app/actions/customer";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ToggleModuleButton({ name, isActive }: { name: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    await toggleKaisaModuleAction(name, !isActive);
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${
        isActive ? "bg-blue-600" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {loading && (
        <Loader2 className="absolute -right-6 w-4 h-4 animate-spin text-zinc-500" />
      )}
    </button>
  );
}
