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
    <div className="min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 font-sans bg-grid-pattern flex flex-col">
      <UniversalNavbar 
        tenantName={name}
        userEmail={user?.email}
        userAvatar={user?.user_metadata?.avatar_url}
      />
      <div className="pt-16 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
