
import { userService } from "@/lib/services/userService";
import { UserFilters } from "@/components/admin/UserFilters";
import { AccountStatus, KYCStatus, ProductType } from "@/types/user";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters = {
    search: typeof params.search === "string" ? params.search : undefined,
    product: typeof params.product === "string" ? (params.product as ProductType) : undefined,
    kycStatus: typeof params.kycStatus === "string" ? (params.kycStatus as KYCStatus) : undefined,
    accountStatus: typeof params.accountStatus === "string" ? (params.accountStatus as AccountStatus) : undefined,
  };

  const users = await userService.getUsers(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-zinc-400">Manage unified userbase.</p>
        </div>
        {/* Only Super Admin should see this, currently simulated */}
        <button className="bg-brand-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
          Add User
        </button>
      </div>

      <UserFilters />

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-3">User ID / Identity</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">KYC Status</th>
              <th className="px-6 py-3">Account Status</th>
              <th className="px-6 py-3">Last Activity</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.identity.id} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-white font-medium">{user.identity.id}</span>
                      <span className="text-zinc-500 text-xs">{user.identity.phone}</span>
                      {user.identity.email && (
                        <span className="text-zinc-600 text-xs">{user.identity.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.isKaisaUser && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/20 text-blue-400 border border-blue-900/50 text-xs">kaisa</span>
                      )}
                      {user.roles.isSpaceUser && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-900/20 text-purple-400 border border-purple-900/50 text-xs">space</span>
                      )}
                      {user.roles.isNodeParticipant && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-900/20 text-orange-400 border border-orange-900/50 text-xs">node</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <KYCBadge status={user.status.kyc} />
                  </td>
                  <td className="px-6 py-4">
                    <AccountBadge status={user.status.account} />
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                    {new Date(user.metadata.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/users/${user.identity.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center text-xs text-zinc-500 px-2">
        <span>Showing {users.length} results</span>
        {/* Pagination would go here */}
      </div>
    </div>
  );
}

function KYCBadge({ status }: { status: KYCStatus }) {
  const styles: Record<KYCStatus, string> = {
    verified: "bg-green-900/20 text-green-400 border-green-900/50",
    pending: "bg-yellow-900/20 text-yellow-400 border-yellow-900/50",
    rejected: "bg-red-900/20 text-red-400 border-red-900/50",
    not_started: "bg-zinc-800 text-zinc-500 border-zinc-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border uppercase tracking-wider ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function AccountBadge({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, string> = {
    active: "text-zinc-300",
    suspended: "text-red-400 font-medium",
    blocked: "text-red-600 font-bold",
  };
  return (
    <span className={`text-xs ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
