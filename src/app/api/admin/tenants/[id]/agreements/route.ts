import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const admin = await getSupabaseAdmin();
    const { id: tenantId } = await params;

    const { data: agreements, error } = await admin
      .from("tenant_legal_agreements")
      .select("id, tenant_id, user_id, version, file_path, sha256, signed_at, signer_email, signer_ip")
      .eq("tenant_id", tenantId)
      .order("signed_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withUrls = await Promise.all(
      (agreements || []).map(async (a) => {
        const { data: signed } = await admin.storage.from("legal").createSignedUrl(a.file_path, 60);
        return {
          ...a,
          filename: a.file_path.split("/").pop() || "agreement.pdf",
          url: signed?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ agreements: withUrls }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch agreements" }, { status: 500 });
  }
}

