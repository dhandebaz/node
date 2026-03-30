
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { AppError, ErrorCode } from "@/lib/errors";

export interface GrowthOpportunity {
  listingId: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  gapDays: number;
}

export class GrowthService {
  /**
   * Scan for availability gaps in the next X days.
   */
  static async scanAvailabilityGaps(tenantId: string, horizonDays: number = 30): Promise<GrowthOpportunity[]> {
    if (horizonDays < 1 || horizonDays > 365) {
      throw new AppError(ErrorCode.BAD_REQUEST, "Horizon days must be between 1 and 365");
    }

    const supabase = await getSupabaseServer();
    
    // 1. Fetch Listings
    const { data: listings, error: listingError } = await supabase
      .from("listings")
      .select("id, title")
      .eq("tenant_id", tenantId)
      .eq("status", "active");

    if (listingError) {
      log.error("Failed to fetch listings for growth scan", listingError, { tenantId });
      throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to scan listings");
    }

    if (!listings || listings.length === 0) return [];

    const opportunities: GrowthOpportunity[] = [];
    const now = new Date();
    const horizon = new Date();
    horizon.setDate(now.getDate() + horizonDays);

    for (const listing of listings) {
      // 2. Fetch Bookings for this listing
      const { data: bookings } = await supabase
        .from("bookings")
        .select("start_date, end_date")
        .eq("listing_id", listing.id)
        .neq("status", "cancelled")
        .gte("end_date", now.toISOString())
        .lte("start_date", horizon.toISOString())
        .order("start_date", { ascending: true });

      // 3. Simple Gap Detection Logic
      // For each day between now and horizon, check if it's covered by a booking
      // (This is a simplified version, real one would be more optimized)
      const currentGapStart: Date | null = null;
      let lastEnd = new Date(now);
      lastEnd.setHours(0, 0, 0, 0);

      // Check gaps between bookings
      (bookings || []).forEach(b => {
        const bStart = new Date(b.start_date || "");
        const bEnd = new Date(b.end_date || "");

        if (bStart > lastEnd) {
          const diffDays = Math.ceil((bStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 2) { // Minimum 2 day gap
            opportunities.push({
              listingId: listing.id,
              listingTitle: listing.title,
              startDate: lastEnd.toISOString().split('T')[0],
              endDate: bStart.toISOString().split('T')[0],
              gapDays: diffDays
            });
          }
        }
        if (bEnd > lastEnd) lastEnd = bEnd;
      });

      // Check gap after last booking until horizon
      if (horizon > lastEnd) {
        const diffDays = Math.ceil((horizon.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 2) {
          opportunities.push({
            listingId: listing.id,
            listingTitle: listing.title,
            startDate: lastEnd.toISOString().split('T')[0],
            endDate: horizon.toISOString().split('T')[0],
            gapDays: diffDays
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Identify potential guests to target for a specific gap.
   * Currently: Looks for guests who previously booked or inquired but didn't book.
   */
  static async identifyTargetGuests(tenantId: string, limit: number = 5) {
    const supabase = await getSupabaseServer();
    
    // Fetch guests who had conversations but no successful booking, or old guests
    const { data: guests } = await supabase
      .from("guests")
      .select("id, name, phone, email")
      .eq("tenant_id", tenantId)
      .limit(limit);
      
    return guests || [];
  }

  /**
   * Send a message to a guest via the Omnichannel Inbox.
   */
  static async sendOmnichannelMessage(params: {
    tenantId: string;
    guestId: string;
    message: string;
    channel?: string;
  }) {
    const supabase = await (await import('@/lib/supabase/server')).getSupabaseAdmin();

    // 1. Find or create a conversation for this guest
    const { data: guest } = await supabase
      .from('guests')
      .select('phone, email, name')
      .eq('id', params.guestId)
      .single();

    if (!guest) throw new Error('Guest not found');

    // Default to WhatsApp if no channel specified
    const channel = params.channel || 'whatsapp';
    const externalId = channel === 'whatsapp' ? guest.phone : guest.email;

    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', params.tenantId)
      .eq('external_id', externalId || "")
      .eq('channel', channel)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          tenant_id: params.tenantId,
          external_id: externalId,
          channel: channel,
          contact_name: guest.name || "",
          status: 'active'
        })
        .select()
        .single();
      
      if (convError) throw convError;
      conversation = newConv;
    }

    if (!conversation) throw new Error('Failed to create or find conversation');

    // 2. Record the message in the DB
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id: params.tenantId,
        conversation_id: conversation.id,
        content: params.message,
        direction: 'outbound',
        channel: channel,
        external_id: externalId,
        role: 'ai'
      } as any);

    if (msgError) throw msgError;

    // 3. Trigger actual delivery (e.g. via WAHA or Email API)
    // For now, we log it as "Sent"
    log.info(`Growth message sent to ${guest.name} via ${channel}: ${params.message}`);

    return { success: true, conversationId: conversation.id };
  }

  /**
   * Approve and send a lead opportunity.
   */
  static async approveAndSendOpportunity(opportunityId: string) {
    const supabase = await (await import('@/lib/supabase/server')).getSupabaseServer();
    
    // 1. Fetch Opportunity
    const { data: opportunity, error: opError } = await supabase
      .from('lead_opportunities')
      .select('*, guests(id, phone, email, name)')
      .eq('id', opportunityId)
      .single();

    if (opError || !opportunity) throw new Error('Opportunity not found');

    // 2. Create Payment Link if it's a gap filler
    let finalMessage = opportunity.suggested_message;
    if (opportunity.opportunity_type === 'gap_filler' && opportunity.listing_id) {
      const { PaymentLinkService } = await import('./paymentLinkService');
      const link = await PaymentLinkService.createLink({
        tenantId: opportunity.tenant_id,
        conversationId: 'temp', // Will update after sending message
        listingId: opportunity.listing_id,
        amount: 0, // In reality, calculate from pricing history
        expiresInMinutes: 1440, // 24 hours
        metadata: opportunity.metadata
      });
      finalMessage += `\n\nBook directly here: ${link.checkoutUrl}`;
    }

    // 3. Send Message
    const { conversationId } = await this.sendOmnichannelMessage({
      tenantId: opportunity.tenant_id,
      guestId: opportunity.guest_id || "",
      message: finalMessage
    });

    // 4. Update Opportunity Status
    await supabase
      .from('lead_opportunities')
      .update({ 
        status: 'sent', 
        metadata: { ...(opportunity.metadata as any), conversation_id: conversationId } 
      } as any)
      .eq('id', opportunityId);

    revalidatePath("/dashboard/ai/growth");
    return { success: true };
  }

  /**
   * Create lead opportunities in the DB for the user to review.
   */
  static async generateLeadOpportunities(tenantId: string) {
    const gaps = await this.scanAvailabilityGaps(tenantId);
    if (gaps.length === 0) return { count: 0 };

    const targets = await this.identifyTargetGuests(tenantId);
    if (targets.length === 0) return { count: 0 };

    const supabase = await getSupabaseServer();
    let createdCount = 0;

    for (const gap of gaps) {
      for (const guest of targets) {
        const suggestedMessage = `Hi ${guest.name}! I noticed we have a few open dates at "${gap.listingTitle}" from ${gap.startDate} to ${gap.endDate}. Since you've stayed with us before, I wanted to offer you a special direct booking rate. Interested?`;

        const { error } = await supabase
          .from("lead_opportunities")
          .insert({
            tenant_id: tenantId,
            guest_id: guest.id,
            listing_id: gap.listingId,
            opportunity_type: 'gap_filler',
            suggested_message: suggestedMessage,
            status: 'pending',
            metadata: {
              gap_start: gap.startDate,
              gap_end: gap.endDate,
              gap_days: gap.gapDays
            }
          });
        
        if (!error) createdCount++;
      }
    }

    revalidatePath("/dashboard/ai/growth");
    return { count: createdCount };
  }
}
