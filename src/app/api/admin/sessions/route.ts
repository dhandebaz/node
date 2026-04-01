import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { redis } from "@/lib/cache/redis";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = await getSupabaseAdmin();
    const allKeys = await redis.keys("*");

    const sessionKeys = allKeys.filter(k => 
      k.startsWith("nodebase:user:") && k.includes(":tenant")
    );

    const sessions: Array<{
      user_id: string;
      tenant_id: string | null;
      last_activity: string;
    }> = [];

    for (const key of sessionKeys.slice(0, 50)) {
      try {
        const data = await redis.get<{ tenantId?: string; userId?: string }>(key);
        if (data) {
          const userId = key.replace("nodebase:user:", "").replace(":tenant", "");
          sessions.push({
            user_id: data.userId || userId,
            tenant_id: data.tenantId || null,
            last_activity: new Date().toISOString(),
          });
        }
      } catch {
        // Skip invalid keys
      }
    }

    const { data: activeUsers } = await supabase
      .from("users")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      active_sessions: sessions.length,
      sessions,
      recent_users: activeUsers || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching session data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { user_id, action } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    if (action === "logout") {
      const sessionKey = `nodebase:user:${user_id}:tenant`;
      await redis.del(sessionKey);
      
      return NextResponse.json({
        success: true,
        message: `Session cleared for user ${user_id}`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error managing session:", error);
    return NextResponse.json(
      { error: "Failed to manage session" },
      { status: 500 }
    );
  }
}
