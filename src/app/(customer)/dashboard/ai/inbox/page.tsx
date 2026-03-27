"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  Bot,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Copy,
  Filter,
  Globe,
  Instagram,
  Loader2,
  MessageCircle,
  MessageSquare,
  Mic,
  RefreshCw,
  Search,
  Send,
  User,
  X,
  Facebook,
  Zap,
  Sparkles,
  CheckCircle,
  Clock,
  Pencil,
  EyeOff,
  Building,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";
import { SessionExpiredError } from "@/lib/api/errors";
import { paymentsApi } from "@/lib/api/payments";
import { useDashboardStore } from "@/store/useDashboardStore";
import Link from "next/link";
import { getBusinessLabels } from "@/lib/business-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  toggleAIPauseAction,
  sendManualMessageAction,
} from "@/app/actions/inbox";
import { createBookingLinkAction } from "@/app/actions/payments";
import { toast } from "sonner";

type Conversation = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  channel: "whatsapp" | "instagram" | "messenger" | "web" | "voice";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  manager: { slug: string; name: string };
  status:
    | "draft"
    | "payment_pending"
    | "paid"
    | "scheduled"
    | "open"
    | "resolved";
  bookingId?: string | null;
  guestId?: string;
  aiPaused?: boolean;
};

type ConversationMessage = {
  id: string;
  conversationId: string;
  senderType: "customer" | "ai" | "human" | "internal";
  content: string;
  timestamp: string;
  channel: Conversation["channel"];
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio" | "document";
  caption?: string;
  status?: string;
};

type ContextField = {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "bad";
};

type QuickAction = {
  id: string;
  label: string;
  variant: "primary" | "secondary";
  action: string;
  disabled?: boolean;
};

type ConversationContext = {
  role: string;
  managerName: string;
  updatedAt: string;
  fields: ContextField[];
  quickActions: QuickAction[];
  status: "active" | "paused" | "past_due" | "pending";
};

type SystemMeta = {
  walletStatus: "healthy" | "low" | "empty";
  integrationStatus: "connected" | "disconnected" | "error";
  channelErrors?: string[];
};

type ListingSummary = {
  id: string;
  name: string;
};

const channelIcon = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  messenger: Facebook,
  web: Globe,
  voice: Mic,
};

const channelLabel: Record<Conversation["channel"], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  web: "Web chat",
  voice: "Phone call",
};

const channelConstraint: Record<Conversation["channel"], string> = {
  whatsapp: "Templates required for outbound messages",
  instagram: "Replies appear in DMs",
  messenger: "Replies appear in Messenger",
  web: "Instant web chat",
  voice: "Voice transcription & recording",
};

export default function InboxPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);

  const getDisplayLabel = (originalLabel: string) => {
    const l = originalLabel.toLowerCase();
    if (
      l.includes("guest") ||
      l.includes("customer") ||
      l.includes("patient") ||
      l.includes("buyer")
    ) {
      return labels.inboxContext.customerLabel;
    }
    if (
      l.includes("date") ||
      l.includes("time") ||
      l.includes("stay") ||
      l.includes("appointment") ||
      l.includes("order")
    ) {
      return labels.inboxContext.timeLabel;
    }
    if (
      l.includes("listing") ||
      l.includes("property") ||
      l.includes("store") ||
      l.includes("clinic") ||
      l.includes("shop")
    ) {
      return labels.listing;
    }
    if (l.includes("booking")) {
      return labels.booking;
    }
    return originalLabel;
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [systemMeta, setSystemMeta] = useState<SystemMeta | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [defaultAiPaused, setDefaultAiPaused] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [awaitingReplyOnly, setAwaitingReplyOnly] = useState(false);
  const [listingFilter, setListingFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<
    Conversation["channel"] | "all"
  >("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    Conversation["status"] | "all"
  >("all");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [bookingOptions, setBookingOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    listingId: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    amount: "",
    checkIn: "",
    checkOut: "",
    notes: "",
  });
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSent, setPaymentSent] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [idType, setIdType] = useState<
    "aadhaar" | "passport" | "driving_license" | "voter_id" | "any"
  >("aadhaar");
  const [idNote, setIdNote] = useState("");
  const [idUploadUrl, setIdUploadUrl] = useState<string | null>(null);
  const [idRequestMessage, setIdRequestMessage] = useState<string | null>(null);
  const [idRequesting, setIdRequesting] = useState(false);
  const [idBookingId, setIdBookingId] = useState<string>("");

  const [showSmartLinkModal, setShowSmartLinkModal] = useState(false);
  const [smartLinkLoading, setSmartLinkLoading] = useState(false);
  const [smartLinkForm, setSmartLinkData] = useState({
    amount: "",
    listingId: "",
    startDate: "",
    endDate: "",
  });

  // Track unread overall for document title
  useEffect(() => {
    const totalUnread = conversations.reduce(
      (sum, c) => sum + c.unreadCount,
      0,
    );
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Inbox | Nodebase`;
    } else {
      document.title = "Inbox | Nodebase";
    }
  }, [conversations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        // Allow Cmd/Ctrl + Enter to send
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          handleSend("human");
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("message-input")?.focus();
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (conversations.length === 0) return;

        const currentIndex = conversations.findIndex(
          (c) => c.id === selectedConversationId,
        );

        if (e.key === "ArrowUp") {
          const nextIndex =
            currentIndex > 0 ? currentIndex - 1 : conversations.length - 1;
          setSelectedConversationId(conversations[nextIndex].id);
        } else {
          const nextIndex =
            currentIndex < conversations.length - 1 ? currentIndex + 1 : 0;
          setSelectedConversationId(conversations[nextIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [conversations, selectedConversationId, replyText]);

  const loadListings = async () => {
    try {
      setLoadingList(true);
      const data = await fetchWithAuth<ListingSummary[]>("/api/listings");
      setListings(data || []);
      if (!paymentForm.listingId && data?.length) {
        setPaymentForm((prev) => ({ ...prev, listingId: data[0].id }));
      }
    } catch {
      setListings([]);
    } finally {
      setLoadingList(false);
    }
  };

  const loadBookingOptions = async () => {
    try {
      const data = await fetchWithAuth<any[]>("/api/bookings");
      const options = (data || []).map((booking) => ({
        id: booking.id,
        label: `${booking.guest_name} · ${booking.check_in?.slice(0, 10)} → ${booking.check_out?.slice(0, 10)}`,
      }));
      setBookingOptions(options);
      if (!idBookingId && options.length) {
        setIdBookingId(options[0].id);
      }
    } catch {
      setBookingOptions([]);
    }
  };

  const loadConversations = async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const data = await fetchWithAuth<{
        conversations: Conversation[];
        meta: SystemMeta;
      }>("/api/inbox/conversations");

      let fetchedConversations = data.conversations || [];
      if (defaultAiPaused) {
        fetchedConversations = fetchedConversations.map((c) => ({
          ...c,
          aiPaused: true,
        }));
      }

      setConversations(fetchedConversations);
      setSystemMeta(data.meta || null);
      if (!selectedConversationId && data.conversations?.length > 0) {
        setSelectedConversationId(data.conversations[0].id);
      }
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setListError("Connect integrations to start receiving messages.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingThread(true);
      setThreadError(null);
      const data = await fetchWithAuth<{ messages: ConversationMessage[] }>(
        `/api/inbox/messages?conversationId=${conversationId}`,
      );
      setMessages(data.messages || []);
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setThreadError("Connect integrations to load messages.");
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  };

  const loadContext = async (conversationId: string) => {
    try {
      setLoadingContext(true);
      setContextError(null);
      const bookingId = conversations.find(
        (conv) => conv.id === conversationId,
      )?.bookingId;
      const url = bookingId
        ? `/api/inbox/context?conversationId=${conversationId}&bookingId=${bookingId}`
        : `/api/inbox/context?conversationId=${conversationId}`;
      const data = await fetchWithAuth<ConversationContext>(url);
      setContext(data);
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setContextError("Connect integrations to see context.");
      setContext(null);
    } finally {
      setLoadingContext(false);
    }
  };

  const loadSuggestions = async (conversationId: string) => {
    try {
      setLoadingSuggestions(true);
      const data = await fetchWithAuth<{ suggestions: string[] }>(
        "/api/inbox/ai-suggest",
        {
          method: "POST",
          body: JSON.stringify({ conversationId }),
        },
      );
      setSuggestions(data.suggestions || []);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const refreshSelected = async (conversationId: string) => {
    await Promise.all([
      loadMessages(conversationId),
      loadContext(conversationId),
      loadSuggestions(conversationId),
    ]);
  };

  useEffect(() => {
    loadConversations();
    loadListings();
    loadBookingOptions();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;
    refreshSelected(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const interval = setInterval(() => {
      loadContext(selectedConversationId);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedConversationId]);

  // Supabase Realtime Subscriptions
  useEffect(() => {
    if (!tenant?.id) return;

    const supabase = getSupabaseBrowser();
    
    // Subscribe to new messages for the tenant
    const messagesChannel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `tenant_id=eq.${tenant.id}`,
        },
        (payload: any) => {
          const newMessage = payload.new as any;
          
          // Only add if it belongs to the selected conversation
          if (newMessage.conversation_id === selectedConversationId) {
            setMessages((prev) => {
              // Avoid duplicates if optimistic update already handled it
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              
              const formatted: ConversationMessage = {
                id: newMessage.id,
                conversationId: newMessage.conversation_id,
                senderType: newMessage.direction === 'inbound' ? 'customer' : (newMessage.sender_id === 'ai_assistant' ? 'ai' : 'human'),
                content: newMessage.content,
                timestamp: newMessage.created_at || newMessage.timestamp,
                channel: newMessage.channel
              };
              return [...prev, formatted];
            });

            // Also reload context when a new message arrives to keep it fresh
            loadContext(newMessage.conversation_id);
          }

          // Update conversations list with the latest preview
          setConversations((prev) => 
            prev.map((conv) => 
              conv.id === newMessage.conversation_id 
                ? {
                    ...conv,
                    lastMessage: newMessage.content,
                    lastMessageAt: newMessage.created_at || newMessage.timestamp,
                    unreadCount: newMessage.direction === 'inbound' && selectedConversationId !== newMessage.conversation_id
                      ? conv.unreadCount + 1 
                      : conv.unreadCount
                  } 
                : conv
            ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
          );
        }
      )
      .subscribe();

    // Subscribe to conversation updates (status, etc.)
    const conversationsChannel = supabase
      .channel("realtime-conversations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `tenant_id=eq.${tenant.id}`,
        },
        (payload: any) => {
          const updatedConv = payload.new as any;
          setConversations((prev) => 
            prev.map((conv) => 
              conv.id === updatedConv.id 
                ? {
                    ...conv,
                    customerName: updatedConv.contact_name || conv.customerName,
                    customerPhone: updatedConv.external_id || conv.customerPhone,
                    channel: updatedConv.channel || conv.channel,
                    status: updatedConv.status || conv.status,
                    lastMessageAt: updatedConv.last_message_at || conv.lastMessageAt,
                    aiPaused: updatedConv.metadata?.ai_paused || false,
                    unreadCount: updatedConv.metadata?.unread_count || 0,
                    // Preserve properties that might not be in the direct payload
                    lastMessage: updatedConv.metadata?.last_message_preview || conv.lastMessage,
                    bookingId: updatedConv.metadata?.booking_id || conv.bookingId,
                  } 
                : conv
            ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [tenant?.id, selectedConversationId]);

  const managerOptions = useMemo(() => {
    const unique = new Map<string, string>();
    conversations.forEach((conv) =>
      unique.set(conv.manager.slug, conv.manager.name),
    );
    return Array.from(unique.entries());
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        if (statusFilter !== "resolved" && conv.status === "resolved")
          return false;
        if (unreadOnly && conv.unreadCount === 0) return false;
        if (awaitingReplyOnly && conv.unreadCount === 0 && !conv.aiPaused)
          return false;
        if (listingFilter !== "all" && conv.manager.name !== listingFilter)
          return false;
        if (channelFilter !== "all" && conv.channel !== channelFilter)
          return false;
        if (managerFilter !== "all" && conv.manager.slug !== managerFilter)
          return false;
        if (statusFilter !== "all" && conv.status !== statusFilter)
          return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = conv.customerName?.toLowerCase().includes(term);
          const phoneMatch = conv.customerPhone?.toLowerCase().includes(term);
          return nameMatch || phoneMatch;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      );
  }, [
    channelFilter,
    conversations,
    listingFilter,
    managerFilter,
    searchTerm,
    statusFilter,
    unreadOnly,
    awaitingReplyOnly,
  ]);

  const selectedConversation =
    conversations.find((conv) => conv.id === selectedConversationId) || null;

  // 5. Auto-Drafted "Next Steps"
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.status === "payment_pending" &&
      !replyText
    ) {
      setReplyText(
        `Hi ${selectedConversation.customerName || "there"}, just following up to see if you had any trouble with the payment link?`,
      );
    }
  }, [selectedConversationId]);

  const handleResolve = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, status: "resolved" } : c)),
    );
    toast.success("Conversation resolved");
    if (selectedConversationId === convId) {
      setSelectedConversationId(null);
    }
  };

  const handleStatusChange = (
    convId: string,
    newStatus: Conversation["status"],
  ) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, status: newStatus } : c)),
    );
    toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
  };

  if (loadingList && listings.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
      </div>
    );
  }

  if (listings.length === 0 && !loadingList) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-white/5 text-foreground/40">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Inbox is locked</h3>
          <p className="text-foreground/60 max-w-sm">
            Add a {labels.listing.toLowerCase()} to start receiving messages
            from {labels.customers.toLowerCase()}.
          </p>
        </div>
        <Link
          href="/dashboard/ai/listings"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Add {labels.listing}
        </Link>
      </div>
    );
  }

  const whatsappUrl = paymentMessage
    ? `https://wa.me/?text=${encodeURIComponent(paymentMessage)}`
    : "";
  const smsUrl =
    paymentMessage && paymentForm.guestPhone
      ? `sms:${paymentForm.guestPhone}?body=${encodeURIComponent(paymentMessage)}`
      : "";
  const emailUrl =
    paymentMessage && paymentForm.guestEmail
      ? `mailto:${paymentForm.guestEmail}?subject=Booking%20payment&body=${encodeURIComponent(paymentMessage)}`
      : "";

  const handleAIPauseToggle = async (paused: boolean) => {
    if (!selectedConversation?.guestId) return;
    try {
      await toggleAIPauseAction(selectedConversation.guestId, paused);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, aiPaused: paused } : c,
        ),
      );
      toast.success(paused ? "AI paused for this guest" : "AI resumed");
    } catch (error) {
      toast.error("Failed to update AI status");
    }
  };

  const handleSend = async (senderType: "human" | "ai") => {
    if (!replyText.trim() || !selectedConversation) return;
    try {
      setSending(true);

      if (senderType === "human") {
        if (!selectedConversation.guestId) {
          toast.error("Cannot send manual message: Guest ID missing");
          return;
        }
        await sendManualMessageAction(
          selectedConversation.guestId,
          replyText.trim(),
        );

        // Optimistically update UI
        const newMessage: ConversationMessage = {
          id: Date.now().toString(), // temp id
          conversationId: selectedConversation.id,
          senderType: isInternalNote ? "internal" : "human",
          content: replyText.trim(),
          timestamp: new Date().toISOString(),
          channel: selectedConversation.channel,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Auto-pause AI locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id ? { ...c, aiPaused: true } : c,
          ),
        );
      } else {
        if (!isInternalNote) {
          const data = await fetchWithAuth<{ message: ConversationMessage }>(
            "/api/inbox/send",
            {
              method: "POST",
              body: JSON.stringify({
                conversationId: selectedConversation.id,
                content: replyText.trim(),
                senderType,
              }),
            },
          );
          setMessages((prev) => [...prev, data.message]);
        }
      }
      setReplyText("");
      setIsInternalNote(false);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!selectedConversation) return;
    if (action.action === "send_payment_link") {
      openPaymentModal();
      return;
    }
    if (action.action === "request_id") {
      setIdBookingId(selectedConversation.bookingId || idBookingId);
      setShowIdModal(true);
      return;
    }
    try {
      setSending(true);
      const data = await fetchWithAuth<{ message: ConversationMessage }>(
        "/api/inbox/send",
        {
          method: "POST",
          body: JSON.stringify({
            conversationId: selectedConversation.id,
            content: action.label,
            senderType: "ai",
            action: action.action,
          }),
        },
      );
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
    } finally {
      setSending(false);
    }
  };

  const handleRequestId = async () => {
    if (!selectedConversationId || !idBookingId) return;
    try {
      setIdRequesting(true);
      const response = await fetchWithAuth<{
        bookingId: string;
        uploadUrl: string;
        message: string;
      }>("/api/guest-id/request", {
        method: "POST",
        body: JSON.stringify({
          bookingId: idBookingId,
          idType,
          message: idNote.trim() || null,
        }),
      });
      setIdUploadUrl(response.uploadUrl);
      setIdRequestMessage(response.message);
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
    } finally {
      setIdRequesting(false);
    }
  };

  const openPaymentModal = () => {
    const listingId = paymentForm.listingId || listings[0]?.id || "";
    setPaymentForm({
      listingId,
      guestName: selectedConversation?.customerName || "",
      guestPhone: selectedConversation?.customerPhone || "",
      guestEmail: "",
      amount: "",
      checkIn: "",
      checkOut: "",
      notes: "",
    });
    setPaymentLink(null);
    setPaymentMessage("");
    setPaymentError(null);
    setPaymentSent(false);
    setShowPaymentModal(true);
  };

  const handleCreatePaymentLink = async () => {
    if (
      !paymentForm.listingId ||
      !paymentForm.guestName ||
      !paymentForm.amount ||
      !paymentForm.checkIn ||
      !paymentForm.checkOut
    ) {
      setPaymentError("Fill all required fields.");
      return;
    }
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      const payload = {
        listingId: paymentForm.listingId,
        guestName: paymentForm.guestName.trim(),
        guestPhone: paymentForm.guestPhone.trim() || null,
        guestEmail: paymentForm.guestEmail.trim() || null,
        amount: Number(paymentForm.amount),
        checkIn: paymentForm.checkIn,
        checkOut: paymentForm.checkOut,
        notes: paymentForm.notes.trim() || null,
      };
      const data = await paymentsApi.createPaymentLink(payload);
      const listingName =
        listings.find((l) => l.id === paymentForm.listingId)?.name ||
        "your stay";
      const message = `Booking for ${listingName} (${paymentForm.checkIn}–${paymentForm.checkOut}) is pending. Please pay ₹${Number(paymentForm.amount).toLocaleString("en-IN")} here: ${data.paymentLink}`;
      setPaymentLink(data.paymentLink);
      setPaymentMessage(message);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation?.id
            ? {
                ...conv,
                status: "payment_pending",
                lastMessage: conv.lastMessage,
              }
            : conv,
        ),
      );
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setPaymentError(error?.message || "Failed to create payment link.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const sendPaymentInChat = async () => {
    if (!selectedConversation || !paymentMessage) return;
    try {
      setPaymentLoading(true);
      const data = await fetchWithAuth<{ message: ConversationMessage }>(
        "/api/inbox/send",
        {
          method: "POST",
          body: JSON.stringify({
            conversationId: selectedConversation.id,
            content: paymentMessage,
            senderType: "human",
          }),
        },
      );
      setMessages((prev) => [...prev, data.message]);
      setPaymentSent(true);
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setPaymentSent(true);
  };

  const handleCreateSmartLink = async () => {
    if (
      !selectedConversationId ||
      !smartLinkForm.amount ||
      !smartLinkForm.listingId
    ) {
      toast.error("Please fill in the amount and listing");
      return;
    }

    try {
      setSmartLinkLoading(true);
      const result = await createBookingLinkAction({
        conversationId: selectedConversationId,
        listingId: smartLinkForm.listingId,
        amount: Number(smartLinkForm.amount),
        metadata: {
          startDate: smartLinkForm.startDate,
          endDate: smartLinkForm.endDate,
        },
      });

      if (result.success) {
        const listingName =
          listings.find((l) => l.id === smartLinkForm.listingId)?.name ||
          "Listing";
        const message = `I've generated a secure booking link for you for "${listingName}". You can complete your payment here: ${result.checkoutUrl}`;
        setReplyText(message);
        setShowSmartLinkModal(false);
        toast.success("Booking link generated!");
      }
    } catch (error) {
      toast.error("Failed to generate booking link");
    } finally {
      setSmartLinkLoading(false);
    }
  };

  const showEmptyState =
    !loadingList && filteredConversations.length === 0 && !listError;
  const showThread = selectedConversationId !== null;

  if (sessionExpired) {
    return <SessionExpiredCard />;
  }

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex bg-transparent rounded-2xl border border-border overflow-hidden relative">
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 bg-transparent border-r border-border flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300",
          showThread ? "-translate-x-full md:translate-x-0" : "translate-x-0",
        )}
      >
        <div className="p-4 border-b border-border bg-transparent space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Inbox
              </h1>
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-full px-3 py-1 ml-2">
                <Label
                  htmlFor="default-ai-toggle"
                  className="text-[10px] font-medium text-foreground/60 cursor-pointer"
                >
                  Default AI Paused
                </Label>
                <Switch
                  id="default-ai-toggle"
                  checked={defaultAiPaused}
                  onCheckedChange={setDefaultAiPaused}
                  className="scale-75"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-white/5 rounded-full text-foreground/60"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-border rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-foreground/40" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name or phone"
              className="bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none flex-1"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-foreground/50 flex-wrap">
            <button
              onClick={() => setAwaitingReplyOnly((prev) => !prev)}
              className={cn(
                "px-3 py-1 rounded-full border transition-colors flex items-center gap-1",
                awaitingReplyOnly
                  ? "border-amber-400 text-amber-400 bg-amber-400/10"
                  : "border-border hover:border-white/40 text-foreground/70",
              )}
            >
              <Clock className="w-3 h-3" />
              Awaiting Reply
            </button>
            <button
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={cn(
                "px-3 py-1 rounded-full border transition-colors",
                unreadOnly
                  ? "border-white/60 text-foreground"
                  : "border-border hover:border-white/40",
              )}
            >
              Unread
            </button>
            <div className="flex items-center gap-1 border border-border rounded-full px-3 py-1">
              <span>
                {channelFilter === "all"
                  ? "All channels"
                  : channelLabel[channelFilter]}
              </span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-full px-3 py-1">
              <span>
                {managerFilter === "all"
                  ? "All AI Managers"
                  : managerOptions.find(
                      ([slug]) => slug === managerFilter,
                    )?.[1]}
              </span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-full px-3 py-1">
              <span>
                {statusFilter === "all" ? "All status" : statusFilter}
              </span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        {systemMeta && (
          <div className="p-4 space-y-3 border-b border-border">
            {systemMeta.integrationStatus !== "connected" && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="font-semibold">Integration disconnected</div>
                  <div>Reconnect channels to resume replies.</div>
                </div>
              </div>
            )}
            {systemMeta.walletStatus === "empty" && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="font-semibold">Wallet empty</div>
                  <div>AI Manager is paused until credits are added.</div>
                </div>
              </div>
            )}
            {systemMeta.channelErrors?.length ? (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="font-semibold">Channel error</div>
                  <div>{systemMeta.channelErrors.join(", ")}</div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadingList && (
            <div className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <Skeleton className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="w-24 h-4 bg-white/5" />
                      <Skeleton className="w-12 h-3 bg-white/5" />
                    </div>
                    <Skeleton className="w-full h-3 bg-white/5" />
                    <Skeleton className="w-16 h-3 bg-white/5 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {listError && (
            <div className="p-6 text-sm text-foreground/60 space-y-3">
              <div>{listError}</div>
              <button
                onClick={loadConversations}
                className="inline-flex items-center gap-2 text-sm text-foreground border border-white/20 px-3 py-2 rounded-lg hover:border-white/40"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}
          {showEmptyState && (
            <div className="p-8 text-center text-foreground/40">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No conversations yet</p>
              <p className="text-xs text-foreground/30 mt-2">
                Connect a channel to start receiving messages.
              </p>
            </div>
          )}
          {!loadingList && !listError && filteredConversations.length > 0 && (
            <div className="divide-y divide-white/5">
              {filteredConversations.map((conversation) => {
                const ChannelIcon = channelIcon[conversation.channel];
                const isReturning =
                  (conversation.customerName?.length || 0) % 2 === 0 &&
                  conversation.customerName !== null; // Mock VIP logic

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group w-full text-left flex hover:bg-white/5 transition-colors border-l-2",
                      selectedConversationId === conversation.id
                        ? "bg-white/5 border-primary"
                        : "border-transparent",
                    )}
                  >
                    <button
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className="flex-1 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-black/40 text-foreground/70">
                            <ChannelIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  conversation.unreadCount
                                    ? "text-foreground"
                                    : "text-foreground/70",
                                )}
                              >
                                {conversation.customerName ||
                                  conversation.customerPhone ||
                                  "Unknown"}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <span className="text-[10px] font-semibold text-foreground bg-primary rounded-full px-2 py-0.5">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              {conversation.aiPaused && (
                                <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded px-1.5 py-0.5">
                                  Needs Attention
                                </span>
                              )}
                              {isReturning && (
                                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-foreground/40">
                              {conversation.manager.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-foreground/40 whitespace-nowrap">
                          {timeAgo(conversation.lastMessageAt)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-foreground/60 line-clamp-2">
                        {conversation.lastMessage}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-foreground/30 uppercase tracking-wider">
                        <span>{channelLabel[conversation.channel]}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded",
                            conversation.status === "payment_pending"
                              ? "bg-orange-500/20 text-orange-400"
                              : "",
                          )}
                        >
                          {conversation.status.replace("_", " ")}
                        </span>
                      </div>
                    </button>
                    <div className="hidden group-hover:flex items-center px-2 border-l border-white/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(conversation.id);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full text-foreground/40 hover:text-emerald-400 transition-colors"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 bg-transparent flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300",
          showThread ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        {selectedConversation ? (
          <>
            <div className="h-16 px-4 border-b border-border flex items-center justify-between bg-transparent">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-full text-foreground/60"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold text-foreground">
                  {(
                    selectedConversation.customerName ||
                    selectedConversation.customerPhone ||
                    "U"
                  ).charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      {selectedConversation.customerName ||
                        selectedConversation.customerPhone ||
                        "Unknown"}
                    </h2>
                    {(selectedConversation.customerName?.length || 0) % 2 ===
                      0 &&
                      selectedConversation.customerName !== null && (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                          Returning Guest
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-foreground/50">
                      {channelLabel[selectedConversation.channel]}
                    </span>
                    <span className="text-foreground/20">•</span>
                    <select
                      value={selectedConversation.status}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedConversation.id,
                          e.target.value as any,
                        )
                      }
                      className={cn(
                        "text-[10px] bg-transparent border-none p-0 uppercase tracking-wider focus:ring-0 cursor-pointer font-semibold",
                        selectedConversation.status === "payment_pending"
                          ? "text-orange-400"
                          : "text-foreground/50",
                      )}
                    >
                      <option className="public-panel" value="open">
                        Open
                      </option>
                      <option className="public-panel" value="draft">
                        Draft
                      </option>
                      <option className="public-panel" value="payment_pending">
                        Payment Pending
                      </option>
                      <option className="public-panel" value="paid">
                        Paid
                      </option>
                      <option className="public-panel" value="scheduled">
                        Scheduled
                      </option>
                      <option className="public-panel" value="resolved">
                        Resolved
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedConversation.aiPaused && (
                    <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      AI Paused - Human taking over
                    </span>
                  )}
                  <div className="flex items-center gap-2 bg-white/5 border border-border rounded-full px-3 py-1">
                    <Label
                      htmlFor="ai-toggle"
                      className="text-[10px] font-medium text-foreground cursor-pointer"
                    >
                      AI Autopilot
                    </Label>
                    <Switch
                      id="ai-toggle"
                      checked={!selectedConversation.aiPaused}
                      onCheckedChange={(checked) =>
                        handleAIPauseToggle(!checked)
                      }
                      className="scale-75"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    let extractedAmount = "";
                    let extractedCheckIn = "";
                    let extractedCheckOut = "";

                    if (context?.fields) {
                      context.fields.forEach((f) => {
                        const l = f.label.toLowerCase();
                        if (
                          l.includes("amount") ||
                          l.includes("price") ||
                          l.includes("total")
                        )
                          extractedAmount = f.value.replace(/[^0-9.]/g, "");
                        if (l.includes("check-in") || l.includes("start"))
                          extractedCheckIn = f.value;
                        if (l.includes("check-out") || l.includes("end"))
                          extractedCheckOut = f.value;
                      });
                    }

                    setSmartLinkData({
                      amount: extractedAmount,
                      listingId: listings[0]?.id || "",
                      startDate: extractedCheckIn,
                      endDate: extractedCheckOut,
                    });
                    setShowSmartLinkModal(true);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 text-foreground hover:bg-emerald-700 transition-colors"
                >
                  Send booking link
                </button>
                <button
                  onClick={openPaymentModal}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-foreground/80 hover:border-white/50"
                >
                  Send payment link
                </button>
                <div className="flex items-center gap-2 text-[10px] text-foreground/40">
                  <Calendar className="w-4 h-4" />
                  {timeAgo(selectedConversation.lastMessageAt)}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="md:hidden border-b border-border bg-transparent">
                  <button
                    onClick={() => setShowContext((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs text-foreground/70"
                  >
                    <span>{context?.managerName || "Context"}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        showContext ? "rotate-180" : "",
                      )}
                    />
                  </button>
                  {showContext && (
                    <div className="px-4 pb-4">
                      {contextError && (
                        <div className="text-xs text-foreground/50">
                          {contextError}
                        </div>
                      )}
                      {loadingContext && (
                        <div className="space-y-3">
                          <Skeleton className="w-24 h-3 bg-white/5" />
                          <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-16 bg-white/5 rounded-lg" />
                            <Skeleton className="h-16 bg-white/5 rounded-lg" />
                            <Skeleton className="h-16 bg-white/5 rounded-lg" />
                            <Skeleton className="h-16 bg-white/5 rounded-lg" />
                          </div>
                        </div>
                      )}
                      {context && (
                        <div className="space-y-3">
                          <div className="text-xs text-foreground/40">
                            Updated {timeAgo(context.updatedAt)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {context.fields.map((field) => (
                              <button
                                key={field.label}
                                onClick={() =>
                                  setReplyText(
                                    (prev) =>
                                      (prev ? prev + "\n" : "") +
                                      `${field.label}: ${field.value}`,
                                  )
                                }
                                className="bg-white/5 hover:bg-white/10 text-left border border-border rounded-lg p-2 transition-colors group cursor-pointer"
                                title="Click to insert into reply"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="text-foreground/40 text-[10px] uppercase tracking-wider group-hover:text-foreground/60">
                                    {field.label}
                                  </div>
                                  <Copy className="w-3 h-3 text-foreground/20 group-hover:text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div
                                  className={cn(
                                    "text-foreground mt-1 text-xs",
                                    field.tone === "good" && "text-emerald-300",
                                    field.tone === "warn" && "text-amber-300",
                                    field.tone === "bad" && "text-red-300",
                                  )}
                                >
                                  {field.value}
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            {context.quickActions
                              .filter((action) => action.variant === "primary")
                              .slice(0, 2)
                              .map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleQuickAction(action)}
                                  disabled={action.disabled || sending}
                                  className="flex-1 text-xs font-semibold bg-white text-black py-2 rounded-lg disabled:opacity-50"
                                >
                                  {action.label}
                                </button>
                              ))}
                          </div>
                          {context.quickActions.filter(
                            (action) => action.variant === "secondary",
                          ).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {context.quickActions
                                .filter(
                                  (action) => action.variant === "secondary",
                                )
                                .map((action) => (
                                  <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action)}
                                    disabled={action.disabled || sending}
                                    className="text-xs text-foreground/80 border border-white/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                            </div>
                          )}
                          <div className="text-[10px] text-foreground/40">
                            {channelConstraint[selectedConversation.channel]}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
                  {loadingThread && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex gap-3 max-w-[85%]",
                            i % 2 === 0 ? "ml-auto flex-row-reverse" : "",
                          )}
                        >
                          <Skeleton className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
                          <div className="space-y-1 w-full">
                            <Skeleton
                              className={cn(
                                "h-16 bg-white/5 rounded-2xl",
                                i % 2 === 0
                                  ? "rounded-tr-none ml-auto w-3/4"
                                  : "rounded-tl-none w-2/3",
                              )}
                            />
                            <Skeleton
                              className={cn(
                                "h-3 w-12 bg-white/5 mt-1",
                                i % 2 === 0 ? "ml-auto" : "",
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {threadError && (
                    <div className="text-sm text-foreground/50">{threadError}</div>
                  )}
                  {!loadingThread && !threadError && messages.length === 0 && (
                    <div className="text-sm text-foreground/40">
                      No messages in this conversation yet.
                    </div>
                  )}
                  {messages.map((message) => {
                    const isCustomer = message.senderType === "customer";
                    const isAi = message.senderType === "ai";
                    const isInternal = message.senderType === "internal";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 max-w-[85%]",
                          isCustomer ? "" : "ml-auto flex-row-reverse",
                          isInternal ? "w-full mx-auto" : "",
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-foreground mt-1 relative",
                            isCustomer
                              ? "bg-gradient-to-br from-orange-400 to-red-500"
                              : "bg-white/10 border border-border",
                          )}
                        >
                          {isCustomer ? (
                            (
                              selectedConversation.customerName ||
                              selectedConversation.customerPhone ||
                              "U"
                            ).charAt(0)
                          ) : isAi ? (
                            <Bot className="w-4 h-4" />
                          ) : isInternal ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          
                          {/* Channel Badge on Avatar */}
                          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/10 shadow-lg">
                            {(() => {
                                const Icon = channelIcon[message.channel];
                                return <Icon className="w-2.5 h-2.5 text-foreground/70" />;
                            })()}
                          </div>
                        </div>
                        <div>
                          <div
                            className={cn(
                              "rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                              isCustomer
                                ? "bg-transparent border border-border rounded-tl-none text-foreground/90"
                                : isInternal
                                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-200"
                                  : "bg-white/10 border border-border rounded-tr-none text-foreground",
                            )}
                          >
                            {message.mediaUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                                {message.mediaType === "image" ? (
                                  <img 
                                    src={message.mediaUrl} 
                                    alt={message.caption || "Image"} 
                                    className="max-w-full h-auto object-cover hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(message.mediaUrl, '_blank')}
                                  />
                                ) : message.mediaType === "video" ? (
                                  <video src={message.mediaUrl} controls className="max-w-full" />
                                ) : message.mediaType === "audio" ? (
                                  <audio src={message.mediaUrl} controls className="max-w-full" />
                                ) : (
                                  <a 
                                    href={message.mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                                  >
                                    <div className="p-2 bg-white/10 rounded-lg">
                                      <Copy className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">Document</div>
                                      <div className="text-xs truncate">{message.caption || "View Attachment"}</div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            )}
                            {message.content}
                          </div>
                          <div
                            className={cn(
                              "text-[10px] mt-1 flex items-center gap-2",
                              isCustomer
                                ? "text-foreground/30 ml-1"
                                : "text-foreground/40 justify-end mr-1",
                            )}
                          >
                            <span>{timeAgo(message.timestamp)}</span>
                            {message.status && !isCustomer && (
                                <span className={cn(
                                    "px-1 rounded-sm uppercase tracking-tighter font-bold",
                                    message.status === 'read' ? 'text-emerald-400' : 'text-foreground/20'
                                )}>
                                    {message.status}
                                </span>
                            )}
                            <span>
                              {isAi
                                ? "AI"
                                : isInternal
                                  ? "Internal Note"
                                  : isCustomer
                                    ? "Customer"
                                    : "You"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-transparent border-t border-border pb-safe md:pb-3 space-y-3">
                  <div className="flex items-center gap-4 px-2 mb-1">
                    <label className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-primary focus:ring-0"
                      />
                      <EyeOff className="w-3 h-3" />
                      Internal Note
                    </label>
                  </div>
                  <div
                    className={cn(
                      "flex items-end gap-2 bg-transparent border rounded-2xl p-2 transition-colors",
                      isInternalNote
                        ? "border-amber-500/50 focus-within:border-amber-500 bg-amber-500/5"
                        : "border-border focus-within:border-white/30",
                    )}
                  >
                    <textarea
                      id="message-input"
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder={
                        isInternalNote
                          ? "Type an internal note (won't be sent to customer)..."
                          : "Type a message..."
                      }
                      className={cn(
                        "flex-1 bg-transparent text-sm focus:outline-none max-h-32 py-2 resize-none",
                        isInternalNote
                          ? "text-amber-100 placeholder:text-amber-500/50"
                          : "text-foreground placeholder:text-foreground/30",
                      )}
                      rows={1}
                    />
                    <button
                      onClick={() => handleSend("human")}
                      disabled={!replyText.trim() || sending}
                      className={cn(
                        "p-2 rounded-full disabled:opacity-50 transition-colors",
                        isInternalNote
                          ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                          : "bg-white/10 text-foreground hover:bg-white/20",
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {loadingSuggestions && (
                        <span className="text-[10px] text-foreground/40">
                          Loading AI replies...
                        </span>
                      )}
                      {!loadingSuggestions &&
                        suggestions.slice(0, 3).map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setReplyText(suggestion);
                              document.getElementById("message-input")?.focus();
                            }}
                            className="text-xs text-foreground/80 border border-border px-3 py-1.5 rounded-full hover:border-white/40 hover:bg-white/5 transition-all flex items-center gap-2 group"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="truncate max-w-[150px]">{suggestion}</span>
                          </button>
                        ))}
                    </div>
                    <button
                      onClick={() => handleSend("ai")}
                      disabled={!replyText.trim() || sending}
                      className="text-xs font-semibold bg-primary text-foreground px-4 py-2 rounded-full disabled:opacity-50"
                    >
                      Send as AI
                    </button>
                  </div>
                  <div className="text-[10px] text-foreground/40 flex items-center gap-2">
                    <ArrowDownLeft className="w-3 h-3" />
                    Sending as AI uses credits
                  </div>
                </div>
              </div>

              <div className="hidden md:flex w-80 bg-[#140707] border-l border-border flex-col p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-foreground/40">
                      Context
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {context?.managerName ||
                        selectedConversation.manager.name}
                    </div>
                  </div>
                  <button
                    onClick={() => loadContext(selectedConversation.id)}
                    className="text-xs text-foreground/40 hover:text-foreground"
                  >
                    Refresh
                  </button>
                </div>
                {loadingContext && (
                  <div className="space-y-3">
                    <Skeleton className="w-24 h-3 bg-white/5" />
                    <div className="space-y-3">
                      <Skeleton className="h-16 bg-white/5 rounded-lg w-full" />
                      <Skeleton className="h-16 bg-white/5 rounded-lg w-full" />
                      <Skeleton className="h-16 bg-white/5 rounded-lg w-full" />
                    </div>
                  </div>
                )}
                {contextError && (
                  <div className="text-xs text-foreground/50">{contextError}</div>
                )}
                {context && (
                  <>
                    <div className="text-[10px] text-foreground/40">
                      Updated {timeAgo(context.updatedAt)}
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      {context.fields.map((field) => (
                        <button
                          key={field.label}
                          onClick={() =>
                            setReplyText(
                              (prev) =>
                                (prev ? prev + "\n" : "") +
                                `${getDisplayLabel(field.label)}: ${field.value}`,
                            )
                          }
                          className="bg-white/5 hover:bg-white/10 text-left border border-border rounded-lg p-3 transition-colors group cursor-pointer"
                          title="Click to insert into reply"
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-foreground/40 uppercase tracking-wider text-[10px] group-hover:text-foreground/60">
                              {getDisplayLabel(field.label)}
                            </div>
                            <Copy className="w-3 h-3 text-foreground/20 group-hover:text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <div
                              className={cn(
                                "text-foreground mt-1 text-left flex-1",
                                field.tone === "good" && "text-emerald-300",
                                field.tone === "warn" && "text-amber-300",
                                field.tone === "bad" && "text-red-300",
                              )}
                            >
                              {field.value}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newValue = window.prompt(
                                  `Update ${field.label}:`,
                                  field.value,
                                );
                                if (newValue !== null) {
                                  setContext((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          fields: prev.fields.map((f) =>
                                            f.label === field.label
                                              ? { ...f, value: newValue }
                                              : f,
                                          ),
                                        }
                                      : null,
                                  );
                                  toast.success(`Updated ${field.label}`);
                                }
                              }}
                              className="p-1 hover:bg-white/10 rounded ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Edit value"
                            >
                              <Pencil className="w-3 h-3 text-foreground/40 hover:text-foreground" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/40 mb-3">
                        <Building className="w-3 h-3" />
                        Quick Facts
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "WiFi: Guest_5G",
                          "Check-in: 3PM",
                          "Check-out: 11AM",
                          "Parking: Free",
                        ].map((fact) => (
                          <button
                            key={fact}
                            onClick={() =>
                              setReplyText(
                                (prev) => (prev ? prev + "\n" : "") + fact,
                              )
                            }
                            className="bg-white/5 hover:bg-white/10 text-[10px] text-left border border-border rounded p-2 transition-colors group"
                            title="Click to insert"
                          >
                            <div className="text-foreground/70 truncate">{fact}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {context.quickActions
                        .filter((action) => action.variant === "primary")
                        .slice(0, 2)
                        .map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleQuickAction(action)}
                            disabled={action.disabled || sending}
                            className="w-full text-sm font-semibold bg-white text-black py-2 rounded-lg disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        ))}
                    </div>
                    {context.quickActions.filter(
                      (action) => action.variant === "secondary",
                    ).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {context.quickActions
                          .filter((action) => action.variant === "secondary")
                          .map((action) => (
                            <button
                              key={action.id}
                              onClick={() => handleQuickAction(action)}
                              disabled={action.disabled || sending}
                              className="text-xs text-foreground/80 border border-white/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              {action.label}
                            </button>
                          ))}
                      </div>
                    )}
                    <div className="text-[10px] text-foreground/40">
                      {channelConstraint[selectedConversation.channel]}
                    </div>
                  </>
                )}
                {!context && !loadingContext && (
                  <div className="text-xs text-foreground/40">
                    Context will appear here once available.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-foreground/30">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">Select a conversation to view details</p>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/70">
          <div className="bg-transparent border-t border-border rounded-t-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Filters</div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-xs text-foreground/50"
              >
                Close
              </button>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-foreground/40 mb-2">
                Listing
              </div>
              <select
                value={listingFilter}
                onChange={(e) => setListingFilter(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-white/30"
              >
                <option value="all">All Listings</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setAwaitingReplyOnly((prev) => !prev)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs border flex items-center gap-1",
                  awaitingReplyOnly
                    ? "border-amber-400 text-amber-400 bg-amber-400/10"
                    : "border-border text-foreground/70",
                )}
              >
                <Clock className="w-3 h-3" />
                Awaiting Reply
              </button>
              <button
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs border",
                  unreadOnly
                    ? "border-white/60 text-foreground"
                    : "border-border text-foreground/70",
                )}
              >
                Unread only
              </button>
              {(
                ["all", "whatsapp", "instagram", "messenger", "web"] as const
              ).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setChannelFilter(channel)}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs border",
                    channelFilter === channel
                      ? "border-white/60 text-foreground"
                      : "border-border text-foreground/70",
                  )}
                >
                  {channel === "all" ? "All channels" : channelLabel[channel]}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-foreground/40 mb-2">
                AI Manager
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setManagerFilter("all")}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs border",
                    managerFilter === "all"
                      ? "border-white/60 text-foreground"
                      : "border-border text-foreground/70",
                  )}
                >
                  All AI Managers
                </button>
                {managerOptions.map(([slug, name]) => (
                  <button
                    key={slug}
                    onClick={() => setManagerFilter(slug)}
                    className={cn(
                      "px-3 py-2 rounded-full text-xs border",
                      managerFilter === slug
                        ? "border-white/60 text-foreground"
                        : "border-border text-foreground/70",
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-foreground/40 mb-2">
                Status
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "all",
                    "open",
                    "draft",
                    "payment_pending",
                    "paid",
                    "scheduled",
                    "resolved",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-2 rounded-full text-xs border",
                      statusFilter === status
                        ? "border-white/60 text-foreground"
                        : "border-border text-foreground/70",
                    )}
                  >
                    {status === "all" ? "All status" : status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-transparent border border-border rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                Send payment link
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-foreground/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Property
                  </label>
                  <select
                    value={paymentForm.listingId}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        listingId: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="">Select property</option>
                    {listings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="Amount in INR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Guest name
                  </label>
                  <input
                    type="text"
                    value={paymentForm.guestName}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        guestName: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Guest phone
                  </label>
                  <input
                    type="tel"
                    value={paymentForm.guestPhone}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        guestPhone: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Guest email
                  </label>
                  <input
                    type="email"
                    value={paymentForm.guestEmail}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        guestEmail: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="guest@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={paymentForm.checkIn}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        checkIn: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={paymentForm.checkOut}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        checkOut: event.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 min-h-[80px]"
                  placeholder="Add any notes for the guest"
                />
              </div>

              {paymentLink && (
                <div className="space-y-3 border border-border rounded-xl p-4 bg-white/5">
                  <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    Payment link
                  </div>
                  <div className="text-sm text-foreground break-all">
                    {paymentLink}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-foreground/80 px-3 py-1.5 rounded-full"
                    >
                      <Copy className="w-3 h-3" />
                      Copy link
                    </button>
                    <button
                      onClick={sendPaymentInChat}
                      disabled={paymentLoading}
                      className="inline-flex items-center gap-2 text-xs font-semibold bg-white text-black px-3 py-1.5 rounded-full disabled:opacity-60"
                    >
                      Send in chat
                    </button>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-foreground/80 px-3 py-1.5 rounded-full"
                      >
                        WhatsApp
                      </a>
                    )}
                    {smsUrl && (
                      <a
                        href={smsUrl}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-foreground/80 px-3 py-1.5 rounded-full"
                      >
                        SMS
                      </a>
                    )}
                    {emailUrl && (
                      <a
                        href={emailUrl}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-foreground/80 px-3 py-1.5 rounded-full"
                      >
                        Email
                      </a>
                    )}
                  </div>
                  {paymentSent && (
                    <div className="text-xs text-emerald-300">
                      Payment link ready to share.
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-xs text-red-300">{paymentError}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-xs text-foreground/60 hover:text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={handleCreatePaymentLink}
                  disabled={paymentLoading}
                  className="px-4 py-2 bg-primary text-foreground rounded-lg text-xs font-semibold disabled:opacity-60"
                >
                  {paymentLoading
                    ? "Generating..."
                    : paymentLink
                      ? "Generate again"
                      : "Generate payment link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-transparent border border-border rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Request ID</div>
              <button
                onClick={() => setShowIdModal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-foreground/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-foreground/40 mb-1">Booking</div>
                <select
                  value={idBookingId}
                  onChange={(e) => setIdBookingId(e.target.value)}
                  className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  {bookingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-foreground/40 mb-1">ID Type</div>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="any">Any Govt ID</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-foreground/40 mb-1">
                  Message (optional)
                </div>
                <textarea
                  value={idNote}
                  onChange={(e) => setIdNote(e.target.value)}
                  className="w-full bg-white/5 border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 min-h-[80px]"
                  placeholder="Hi! Please upload a government-issued ID to complete check-in compliance."
                />
              </div>
              {idUploadUrl && (
                <div className="text-xs text-foreground/60 break-all">
                  Upload link: {idUploadUrl}
                </div>
              )}
              {idRequestMessage && (
                <div className="text-xs text-foreground/60 break-all">
                  Message: {idRequestMessage}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-[10px] text-foreground/40">
                Nodebase will store IDs securely.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIdModal(false)}
                  className="px-3 py-1.5 text-xs text-foreground/60 hover:text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={handleRequestId}
                  disabled={idRequesting}
                  className="px-4 py-2 bg-primary text-foreground rounded-lg text-xs font-semibold disabled:opacity-60"
                >
                  {idRequesting ? "Generating..." : "Generate link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Booking Link Modal */}
      {showSmartLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md public-panel border-border shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Zap className="text-emerald-500 w-5 h-5" />
                  Generate Smart Link
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSmartLinkModal(false)}
                  className="text-foreground/40 hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Create a temporary checkout link for this guest.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Select Listing</Label>
                <Select
                  value={smartLinkForm.listingId}
                  onValueChange={(v: string) =>
                    setSmartLinkData({ ...smartLinkForm, listingId: v })
                  }
                >
                  <SelectTrigger className="bg-black/20 border-border text-foreground">
                    <SelectValue placeholder="Select Listing" />
                  </SelectTrigger>
                  <SelectContent className="public-panel border-border text-foreground">
                    {listings.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={smartLinkForm.amount}
                  onChange={(e) =>
                    setSmartLinkData({
                      ...smartLinkForm,
                      amount: e.target.value,
                    })
                  }
                  className="bg-black/20 border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Check-in</Label>
                  <Input
                    type="date"
                    value={smartLinkForm.startDate}
                    onChange={(e) =>
                      setSmartLinkData({
                        ...smartLinkForm,
                        startDate: e.target.value,
                      })
                    }
                    className="bg-black/20 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Check-out</Label>
                  <Input
                    type="date"
                    value={smartLinkForm.endDate}
                    onChange={(e) =>
                      setSmartLinkData({
                        ...smartLinkForm,
                        endDate: e.target.value,
                      })
                    }
                    className="bg-black/20 border-border text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button
                  onClick={handleCreateSmartLink}
                  disabled={smartLinkLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-foreground font-bold"
                >
                  {smartLinkLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate & Insert Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
