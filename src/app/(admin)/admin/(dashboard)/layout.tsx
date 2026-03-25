import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground font-sans flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
