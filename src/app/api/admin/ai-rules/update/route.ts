import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rules = body?.rules;

    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update rules" }, { status: 500 });
  }
}
