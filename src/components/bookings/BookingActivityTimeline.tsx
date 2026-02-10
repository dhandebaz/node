"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { format, parseISO } from "date-fns";
import { 
  Loader2, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Bot, 
  User, 
  Shield, 
  Plug,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";

type AuditEvent = {
  id: string;
  actor_type: "user" | "system" | "ai" | "admin";
  event_type: string;
  created_at: string;
  metadata: Record<string, any>;
  users?: {
    full_name: string;
    email: string;
  };
};

type Props = {
  bookingId: string;
};

export function BookingActivityTimeline({ bookingId }: Props) {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWithAuth<{ events: AuditEvent[] }>(`/api/bookings/${bookingId}/events`);
        if (mounted) {
          setEvents(data.events || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError("Failed to load activity history.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (bookingId) {
      loadEvents();
    }

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const getEventIcon = (type: string, actor: string) => {
    if (actor === "ai") return Bot;
    if (type.includes("PAYMENT") || type.includes("WALLET")) return CreditCard;
    if (type.includes("BOOKING")) return Calendar;
    if (type.includes("ID_")) return Shield;
    if (type.includes("INTEGRATION")) return Plug;
    if (type.includes("CONFIRMED") || type.includes("APPROVED")) return CheckCircle;
    if (type.includes("CANCELLED") || type.includes("REJECTED")) return XCircle;
    return Info;
  };

  const formatEventMessage = (event: AuditEvent) => {
    const { event_type, metadata, actor_type, users } = event;
    const actorName = actor_type === "ai" ? "AI Assistant" : 
                     actor_type === "system" ? "System" : 
                     users?.full_name || "User";

    switch (event_type) {
      case "BOOKING_CREATED":
        return `${labels.booking} created via ${metadata?.source || "direct channel"}`;
      case "BOOKING_CONFIRMED":
        return `${labels.booking} confirmed`;
      case "BOOKING_CANCELLED":
        return `${labels.booking} cancelled`;
      case "PAYMENT_LINK_CREATED":
        return "Payment link generated";
      case "PAYMENT_CONFIRMED":
        return "Payment received successfully";
      case "ID_REQUESTED":
        return "ID verification requested";
      case "ID_SUBMITTED":
        return `${labels.customer} submitted ID documents`;
      case "ID_APPROVED":
        return "ID documents approved";
      case "ID_REJECTED":
        return `ID documents rejected: ${metadata?.reason || "Reason not specified"}`;
      case "AI_REPLY_SENT":
        return `AI sent a reply to ${labels.customer.toLowerCase()}`;
      case "AI_REPLY_BLOCKED":
        return "AI reply blocked (confidence/rules)";
      case "WALLET_DEBITED":
        return "Wallet debited for service";
      case "WALLET_CREDITED":
        return "Wallet credited";
      case "SYSTEM_CALENDAR_SYNC":
        return "Calendar synced with external channel";
      case "SYSTEM_BOOKING_IMPORTED":
        return `${labels.booking} imported from ${metadata?.source || "external source"}`;
      default:
        return event_type.replace(/_/g, " ").toLowerCase();
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-white/50">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/50">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Activity History</div>
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute top-2 bottom-2 left-[11px] w-px bg-white/10" />
        
        {events.map((event) => {
          const Icon = getEventIcon(event.event_type, event.actor_type);
          const isAi = event.actor_type === "ai";
          const isSystem = event.actor_type === "system";
          
          return (
            <div key={event.id} className="relative pl-8 group">
              {/* Dot/Icon */}
              <div className={cn(
                "absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-[10px]",
                isAi ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                isSystem ? "bg-blue-500/10 border-blue-500/30 text-blue-300" :
                "bg-white/5 border-white/10 text-white/60"
              )}>
                <Icon className="w-3 h-3" />
              </div>
              
              <div className="space-y-0.5">
                <div className="text-xs text-white leading-snug">
                  {formatEventMessage(event)}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <span>{format(parseISO(event.created_at), "d MMM, h:mm a")}</span>
                  <span>•</span>
                  <span className="capitalize">{event.actor_type === "user" ? event.users?.full_name || "User" : event.actor_type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
