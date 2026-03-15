import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "application/pdf": "pdf",
  };
  return map[mimeType] || "bin";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: guestId } = await params;
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();

    // Verify Guest exists and belongs to tenant
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("id, name")
      .eq("id", guestId)
      .eq("tenant_id", tenantId)
      .single();

    if (guestError || !guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const frontImage = formData.get("frontImage") as File | null;
    const backImage = formData.get("backImage") as File | null;
    const documentType = formData.get("documentType") as string | null;

    if (!frontImage || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields: frontImage and documentType" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(frontImage.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${frontImage.type}. Allowed: JPEG, PNG, WEBP, HEIC, PDF`,
        },
        { status: 415 },
      );
    }

    if (frontImage.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Front image exceeds 10 MB limit" },
        { status: 413 },
      );
    }

    const timestamp = Date.now();
    const uploadedPaths: { side: string; path: string }[] = [];

    // Upload front image
    const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
    const frontExt = getExtension(frontImage.type);
    const frontPath = `secure/ids/${tenantId}/${guestId}/${timestamp}_front.${frontExt}`;

    const { error: frontUploadError } = await supabase.storage
      .from("ids")
      .upload(frontPath, frontBuffer, {
        contentType: frontImage.type,
        upsert: false,
      });

    if (frontUploadError) {
      console.error("Front image upload error:", frontUploadError);
      return NextResponse.json(
        { error: `Failed to upload front image: ${frontUploadError.message}` },
        { status: 500 },
      );
    }

    uploadedPaths.push({ side: "front", path: frontPath });

    // Upload back image if provided
    let backPath: string | null = null;
    if (backImage && backImage.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(backImage.type)) {
        return NextResponse.json(
          { error: `Unsupported file type for back image: ${backImage.type}` },
          { status: 415 },
        );
      }
      if (backImage.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Back image exceeds 10 MB limit" },
          { status: 413 },
        );
      }

      const backBuffer = Buffer.from(await backImage.arrayBuffer());
      const backExt = getExtension(backImage.type);
      backPath = `secure/ids/${tenantId}/${guestId}/${timestamp}_back.${backExt}`;

      const { error: backUploadError } = await supabase.storage
        .from("ids")
        .upload(backPath, backBuffer, {
          contentType: backImage.type,
          upsert: false,
        });

      if (backUploadError) {
        console.error("Back image upload error:", backUploadError);
        // Clean up front image since the overall operation failed
        await supabase.storage.from("ids").remove([frontPath]);
        return NextResponse.json(
          { error: `Failed to upload back image: ${backUploadError.message}` },
          { status: 500 },
        );
      }

      uploadedPaths.push({ side: "back", path: backPath });
    }

    // Persist document record
    const { error: docInsertError } = await supabase
      .from("guest_id_documents")
      .insert({
        tenant_id: tenantId,
        guest_id: guestId,
        document_type: documentType,
        front_path: frontPath,
        back_path: backPath,
        status: "submitted",
        created_at: new Date().toISOString(),
      });

    // If the table doesn't exist yet, fall back gracefully — status update still proceeds
    if (docInsertError) {
      console.warn(
        "guest_id_documents insert warning (table may not exist yet):",
        docInsertError.message,
      );
    }

    // Update Guest Status
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        id_verification_status: "submitted",
        id_document_path: frontPath,
        id_document_type: documentType,
        id_submitted_at: new Date().toISOString(),
      })
      .eq("id", guestId)
      .eq("tenant_id", tenantId);

    if (updateError) {
      console.error("Guest status update error:", updateError);
      // Clean up uploaded files since the overall operation failed
      const paths = uploadedPaths.map((u) => u.path);
      await supabase.storage.from("ids").remove(paths);
      return NextResponse.json(
        { error: "Failed to update guest verification status" },
        { status: 500 },
      );
    }

    // Log Event
    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      event_type: EVENT_TYPES.ID_SUBMITTED,
      entity_type: "guest",
      entity_id: guestId,
      metadata: {
        documentType,
        frontPath,
        backPath,
        hasBothSides: !!backPath,
      },
    });

    return NextResponse.json({
      success: true,
      status: "submitted",
      guestId,
      frontPath,
      backPath,
    });
  } catch (error: any) {
    console.error("Upload ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
