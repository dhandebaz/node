import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/userService";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let user = null;

  if (session?.userId) {
    const users = await userService.getUsers();
    user = users.find(u => u.identity.id === session.userId) || null;
  }

  return (
    <>
      <Header user={user} />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
