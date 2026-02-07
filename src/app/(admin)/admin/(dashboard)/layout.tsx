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
    <div className="min-h-screen bg-[var(--color-brand-red)] text-white font-sans flex flex-col md:flex-row selection:bg-white selection:text-[var(--color-brand-red)]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
