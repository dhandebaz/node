import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ai_monthly_price, ai_message_cost } = body;

    if (typeof ai_monthly_price !== 'number' || typeof ai_message_cost !== 'number') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    
    // We update the 'pricing_rules' key in system_settings
    // First get existing to merge, or just overwrite specific fields if we want strict schema
    const { data: existing } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "pricing_rules")
      .single();

    const currentValue = existing?.value || {};
    
    const newValue = {
      ...(currentValue as any),
      ai_monthly_price,
      ai_message_cost,
      updated_at: new Date().toISOString(),
      updated_by: session.userId
    };

    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "pricing_rules",
        value: newValue,
        updated_at: new Date().toISOString(),
        updated_by: session.userId
      });

    if (error) throw error;

    return NextResponse.json({ success: true, pricing: newValue });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
