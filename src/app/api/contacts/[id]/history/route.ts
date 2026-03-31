import { NextRequest, NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { ContactService } from "@/lib/services/contactService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await requireActiveTenant();

    const messages = await ContactService.getContactHistory(tenantId, id, 100);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Get contact history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
