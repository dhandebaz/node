import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { jsPDF } from "jspdf";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, signatureBase64 } = body;

    if (!tenantId || !signatureBase64) {
      return NextResponse.json({ error: "Tenant ID and Signature required" }, { status: 400 });
    }

    // Get Tenant Details for PDF
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, address, tax_id")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Zero-Liability Agreement", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Between Nodebase and ${tenant.name}`, 20, 30);
    doc.text(`Address: ${tenant.address || "N/A"}`, 20, 40);
    doc.text(`Tax ID: ${tenant.tax_id || "N/A"}`, 20, 50);
    
    doc.text("By signing this document, the Business agrees to the Terms of Service.", 20, 70);
    doc.text("Nodebase is not liable for any operational losses.", 20, 80);
    
    doc.text(`Signed by User: ${user.email}`, 20, 100);
    doc.text(`Date: ${new Date().toISOString()}`, 20, 110);
    doc.text(`IP: ${req.headers.get("x-forwarded-for") || "unknown"}`, 20, 120);
    
    // Add Signature Image
    if (signatureBase64) {
       doc.addImage(signatureBase64, "PNG", 20, 130, 50, 20);
    }
    
    const pdfBuffer = doc.output("arraybuffer");
    const filename = `tos-${crypto.randomUUID()}.pdf`;
    const storagePath = `/legal/${tenantId}/${filename}`;

    // Mock Storage Upload (Assume success and path is valid)
    // await storage.upload(storagePath, pdfBuffer);

    // Update Tenant Status
    const { error } = await admin
      .from("tenants")
      .update({
        legal_agreement_path: storagePath,
        kyc_status: "verified",
        kyc_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire Webhook (Mock)
    console.log(`[Webhook] Account verified for tenant ${tenantId}`);

    return NextResponse.json({ success: true, redirectUrl: "/dashboard" });
  } catch (error: any) {
    console.error("Agreement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
