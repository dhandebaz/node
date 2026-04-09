/**
 * Dashboard loading skeletons.
 * Reusable shimmer-effect skeleton components for all dashboard pages.
 */

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 p-6 ${className}`}>
      <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-gray-100 p-6 space-y-4">
      {/* Header */}
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 flex-1 bg-gray-200 rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 pt-3 border-t border-gray-200/50">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-3 flex-1 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 p-6 ${className}`}>
      <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
      <div className="flex items-end gap-2 h-40">
        {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Full dashboard skeleton  -  4 stat cards + table + chart.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
}

/**
 * Billing page skeleton.
 */
export function BillingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkeletonCard className="max-w-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={3} />
    </div>
  );
}
