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
    <div className="flex h-screen overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* Main Content Canvas (Scrollable independently) */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8 relative custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
