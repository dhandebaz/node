import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/runtime-config";

export async function GET() {
  const start = Date.now();
  const status: {
    status: string;
    timestamp: string;
    services: {
      database: string;
      razorpay: string;
    };
    duration_ms?: number;
    error?: string;
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      razorpay: "unknown",
    },
  };

  try {
    // 1. Database Check
    const supabase = await getSupabaseAdmin();
    const { error: dbError } = await supabase
      .from("tenants")
      .select("id")
      .limit(1);

    if (dbError) {
      status.services.database = "unhealthy";
      status.status = "degraded";
      log.error("Health check failed: Database unreachable", dbError);
    } else {
      status.services.database = "healthy";
    }

    // 2. Razorpay Check (Simple ping/fetch check)
    const razorpayKeyId = getRazorpayKeyId();
    const razorpayKeySecret = getRazorpayKeySecret();

    if (!razorpayKeyId || !razorpayKeySecret) {
      status.services.razorpay = "unhealthy";
      status.status = "degraded";
      log.warn("Health check: Razorpay credentials are not configured");
    } else {
      try {
        const rzpResponse = await fetch("https://api.razorpay.com/v1/plans", {
          headers: {
            Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
          },
        });
        if (rzpResponse.ok) {
          status.services.razorpay = "healthy";
        } else {
          status.services.razorpay = "unhealthy";
          status.status = "degraded";
          log.warn("Health check: Razorpay API returned non-OK status", {
            status: rzpResponse.status,
          });
        }
      } catch (rzpError) {
        status.services.razorpay = "unhealthy";
        status.status = "degraded";
        log.error(
          "Health check failed: Razorpay unreachable",
          rzpError as Error,
        );
      }
    }

    const duration = Date.now() - start;
    status.duration_ms = duration;

    return NextResponse.json(status, {
      status: status.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    log.error("Critical health check failure", error as Error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
