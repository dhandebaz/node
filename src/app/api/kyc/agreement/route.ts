import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, signatureBase64 } = body;
    const resolvedTenantId =
      (typeof tenantId === "string" && tenantId) || (await requireActiveTenant());

    if (!signatureBase64) {
      return NextResponse.json({ error: "Signature required" }, { status: 400 });
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, address, tax_id")
      .eq("id", resolvedTenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const signerEmail = user.email || null;
    const signerIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const signerUserAgent = req.headers.get("user-agent") || "unknown";
    const signedAtIso = new Date().toISOString();

    const nodebaseEntityName =
      process.env.NODEBASE_LEGAL_ENTITY_NAME || "Nodebase";
    const nodebaseEntityAddress = process.env.NODEBASE_LEGAL_ENTITY_ADDRESS || "";
    const governingLaw = process.env.NODEBASE_GOVERNING_LAW || "India";
    const jurisdiction = process.env.NODEBASE_JURISDICTION || "India";
    const agreementVersion = process.env.NODEBASE_TOS_VERSION || "2026-03-15";

    const agreementBody = [
      "ZERO-LIABILITY & PLATFORM TERMS ACKNOWLEDGEMENT",
      "",
      `This Agreement is entered into on ${signedAtIso} ("Effective Date") between:`,
      "",
      `1) ${nodebaseEntityName}${nodebaseEntityAddress ? `, ${nodebaseEntityAddress}` : ""} ("Nodebase")`,
      "and",
      `2) ${tenant.name}${tenant.address ? `, ${tenant.address}` : ""}${tenant.tax_id ? `, Tax ID: ${tenant.tax_id}` : ""} ("Business").`,
      "",
      "1. Purpose",
      "Nodebase provides a software platform for AI employees, automation, and digital infrastructure. The Business acknowledges that Nodebase provides tools and not professional services.",
      "",
      "2. No Liability / No Warranties",
      "The Business agrees that Nodebase is not liable for any operational losses, missed bookings, revenue loss, disputes, chargebacks, penalties, service outages, or third-party platform actions arising from the use of the platform, except as mandated by applicable law.",
      "",
      "3. Business Responsibility",
      "The Business is solely responsible for the accuracy of business details, compliance obligations (including local check-in/KYC requirements), and decisions taken based on AI outputs. AI outputs are probabilistic and may be incorrect.",
      "",
      "4. Data & Security",
      "The Business authorizes Nodebase to store documents and related metadata securely for verification and compliance workflows. Access is restricted and governed by role-based controls and tenant isolation.",
      "",
      "5. Governing Law & Jurisdiction",
      `This Agreement shall be governed by the laws of ${governingLaw}. Courts at ${jurisdiction} shall have exclusive jurisdiction.`,
      "",
      "6. Terms Version",
      `This Agreement references Nodebase Terms version: ${agreementVersion}.`,
      "",
      "7. Acceptance",
      "By signing below, the Business confirms acceptance of this Agreement and authorizes Nodebase to generate and store a signed PDF record.",
      "",
      `Signed By (User): ${signerEmail || "unknown"}`,
      `IP Address: ${signerIp}`,
      `User Agent: ${signerUserAgent}`,
      `Tenant ID: ${resolvedTenantId}`,
    ].join("\n");

    const doc = new jsPDF();
    doc.setProperties({
      title: `Nodebase Agreement - ${tenant.name}`,
      subject: `Agreement v${agreementVersion}`,
      author: nodebaseEntityName,
      creator: nodebaseEntityName,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 18;
    const marginY = 18;
    const maxWidth = pageWidth - marginX * 2;
    const lines = doc.splitTextToSize(agreementBody, maxWidth);

    let y = marginY;
    const lineHeight = 6;
    for (const line of lines) {
      if (y + lineHeight > pageHeight - marginY) {
        doc.addPage();
        y = marginY;
      }
      doc.text(String(line), marginX, y);
      y += lineHeight;
    }

    if (y + 30 > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }

    doc.setFontSize(12);
    doc.text("Signature:", marginX, y + 8);
    try {
      doc.addImage(signatureBase64, "PNG", marginX, y + 12, 70, 28);
    } catch {
      doc.setFontSize(10);
      doc.text("Signature image could not be embedded.", marginX, y + 18);
    }

    const pdfBuffer = doc.output("arraybuffer");
    const pdfBytes = Buffer.from(pdfBuffer);
    const sha256 = createHash("sha256").update(pdfBytes).digest("hex");
    const filename = `agreement-${agreementVersion}-${crypto.randomUUID()}.pdf`;
    const storagePath = `legal/${resolvedTenantId}/${filename}`;

    const { error: uploadError } = await admin.storage
      .from("legal")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Failed to store agreement" },
        { status: 500 },
      );
    }

    const { error: tenantError } = await admin
      .from("tenants")
      .update({
        legal_agreement_path: storagePath,
        kyc_status: "verified",
        kyc_verified_at: new Date().toISOString(),
      })
      .eq("id", resolvedTenantId);

    if (tenantError) {
      return NextResponse.json({ error: tenantError.message }, { status: 500 });
    }

    const { error: insertError } = await admin
      .from("tenant_legal_agreements")
      .insert({
        tenant_id: resolvedTenantId,
        user_id: user.id,
        version: agreementVersion,
        file_path: storagePath,
        sha256,
        signer_email: signerEmail,
        signer_ip: signerIp,
        signer_user_agent: signerUserAgent,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to record agreement" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, redirectUrl: "/dashboard" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    if (message.includes("Active Tenant Context Missing")) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
