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
    const supabase = await (await import("@/lib/supabase/server")).getSupabaseServer();

    const contact = await ContactService.getContactProfile(supabase, tenantId, id);
    
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const { data: identifiers } = await supabase
      .from("guest_identifiers")
      .select("identifier_type, identifier_value, channel, last_seen_at")
      .eq("contact_id", id)
      .order("last_seen_at", { ascending: false });

    return NextResponse.json({ 
      contact: { ...contact, identifiers: identifiers || [] },
      identifiers 
    });
  } catch (error: any) {
    console.error("Get contact error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await requireActiveTenant();
    const supabase = await (await import("@/lib/supabase/server")).getSupabaseServer();
    const body = await request.json();

    if (body.tags !== undefined) {
      await ContactService.updateTags(tenantId, id, body.tags);
    }

    if (body.notes !== undefined) {
      await ContactService.updateNotes(tenantId, id, body.notes);
    }

    if (body.customerType !== undefined) {
      await supabase
        .from("contacts")
        .update({ customer_type: body.customerType })
        .eq("id", id)
        .eq("tenant_id", tenantId);
    }

    const updatedContact = await ContactService.getContactProfile(supabase, tenantId, id);
    
    const { data: identifiers } = await supabase
      .from("guest_identifiers")
      .select("identifier_type, identifier_value, channel, last_seen_at")
      .eq("contact_id", id)
      .order("last_seen_at", { ascending: false });

    return NextResponse.json({ 
      contact: updatedContact ? { ...updatedContact, identifiers: identifiers || [] } : null 
    });
  } catch (error: any) {
    console.error("Update contact error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
