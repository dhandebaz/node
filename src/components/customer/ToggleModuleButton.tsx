"use client";

import { toggleOmniModuleAction } from "@/app/actions/customer";
import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ToggleModuleButton({ name, isActive }: { name: string, isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    isActive,
    (state, newState: boolean) => newState
  );

  const handleToggle = async () => {
    const newState = !optimisticActive;
    startTransition(async () => {
      setOptimisticActive(newState);
      await toggleOmniModuleAction(name, newState);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-black ${
        optimisticActive ? "bg-brand-cyan" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          optimisticActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {isPending && (
        <Loader2 className="absolute -right-6 w-4 h-4 animate-spin text-zinc-500" />
      )}
    </button>
  );
}
