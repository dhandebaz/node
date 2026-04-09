"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  Loader2,
  MessageCircle,
  MessageSquare,
  Mic,
  RefreshCw,
  Search,
  Send,
  User,
  X,
  Zap,
  Sparkles,
  CheckCircle,
  Clock,
  Pencil,
  EyeOff,
  Building,
  LayoutDashboard,
  Layers,
  Plus,
  TrendingUp,
  History,
  ShieldCheck,
} from "lucide-react";
import { PipelineBoard } from "@/components/dashboard/ai/PipelineBoard";
import { ConversationListItem, type Conversation } from "@/components/dashboard/ai/inbox/ConversationListItem";
import { ChatMessage } from "@/components/dashboard/ai/inbox/ChatMessage";
import { ChatThread } from "@/components/dashboard/ai/inbox/ChatThread";
import { Contact360Sidebar } from "@/components/dashboard/ai/inbox/Contact360Sidebar";
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
import { Badge } from "@/components/ui/badge";
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
  instagram: MessageCircle,
  messenger: MessageSquare,
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

  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");

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
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
          <MessageSquare className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">Inbox Locked</h3>
          <p className="text-zinc-500 font-medium max-w-sm">
            Add a {labels.listing.toLowerCase()} to start receiving messages
            from your {labels.customers.toLowerCase()}.
          </p>
        </div>
        <Link
          href="/dashboard/ai/listings"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden relative font-sans">
      {sessionExpired && <SessionExpiredCard />}

      {/* Header */}
      <div className="h-20 flex-shrink-0 border-b border-zinc-100 px-8 flex items-center justify-between bg-white relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tighter uppercase">Inbox</h1>
            {conversations.filter(c => c.unreadCount > 0).length > 0 && (
              <Badge className="bg-blue-600 text-white border-blue-500 font-black">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} NEW
              </Badge>
            )}
          </div>
          
          <div className="hidden lg:flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-5 py-2 text-xs font-black uppercase tracking-tighter transition-all rounded-xl",
                viewMode === "list" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-950"
              )}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "px-5 py-2 text-xs font-black uppercase tracking-tighter transition-all rounded-xl",
                viewMode === "pipeline" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-950"
              )}
            >
              Pipeline
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="pl-11 pr-4 py-2 w-72 bg-zinc-50 border-zinc-200 rounded-2xl focus:bg-white transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 rounded-2xl border transition-all active:scale-95",
              showFilters 
                ? "bg-blue-50 border-blue-200 text-blue-600" 
                : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={loadConversations}
            disabled={loadingList}
            className="p-3 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-2xl hover:bg-zinc-200 transition-all active:scale-90 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loadingList && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-zinc-50/50">
        {viewMode === "pipeline" ? (
          <div className="flex-1 p-6 overflow-hidden">
             <PipelineBoard 
              conversations={filteredConversations as any}
              onSelect={(id) => setSelectedConversationId(id)}
            />
          </div>
        ) : (
          <>
            {/* Sidebar / List View */}
            <div className={cn(
              "w-full md:w-96 flex-shrink-0 border-r border-zinc-200 bg-white flex flex-col relative z-10 transition-transform",
              selectedConversationId && "hidden md:flex"
            )}>
              {/* Quick Filters */}
              <div className="p-4 border-b border-zinc-100 flex gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setUnreadOnly(prev => !prev)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                    unreadOnly 
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-200" 
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Unread
                </button>
                <button
                  onClick={() => setAwaitingReplyOnly(prev => !prev)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                    awaitingReplyOnly 
                      ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-100" 
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Awaiting
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none">
                {loadingList ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex gap-4 p-4">
                        <Skeleton className="w-12 h-12 rounded-2xl bg-zinc-100" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4 bg-zinc-100" />
                          <Skeleton className="h-3 w-1/2 bg-zinc-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-zinc-200" />
                    </div>
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">No matching chats</p>
                  </div>
                ) : (
                ) : (
                  filteredConversations.map((conv) => (
                    <ConversationListItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={conv.id === selectedConversationId}
                      onSelect={(id) => setSelectedConversationId(id)}
                      icon={channelIcon[conv.channel]}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Thread View */}
            <div className="flex-1 flex flex-col relative bg-zinc-50/30">
              {!selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50">
                    <MessageSquare className="w-10 h-10 text-zinc-200" />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">No chat selected</h2>
                  <p className="text-sm text-zinc-500 mt-2 font-medium max-w-xs">Select a conversation from the left to start communicating with your lead.</p>
                </div>
              ) : (
                <>
                  <ChatThread
                    conversation={selectedConversation}
                    messages={messages}
                    loading={loadingThread}
                    aiPaused={selectedConversation.aiPaused || false}
                    onToggleAi={handleAIPauseToggle}
                    onToggleSidebar={() => setShowContext(!showContext)}
                    showSidebar={showContext}
                  />

                  {/* Reply Area */}
                  <div className="p-6 bg-white border-t border-zinc-100">
                    <div className="max-w-4xl mx-auto space-y-4">
                      {suggestions.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => setReplyText(s)}
                              className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all whitespace-nowrap active:scale-95"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="relative group">
                        <textarea
                          id="message-input"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isInternalNote ? "Type an internal note (only visible to team)..." : "Type a message to the client..."}
                          className={cn(
                            "w-full bg-zinc-50 border-zinc-200 rounded-3xl p-5 pr-14 text-sm focus:outline-none focus:ring-4 transition-all min-h-[100px] resize-none font-medium",
                            isInternalNote 
                              ? "focus:ring-amber-500/10 border-amber-200 bg-amber-50/30 text-amber-900" 
                              : "focus:ring-blue-600/5 focus:bg-white"
                          )}
                        />
                        <button
                          onClick={() => handleSend("human")}
                          disabled={sending || !replyText.trim()}
                          className={cn(
                            "absolute right-4 bottom-4 p-3 rounded-2xl transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-lg",
                            isInternalNote ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-blue-600 text-white shadow-blue-500/20"
                          )}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setIsInternalNote(!isInternalNote)}
                             className={cn(
                               "text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2",
                               isInternalNote ? "text-amber-600" : "text-zinc-400 hover:text-zinc-600"
                             )}
                           >
                             <Bot className="w-3.5 h-3.5" />
                             {isInternalNote ? "Internal Note Active" : "Human Mode"}
                           </button>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => setShowSmartLinkModal(true)}
                             className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-all"
                           >
                             <Sparkles className="w-3.5 h-3.5" />
                             Create Booking Link
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Context Sidebar */}
            {selectedConversation && showContext && (
              <Contact360Sidebar
                fields={context?.fields || []}
                quickActions={context?.quickActions || []}
                onAction={handleQuickAction}
                getDisplayLabel={getDisplayLabel}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showSmartLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tighter flex items-center gap-2">
                  Create Booking Link
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Generate a secure payment & booking link.</p>
              </div>
              <button onClick={() => setShowSmartLinkModal(false)} className="p-2 hover:bg-zinc-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select {labels.listing}</Label>
                <Select
                  value={smartLinkForm.listingId}
                  onValueChange={(val: string) => setSmartLinkData({ ...smartLinkForm, listingId: val })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold">
                    <SelectValue placeholder={`Select ${labels.listing}`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                    {listings.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={smartLinkForm.amount}
                  onChange={(e) => setSmartLinkData({ ...smartLinkForm, amount: e.target.value })}
                  className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold focus:ring-blue-600/5 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{labels.checkIn}</Label>
                  <Input
                    type="date"
                    value={smartLinkForm.startDate}
                    onChange={(e) => setSmartLinkData({ ...smartLinkForm, startDate: e.target.value })}
                    className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{labels.checkOut}</Label>
                  <Input
                    type="date"
                    value={smartLinkForm.endDate}
                    onChange={(e) => setSmartLinkData({ ...smartLinkForm, endDate: e.target.value })}
                    className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateSmartLink}
                disabled={smartLinkLoading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                {smartLinkLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                Generate & Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
