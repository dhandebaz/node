import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
      redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
