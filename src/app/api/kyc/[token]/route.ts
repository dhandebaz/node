import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const admin = await getSupabaseAdmin();

    const { data, error } = await admin.rpc("get_kyc_request_by_token", {
      p_token: token,
    });

    if (error) {
      log.error("get_kyc_request_by_token RPC failed", error, { token });
      return NextResponse.json(
        { error: "Failed to load verification link" },
        { status: 500 }
      );
    }

    // RPC returns a JSONB object — handle every known error code
    if (data?.success === false) {
      switch (data.code) {
        case "NOT_FOUND":
          return NextResponse.json(
            { error: data.error ?? "This verification link is invalid.", code: "NOT_FOUND" },
            { status: 404 }
          );

        case "TOKEN_EXPIRED":
          return NextResponse.json(
            { error: data.error ?? "This verification link has expired.", code: "TOKEN_EXPIRED" },
            { status: 410 }
          );

        case "ALREADY_COMPLETED":
          // Return 200 so the guest portal can render a friendly "already done" screen
          return NextResponse.json(
            { completed: true, message: data.error ?? "Verification already complete.", code: "ALREADY_COMPLETED" },
            { status: 200 }
          );

        case "REJECTED":
          return NextResponse.json(
            { error: data.error ?? "This verification request has been cancelled.", code: "REJECTED" },
            { status: 403 }
          );

        default:
          log.error("get_kyc_request_by_token returned unknown error", undefined, { data });
          return NextResponse.json(
            { error: data.error ?? "An unexpected error occurred.", code: data.code },
            { status: 500 }
          );
      }
    }

    // Strip the internal `success` flag before sending to the client
    const { success: _success, ...portalData } = data as Record<string, unknown>;

    return NextResponse.json(portalData, { status: 200 });
  } catch (err: any) {
    log.error("GET /api/kyc/[token] failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
