import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { redis } from "@/lib/cache/redis";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const allKeys = await redis.keys("*");
    
    const rateLimitKeys = allKeys.filter(k => 
      k.includes("ratelimit") || k.includes("sliding") || k.includes("fixed")
    );

    const endpoints: Record<string, { limit: number; remaining: number; reset: number }> = {};
    
    for (const key of rateLimitKeys.slice(0, 20)) {
      try {
        const data = await redis.get<{ limit: number; remaining: number; reset: number }>(key);
        if (data) {
          const endpoint = key.replace(/^@upstash:ratelimit:/, "").replace(/:.*$/, "");
          endpoints[endpoint] = data;
        }
      } catch {
        // Skip invalid keys
      }
    }

    const now = Date.now();
    const recentBlocks = rateLimitKeys.filter(k => {
      return k.includes("blocked") || k.includes("denied");
    }).length;

    return NextResponse.json({
      config: {
        default_limit: "10 requests per 10 seconds",
        analytics_enabled: true,
      },
      endpoints,
      recent_blocks: recentBlocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching rate limit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate limit stats" },
      { status: 500 }
    );
  }
}
