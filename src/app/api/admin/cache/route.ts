import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { redis } from "@/lib/cache/redis";

const KEY_PATTERNS = [
  { pattern: "nodebase:user:*", label: "User Sessions" },
  { pattern: "meta:*", label: "Meta Pages" },
  { pattern: "wa_msg_id:*", label: "WhatsApp Messages" },
  { pattern: "meta_msg_id:*", label: "Meta Messages" },
];

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const allKeys = await redis.keys("*");
    
    const patternCounts = KEY_PATTERNS.map((p) => {
      const regex = new RegExp(p.pattern.replace("*", ".*"));
      const count = allKeys.filter((k) => regex.test(k)).length;
      return { pattern: p.pattern, label: p.label, count };
    });

    const userKeys = allKeys.filter((k) => k.startsWith("nodebase:user:")).length;
    const metaKeys = allKeys.filter((k) => k.startsWith("meta:")).length;
    const msgKeys = allKeys.filter((k) => k.includes("_msg_id")).length;

    return NextResponse.json({
      keys: allKeys.length,
      memory_used: "N/A",
      memory_total: "N/A",
      hit_rate: null,
      key_patterns: patternCounts,
      breakdown: {
        user_sessions: userKeys,
        meta_data: metaKeys,
        message_ids: msgKeys,
      },
    });
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch cache stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const { pattern, clear_all } = body;

    if (clear_all) {
      const keys = await redis.keys("*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return NextResponse.json({ success: true, cleared: keys.length });
    }

    if (pattern) {
      const matchingKeys = await redis.keys(pattern);
      if (matchingKeys.length > 0) {
        await redis.del(...matchingKeys);
      }
      return NextResponse.json({ success: true, cleared: matchingKeys.length });
    }

    return NextResponse.json(
      { error: "Please specify pattern or clear_all" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
