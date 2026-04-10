import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const [{ data: profile }, { data: tenant }, { data: account }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase
        .from("tenants")
        .select(
          "id, name, address, tax_id, phone, timezone, username, kyc_status, pan_number, aadhaar_number, kyc_verified_at",
        )
        .eq("id", tenantId)
        .single(),
      supabase
        .from("omni_accounts")
        .select("wallet_balance")
        .eq("tenant_id", tenantId)
        .maybeSingle(),
    ]);

  const response = {
    user: {
      id: user.id,
      name: profile?.full_name || user.user_metadata?.full_name || "User",
      email: user.email || "",
      phone: user.phone || "",
      address: tenant?.address || "",
    },
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          address: tenant.address,
          tax_id: tenant.tax_id,
          phone: tenant.phone,
          timezone: tenant.timezone,
          username: tenant.username,
          kyc_status: tenant.kyc_status,
          pan_number: tenant.pan_number,
          aadhaar_number: tenant.aadhaar_number,
          kyc_verified_at: tenant.kyc_verified_at,
        }
      : null,
    host: {
      id: user.id,
      name: profile?.full_name || user.user_metadata?.full_name || "User",
      email: user.email || "",
      address: tenant?.address || "",
      kycStatus: tenant?.kyc_status || "not_started",
      walletBalance: account?.wallet_balance || 0,
      businessName: tenant?.name || profile?.business_name || "",
    },
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
