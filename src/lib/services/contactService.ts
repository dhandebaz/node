import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { Database } from "@/types/supabase";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type GuestIdentifier = Database["public"]["Tables"]["guest_identifiers"]["Row"];

export interface ContactIdentifier {
  type: "phone" | "email" | "whatsapp_id" | "telegram_id" | "instagram_id" | "airbnb_id" | "booking_id" | "other";
  value: string;
}

export interface ContactProfile {
  id: string;
  tenantId: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  preferredName: string | null;
  tags: string[];
  notes: string | null;
  customerType: "prospect" | "lead" | "customer" | "vip";
  lifetimeValue: number;
  channels: string[];
  totalBookings: number;
  totalSpent: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface ResolveContactResult {
  contact: ContactProfile | null;
  isNewContact: boolean;
  wasLinked: boolean;
  linkedChannels: string[];
}

export class ContactService {
  private static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    if (!cleaned.startsWith("+")) {
      return `+${cleaned}`;
    }
    return cleaned;
  }

  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static async resolveContact(
    tenantId: string,
    identifiers: ContactIdentifier[],
    profile?: { name?: string; ip?: string; userAgent?: string }
  ): Promise<ResolveContactResult> {
    const supabase = await getSupabaseAdmin();

    const phoneIdentifier = identifiers.find(i => i.type === "phone");
    const emailIdentifier = identifiers.find(i => i.type === "email");
    const normalizedPhone = phoneIdentifier ? this.normalizePhone(phoneIdentifier.value) : null;
    const normalizedEmail = emailIdentifier ? this.normalizeEmail(emailIdentifier.value) : null;

    let existingContact = await this.findContactByPhoneOrEmail(
      supabase,
      tenantId,
      normalizedPhone,
      normalizedEmail
    );

    let isNewContact = false;
    let wasLinked = false;
    let linkedChannels: string[] = [];

    if (!existingContact) {
      for (const identifier of identifiers) {
        if (identifier.type === "other") continue;
        
        const { data: existingIdentifier } = await supabase
          .from("guest_identifiers")
          .select("contact_id")
          .eq("identifier_type", identifier.type)
          .eq("identifier_value", identifier.value)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (existingIdentifier?.contact_id) {
          const { data: linkedContact } = await supabase
            .from("contacts")
            .select("*")
            .eq("id", existingIdentifier.contact_id)
            .maybeSingle();

          if (linkedContact) {
            existingContact = linkedContact as Contact;
            wasLinked = true;
            linkedChannels.push(identifier.type);
            break;
          }
        }
      }
    }

    if (!existingContact) {
      const { data: newContact, error } = await supabase
        .from("contacts")
        .insert({
          tenant_id: tenantId,
          phone: normalizedPhone,
          email: normalizedEmail,
          name: profile?.name,
          last_ip: profile?.ip,
          last_user_agent: profile?.userAgent,
          metadata: {
            source_identifiers: identifiers.map(i => ({ type: i.type, value: i.value }))
          }
        })
        .select()
        .single();

      if (error || !newContact) {
        log.error("Failed to create contact:", error);
        return { contact: null, isNewContact: false, wasLinked: false, linkedChannels: [] };
      }

      existingContact = newContact as Contact;
      isNewContact = true;
    }

    await this.updateContactAndIdentifiers(supabase, tenantId, existingContact.id, identifiers, profile);

    const contactProfile = await this.getContactProfile(supabase, tenantId, existingContact.id);
    
    return {
      contact: contactProfile,
      isNewContact,
      wasLinked,
      linkedChannels
    };
  }

  private static async findContactByPhoneOrEmail(
    supabase: any,
    tenantId: string,
    phone: string | null,
    email: string | null
  ): Promise<Contact | null> {
    if (!phone && !email) return null;

    let query = supabase.from("contacts").select("*").eq("tenant_id", tenantId);

    if (phone) {
      query = query.or(`phone.eq.${phone}`);
    }
    if (email) {
      query = query.or(`email.eq.${email}`);
    }

    const { data } = await query.maybeSingle();
    return data as Contact | null;
  }

  private static async updateContactAndIdentifiers(
    supabase: any,
    tenantId: string,
    contactId: string,
    identifiers: ContactIdentifier[],
    profile?: { name?: string; ip?: string; userAgent?: string }
  ) {
    const updateData: Partial<Contact> = {
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (profile?.ip) updateData.last_ip = profile.ip;
    if (profile?.userAgent) updateData.last_user_agent = profile.userAgent;
    if (profile?.name) updateData.name = profile.name;

    const phoneIdentifier = identifiers.find(i => i.type === "phone");
    const emailIdentifier = identifiers.find(i => i.type === "email");
    if (phoneIdentifier) updateData.phone = this.normalizePhone(phoneIdentifier.value);
    if (emailIdentifier) updateData.email = this.normalizeEmail(emailIdentifier.value);

    await supabase
      .from("contacts")
      .update(updateData)
      .eq("id", contactId);

    for (const identifier of identifiers) {
      await this.recordIdentifier(supabase, tenantId, contactId, identifier);
    }
  }

  private static async recordIdentifier(
    supabase: any,
    tenantId: string,
    contactId: string,
    identifier: ContactIdentifier
  ) {
    const { error } = await supabase
      .from("guest_identifiers")
      .upsert({
        contact_id: contactId,
        tenant_id: tenantId,
        identifier_type: identifier.type,
        identifier_value: identifier.value,
        channel: this.getChannelFromIdentifierType(identifier.type),
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: "tenant_id,identifier_type,identifier_value"
      });

    if (error) {
      log.warn("Failed to record identifier:", error);
    }
  }

  private static getChannelFromIdentifierType(type: ContactIdentifier["type"]): string {
    switch (type) {
      case "phone": return "web";
      case "whatsapp_id": return "whatsapp";
      case "telegram_id": return "telegram";
      case "instagram_id": return "instagram";
      case "airbnb_id": return "airbnb";
      case "booking_id": return "web";
      default: return "web";
    }
  }

  static async getContactProfile(
    supabase: any,
    tenantId: string,
    contactId: string
  ): Promise<ContactProfile | null> {
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .maybeSingle();

    if (!contact) return null;

    const { data: identifiers } = await supabase
      .from("guest_identifiers")
      .select("identifier_type, channel")
      .eq("contact_id", contactId);

    const channels: string[] = [...new Set((identifiers as GuestIdentifier[] | null)?.map((i: GuestIdentifier) => i.channel) || [])];

    const { data: bookings } = await supabase
      .from("bookings")
      .select("amount, status")
      .eq("tenant_id", tenantId);

    const totalBookings = bookings?.length || 0;
    const totalSpent = bookings
      ?.filter((b: any) => b.status === "confirmed")
      ?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0;

    const contactRow = contact as Contact;
    return {
      id: contactRow.id,
      tenantId: contactRow.tenant_id || tenantId,
      phone: contactRow.phone,
      email: contactRow.email,
      name: contactRow.name,
      preferredName: contactRow.preferred_name,
      tags: contactRow.tags || [],
      notes: contactRow.notes,
      customerType: (contactRow.customer_type as ContactProfile["customerType"]) || "prospect",
      lifetimeValue: contactRow.lifetime_value || 0,
      channels,
      totalBookings,
      totalSpent,
      firstSeenAt: contactRow.first_seen_at,
      lastSeenAt: contactRow.last_seen_at
    };
  }

  static async linkGuestToContact(
    tenantId: string,
    guestId: string,
    contactId: string
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("guests")
      .update({ contact_id: contactId })
      .eq("id", guestId);

    if (error) {
      log.error("Failed to link guest to contact:", error);
      return false;
    }

    return true;
  }

  static async updateTags(
    tenantId: string,
    contactId: string,
    tags: string[]
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("contacts")
      .update({ tags })
      .eq("id", contactId)
      .eq("tenant_id", tenantId);

    if (error) {
      log.error("Failed to update contact tags:", error);
      return false;
    }

    return true;
  }

  static async updateNotes(
    tenantId: string,
    contactId: string,
    notes: string
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("contacts")
      .update({ notes })
      .eq("id", contactId)
      .eq("tenant_id", tenantId);

    if (error) {
      log.error("Failed to update contact notes:", error);
      return false;
    }

    return true;
  }

  static async searchContacts(
    tenantId: string,
    searchQuery: string,
    limit: number = 20
  ) {
    const supabase = await getSupabaseServer();

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select(`
        *,
        guest_identifiers(identifier_type, identifier_value, channel),
        guests(id, name, phone)
      `)
      .eq("tenant_id", tenantId)
      .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .order("last_seen_at", { ascending: false })
      .limit(limit);

    if (error) {
      log.error("Failed to search contacts:", error);
      return [];
    }

    return contacts || [];
  }

  static async getContactHistory(
    tenantId: string,
    contactId: string,
    limit: number = 50
  ) {
    const supabase = await getSupabaseAdmin();

    const { data: guests } = await supabase
      .from("guests")
      .select("id")
      .eq("contact_id", contactId);

    if (!guests?.length) return [];

    const guestIds = guests.map((g) => g.id);

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .in("guest_id", guestIds)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      log.error("Failed to get contact history:", error);
      return [];
    }

    return messages || [];
  }

  static async getCustomerSegments(tenantId: string) {
    const supabase = await getSupabaseAdmin();

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("customer_type, tags, lifetime_value, created_at")
      .eq("tenant_id", tenantId);

    if (error || !contacts) {
      return {
        vip: 0,
        customers: 0,
        leads: 0,
        prospects: 0,
        total: 0,
        totalLTV: 0
      };
    }

    return {
      vip: contacts.filter(c => c.customer_type === "vip").length,
      customers: contacts.filter(c => c.customer_type === "customer").length,
      leads: contacts.filter(c => c.customer_type === "lead").length,
      prospects: contacts.filter(c => c.customer_type === "prospect").length,
      total: contacts.length,
      totalLTV: contacts.reduce((sum: number, c: any) => sum + Number(c.lifetime_value || 0), 0)
    };
  }
}
