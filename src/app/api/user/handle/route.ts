import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { handle, tenantId } = body;

    if (!handle || !tenantId) {
      return NextResponse.json({ error: "Handle and Tenant ID required" }, { status: 400 });
    }

    // Validate format: 3-30 chars, lowercase, alphanumeric + hyphen
    if (!/^[a-z0-9-]{3,30}$/.test(handle)) {
        return NextResponse.json({ error: "Invalid handle format" }, { status: 400 });
    }

    // Check availability
    const { data: existing } = await admin
      .from("tenants")
      .select("id")
      .eq("username", handle)
      .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: "Handle taken" }, { status: 409 });
    }

    // Verify ownership
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== 'owner') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin
      .from("tenants")
      .update({
        username: handle,
        updated_at: new Date().toISOString()
      })
      .eq("id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: `https://nodebase.co/@${handle}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
