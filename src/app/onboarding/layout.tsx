import { UniversalNavbar } from "@/components/layout/UniversalNavbar";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Determine name for navbar
  const name = user?.user_metadata?.full_name || "My Business";

  return (
    <div className="min-h-screen bg-black">
      <UniversalNavbar 
        tenantName={name}
        userEmail={user?.email}
        userAvatar={user?.user_metadata?.avatar_url}
      />
      <div className="pt-20"> {/* Add padding for fixed navbar */}
        {children}
      </div>
    </div>
  );
}
