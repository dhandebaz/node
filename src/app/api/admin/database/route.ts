import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type TableName = "tenants" | "users" | "bookings" | "guests" | "contacts" | "conversations" | "messages" | "wallets" | "wallet_transactions" | "system_flags" | "failures" | "system_logs" | "tenant_users" | "integrations";

const ALLOWED_TABLES: TableName[] = [
  "tenants",
  "users",
  "bookings",
  "guests",
  "contacts",
  "conversations",
  "messages",
  "wallets",
  "wallet_transactions",
  "system_flags",
  "failures",
  "system_logs",
  "tenant_users",
  "integrations",
];

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") as TableName | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";

    if (!table) {
      return NextResponse.json(
        { error: "Table parameter is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { error: `Table '${table}' is not allowed` },
        { status: 403 }
      );
    }

    const supabase = await getSupabaseAdmin();

    let query: any;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    switch (table) {
      case "tenants":
        query = supabase.from("tenants").select("*", { count: "exact" });
        break;
      case "users":
        query = supabase.from("users").select("*", { count: "exact" });
        break;
      case "bookings":
        query = supabase.from("bookings").select("*", { count: "exact" });
        break;
      case "guests":
        query = supabase.from("guests").select("*", { count: "exact" });
        break;
      case "contacts":
        query = supabase.from("contacts").select("*", { count: "exact" });
        break;
      case "conversations":
        query = supabase.from("conversations").select("*", { count: "exact" });
        break;
      case "messages":
        query = supabase.from("messages").select("*", { count: "exact" });
        break;
      case "wallets":
        query = supabase.from("wallets").select("*", { count: "exact" });
        break;
      case "wallet_transactions":
        query = supabase.from("wallet_transactions").select("*", { count: "exact" });
        break;
      case "system_flags":
        query = supabase.from("system_flags").select("*", { count: "exact" });
        break;
      case "failures":
        query = supabase.from("failures").select("*", { count: "exact" });
        break;
      case "system_logs":
        query = supabase.from("system_logs").select("*", { count: "exact" });
        break;
      case "tenant_users":
        query = supabase.from("tenant_users").select("*", { count: "exact" });
        break;
      case "integrations":
        query = supabase.from("integrations").select("*", { count: "exact" });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    query = query.range(from, to);

    try {
      query = query.order(sort, { ascending: order === "asc" });
    } catch {
      // Ignore sort errors
    }

    const { data, count, error } = await query;

    if (error) {
      console.error(`Failed to fetch from ${table}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch from ${table}: ${error.message}` },
        { status: 500 }
      );
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

    return NextResponse.json({
      table,
      columns,
      rows: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
