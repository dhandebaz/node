import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    
    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin (this query should be cached or optimized in a real app)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || !['admin', 'superadmin'].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2. Parse Query Params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const tenantId = searchParams.get("tenant_id");
    const actorType = searchParams.get("actor_type");
    const eventType = searchParams.get("event_type");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // 3. Build Query
    let query = supabase
      .from("audit_events")
      .select(`
        *,
        tenants ( name ),
        users:actor_id ( email, full_name )
      `, { count: 'exact' });

    if (tenantId) query = query.eq("tenant_id", tenantId);
    if (actorType) query = query.eq("actor_type", actorType);
    if (eventType) query = query.eq("event_type", eventType);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order("created_at", { ascending: false })
      .range(from, to);

    // 4. Execute
    const { data: events, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Transform/Redact
    // "PART 7 — PRIVACY & REDACTION RULES"
    // We should ensure sensitive data isn't leaked.
    // However, this is the ADMIN view. Admins usually need to see details.
    // But "Do NOT store raw messages... Do NOT store payment details".
    // Assuming the *storage* layer (logEvent callers) handled redaction, we can return metadata as is.
    // But let's be safe and mask sensitive keys if they exist in metadata?
    // For now, pass through.

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
