import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const resolveUploadsDir = () => path.join(process.cwd(), "tmp", "guest-ids");

const ensureUploadsDir = async () => {
  const dir = resolveUploadsDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const saveFile = async (file: File, prefix: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type?.split("/")[1] || "jpg";
  const filename = `${prefix}-${randomUUID()}.${ext}`;
  const dir = await ensureUploadsDir();
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: record, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, guest_name, id_type, status")
      .eq("upload_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: "Link expired" }, { status: 404 });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("start_date, end_date, listing_id, listings(name, title)")
      .eq("id", record.booking_id)
      .maybeSingle();

    return NextResponse.json({
      id: record.id,
      bookingId: record.booking_id,
      guestName: record.guest_name,
      idType: record.id_type,
      status: record.status,
      listingName: booking?.listings?.name || booking?.listings?.title || "Property",
      checkIn: booking?.start_date,
      checkOut: booking?.end_date
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load upload info" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token")?.toString();
    const frontImage = formData.get("frontImage");
    const backImage = formData.get("backImage");

    if (!token || !(frontImage instanceof File)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: record, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, id_type")
      .eq("upload_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: "Link expired" }, { status: 404 });
    }

    const frontPath = await saveFile(frontImage, `${record.id}-front`);
    const backPath = backImage instanceof File ? await saveFile(backImage, `${record.id}-back`) : null;

    const { error: updateError } = await supabase
      .from("guest_ids")
      .update({
        status: "submitted",
        uploaded_at: new Date().toISOString(),
        front_image_path: frontPath,
        back_image_path: backPath,
        upload_token: null
      })
      .eq("id", record.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase
      .from("bookings")
      .update({ id_status: "submitted" })
      .eq("id", record.booking_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to upload ID" }, { status: 500 });
  }
}
