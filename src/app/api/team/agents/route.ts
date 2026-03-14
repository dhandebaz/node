
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from("team_agents")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("team_agents")
      .insert({
        ...body,
        tenant_id: tenantId,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
