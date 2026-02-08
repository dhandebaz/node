import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();
  const supabase = await getSupabaseServer();
  const listingId = params.id;

  const updatePayload: Record<string, any> = {};
  if (updates.name !== undefined) {
    updatePayload.name = updates.name;
    updatePayload.title = updates.name;
  }
  if (updates.city !== undefined) {
    updatePayload.city = updates.city;
    updatePayload.location = updates.city;
  }
  if (updates.type !== undefined) updatePayload.listing_type = updates.type;
  if (updates.timezone !== undefined) updatePayload.timezone = updates.timezone;
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.internalNotes !== undefined) updatePayload.internal_notes = updates.internalNotes;

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId)
    .eq("host_id", session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: listingId,
    userId: session.userId,
    name: updates.name,
    city: updates.city,
    type: updates.type,
    timezone: updates.timezone,
    status: updates.status,
    internalNotes: updates.internalNotes
  });
}
