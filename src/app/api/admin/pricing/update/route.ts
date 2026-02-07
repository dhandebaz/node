import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AiManager } from "@/types/ai-managers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, baseMonthlyPrice, status } = body || {};
    if (!slug || typeof baseMonthlyPrice !== "number" || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: existing, error: existingError } = await supabase
      .from("ai_managers")
      .select("base_monthly_price")
      .eq("slug", slug)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("ai_managers")
      .update({
        base_monthly_price: baseMonthlyPrice,
        status: status as AiManager["status"],
        updated_at: new Date().toISOString()
      })
      .eq("slug", slug)
      .select("slug, name, audience, responsibility, status, base_monthly_price, integrations, features, updated_at")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Update failed" }, { status: 500 });
    }

    const { data: authData } = await supabase.auth.getUser();
    await supabase.from("ai_manager_pricing_history").insert({
      manager_slug: slug,
      old_price: Number(existing.base_monthly_price || 0),
      new_price: baseMonthlyPrice,
      changed_by: authData?.user?.id || null,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      slug: updated.slug,
      name: updated.name,
      status: updated.status,
      baseMonthlyPrice: Number(updated.base_monthly_price || 0),
      audience: updated.audience || "",
      responsibility: updated.responsibility || "",
      integrations: updated.integrations || [],
      features: updated.features || [],
      updatedAt: updated.updated_at || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Request failed" }, { status: 500 });
  }
}
