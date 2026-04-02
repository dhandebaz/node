import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { response_text } = body;

    if (!response_text) {
      return NextResponse.json({ error: "Response text required" }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .update({
        response_text,
        responded_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error responding to review:", error);
    return NextResponse.json({ error: "Failed to respond to review" }, { status: 500 });
  }
}