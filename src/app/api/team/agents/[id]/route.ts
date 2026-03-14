
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("team_agents")
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();

    const { error } = await supabase
      .from("team_agents")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
