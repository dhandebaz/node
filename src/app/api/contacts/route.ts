import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { ContactService } from "@/lib/services/contactService";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (search) {
      const contacts = await ContactService.searchContacts(tenantId, search, limit);
      return NextResponse.json({ contacts });
    }

    const supabase = await getSupabaseServer();
    
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select(`
        *,
        guest_identifiers(identifier_type, identifier_value, channel, last_seen_at),
        guests(id, name, phone)
      `)
      .eq("tenant_id", tenantId)
      .order("last_seen_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (contacts || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      tags: c.tags || [],
      notes: c.notes,
      customerType: c.customer_type,
      lifetimeValue: c.lifetime_value,
      channels: [...new Set(c.guest_identifiers?.map((i: any) => i.channel) || [])],
      identifiers: c.guest_identifiers || [],
      totalBookings: 0,
      totalSpent: 0,
      firstSeenAt: c.first_seen_at,
      lastSeenAt: c.last_seen_at
    }));

    return NextResponse.json({ contacts: formatted });
  } catch (error: any) {
    console.error("Get contacts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
