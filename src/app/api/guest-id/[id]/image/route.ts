import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { readEncryptedImage } from "@/lib/guestIdStorage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const side = request.nextUrl.searchParams.get("side") || "front";

    const { data: guestId, error } = await supabase
      .from("guest_ids")
      .select("id, front_image_path, back_image_path, bookings!inner(listings!inner(host_id))")
      .eq("id", id)
      .eq("bookings.listings.host_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!guestId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath = side === "back" ? guestId.back_image_path : guestId.front_image_path;
    if (!filePath) {
      return NextResponse.json({ error: "Image not available" }, { status: 404 });
    }

    const { mimeType, data } = await readEncryptedImage(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeType || "image/jpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load image" }, { status: 500 });
  }
}
