import { NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
import { rateLimit } from "@/lib/ratelimit";
import { withErrorHandler } from "@/lib/api/withErrorHandler";

/**
 * Camera ingest endpoint
 *
 * Accepts JSON:
 * {
 *   cameraId: string,             // required
 *   frameRef?: string,            // optional reference (if already uploaded)
 *   base64Frame?: string,         // optional base64-encoded image payload (data only)
 *   filename?: string,            // optional filename when uploading base64Frame
 *   sizeBytes?: number,           // optional size hint
 *   metadata?: object             // optional metadata (json)
 * }
 *
 * If `base64Frame` is provided, this endpoint will attempt to store it in
 * Supabase Storage (bucket: `camera_frames`) under a tenant-scoped path and
 * persist a record in `camera_sessions`.
 *
 * The endpoint requires an authenticated tenant (requireActiveTenant).
 */

export const POST = withErrorHandler(async function(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`eyes_ingest_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const tenantId = await requireActiveTenant();

    // parse JSON body
    const body = await req.json().catch(() => ({}) as any);

    const cameraId: string | undefined = body?.cameraId;
    if (!cameraId || typeof cameraId !== "string") {
      return NextResponse.json(
        { error: "cameraId is required" },
        { status: 400 },
      );
    }

    const base64Frame: string | undefined = body?.base64Frame;
    const suppliedFrameRef: string | undefined = body?.frameRef;
    const filename: string | undefined = body?.filename;
    const sizeBytes: number | undefined = body?.sizeBytes;
    const metadata: any = body?.metadata ?? null;

    const supabase = await getSupabaseAdmin();

    let frameRefToStore: string | null = null;
    let finalSizeBytes: number | null = null;
    let ingestionId: string | null = null;

    // If a base64 frame is provided, upload to Supabase Storage
    if (base64Frame && typeof base64Frame === "string") {
      // Strip data prefix if present: "data:image/jpeg;base64,..."
      const match = base64Frame.match(/^data:(.+?);base64,(.+)$/);
      let contentType = "application/octet-stream";
      let base64Data = base64Frame;
      if (match) {
        contentType = match[1] || contentType;
        base64Data = match[2];
      } else if (filename && filename.endsWith(".jpg")) {
        contentType = "image/jpeg";
      } else if (filename && filename.endsWith(".png")) {
        contentType = "image/png";
      }

      const buffer = Buffer.from(base64Data, "base64");
      finalSizeBytes = buffer.byteLength;

      // Choose a simple, tenant-scoped path
      const nowIso = new Date().toISOString().replace(/[:.]/g, "-");
      const id = cryptoRandomId();
      const safeName = sanitizeFilename(
        filename ?? `${cameraId}_${nowIso}.jpg`,
      );
      const objectPath = `camera_frames/${tenantId}/${cameraId}/${nowIso}_${id}_${safeName}`;

      // Attempt upload to Supabase Storage bucket `camera_frames`
      // Note: ensure the bucket `camera_frames` exists in your Supabase project.
      const uploadRes = await supabase.storage
        .from("camera_frames")
        .upload(objectPath, buffer, {
          contentType,
          upsert: false,
        });

      if (uploadRes.error) {
        // If upload failed, return error
        return NextResponse.json(
          {
            error: "Failed to upload frame to storage",
            details: uploadRes.error.message,
          },
          { status: 500 },
        );
      }

      // Construct a reference that consumers can use (storage path)
      frameRefToStore = objectPath;
      ingestionId = id;
    }

    // If the client provided a frameRef (already uploaded elsewhere), prefer that
    if (!frameRefToStore && suppliedFrameRef) {
      frameRefToStore = suppliedFrameRef;
    }

    // If neither frameRef nor base64 provided, that's acceptable  -  we still create a session row
    // with minimal metadata (useful for event-only ingests).
    const payload = {
      camera_id: cameraId,
      tenant_id: tenantId,
      ingestion_id: ingestionId,
      frame_ref: frameRefToStore,
      size_bytes: finalSizeBytes ?? sizeBytes ?? null,
      status: "ingested",
      metadata: metadata as any,
      processed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert into camera_sessions table
    const insertRes = await supabase.from("camera_sessions").insert(payload);

    if (insertRes.error) {
      return NextResponse.json(
        {
          error: "Failed to persist camera session",
          details: insertRes.error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cameraId,
      frameRef: frameRefToStore,
      ingestionId,
    });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

/* Helpers */

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function cryptoRandomId() {
  // Use crypto.randomUUID when available; fallback to random hex
  try {
    // @ts-ignore - runtime may provide crypto.randomUUID
    if (typeof globalThis.crypto?.randomUUID === "function") {
      // @ts-ignore
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  // Fallback
  return Math.random().toString(36).slice(2, 10);
}
