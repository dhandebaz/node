
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("voice_agents")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    
    // Return empty agent if not found
    return NextResponse.json(data || { provider: 'vapi', status: 'inactive' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, ...updates } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    
    // Check if agent exists
    const { data: existing } = await supabase
      .from("voice_agents")
      .select("id")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from("voice_agents")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("voice_agents")
        .insert({
          ...updates,
          tenant_id: tenantId,
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
