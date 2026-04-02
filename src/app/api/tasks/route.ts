import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get("tenant_id");
    const listing_id = searchParams.get("listing_id");
    const status = searchParams.get("status");

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("due_date", { ascending: true });

    if (listing_id) {
      query = query.eq("listing_id", listing_id);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, listing_id, booking_id, title, description, type, priority, assigned_to, due_date } = body;

    if (!tenant_id || !listing_id || !title || !type || !due_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        tenant_id,
        listing_id,
        booking_id,
        title,
        description,
        type,
        priority: priority || "normal",
        status: "pending",
        assigned_to,
        due_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}