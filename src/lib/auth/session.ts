import { getSupabaseServer } from "@/lib/supabase/server";

export async function getSession() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Return a shape compatible with the old session object
    // to minimize refactoring churn
    return {
      userId: user.id,
      role: user.user_metadata?.role || "customer",
      email: user.email,
      // Add other fields if necessary
    };
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  try {
    const supabase = await getSupabaseServer();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
