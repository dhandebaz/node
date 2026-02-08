import Link from "next/link";

export function SessionExpiredCard({ className }: { className?: string }) {
  return (
    <div className={className ? className : "dashboard-surface p-6 text-white"}>
      <h2 className="text-lg font-semibold mb-2">Session expired</h2>
      <p className="text-sm text-white/60 mb-4">Please sign in again to continue.</p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-[var(--color-brand-red)] text-sm font-semibold"
      >
        Re-login
      </Link>
    </div>
  );
}
