import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const viewer = session?.userId
    ? {
        authenticated: true,
        email: session.email ?? null,
        dashboardHref:
          session.role === "superadmin" ? "/admin" : "/dashboard/ai",
      }
    : null;

  return (
    <div className="public-site public-shell flex min-h-screen flex-col">
      <Header viewer={viewer} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
