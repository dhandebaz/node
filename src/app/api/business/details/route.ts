import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, taxId, address, phone, timezone, tenantId } = body;
    const resolvedTenantId: string =
      (typeof tenantId === "string" && tenantId ? tenantId : null) ||
      (await requireActiveTenant());

    if (!name || !address || !phone || !timezone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedTaxId = typeof taxId === "string" ? taxId.trim().toUpperCase() : "";
    if (normalizedTaxId) {
      const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedTaxId);
      const isGstin = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(normalizedTaxId);
      if (!isPan && !isGstin) {
        return NextResponse.json({ error: "Invalid PAN/GSTIN format" }, { status: 400 });
      }
    }

    // Verify user owns tenant
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", resolvedTenantId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin
      .from("tenants")
      .update({
        name,
        tax_id: normalizedTaxId || null,
        address,
        phone,
        timezone,
        updated_at: new Date().toISOString()
      })
      .eq("id", resolvedTenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (String(error?.message || "").includes("Active Tenant Context Missing")) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
