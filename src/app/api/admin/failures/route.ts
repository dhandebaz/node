import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();
    const { data: failures, error } = await supabase
      .from("failures")
      .select(`
        *,
        tenants (
          name
        )
      `)
      .eq("is_active", true)
      .order("severity", { ascending: false }) // Critical first
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ failures });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load failures" }, { status: 500 });
  }
}
