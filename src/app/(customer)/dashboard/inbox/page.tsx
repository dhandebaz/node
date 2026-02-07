"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  Bot,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Filter,
  Globe,
  Instagram,
  Loader2,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  Facebook
} from "lucide-react";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  channel: "whatsapp" | "instagram" | "messenger" | "web";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  manager: { slug: string; name: string };
  status: "pending" | "paid" | "scheduled" | "open";
};

type ConversationMessage = {
  id: string;
  conversationId: string;
  senderType: "customer" | "ai" | "human";
  content: string;
  timestamp: string;
  channel: Conversation["channel"];
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

const channelIcon = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  messenger: Facebook,
  web: Globe
};

const channelLabel: Record<Conversation["channel"], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  web: "Web chat"
};

const channelConstraint: Record<Conversation["channel"], string> = {
  whatsapp: "Templates required for outbound messages",
  instagram: "Replies appear in DMs",
  messenger: "Replies appear in Messenger",
  web: "Instant web chat"
};

const formatTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [systemMeta, setSystemMeta] = useState<SystemMeta | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [channelFilter, setChannelFilter] = useState<Conversation["channel"] | "all">("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<Conversation["status"] | "all">("all");
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

  const loadConversations = async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const response = await fetch("/api/inbox/conversations");
      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }
      const data = await response.json();
      setConversations(data.conversations || []);
      setSystemMeta(data.meta || null);
      if (!selectedConversationId && data.conversations?.length > 0) {
        setSelectedConversationId(data.conversations[0].id);
      }
    } catch (error: any) {
      setListError(error?.message || "Unable to load conversations.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingThread(true);
      setThreadError(null);
      const response = await fetch(`/api/inbox/messages?conversationId=${conversationId}`);
      if (!response.ok) {
        throw new Error("Unable to load messages.");
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error: any) {
      setThreadError(error?.message || "Unable to load messages.");
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  };

  const loadContext = async (conversationId: string) => {
    try {
      setLoadingContext(true);
      setContextError(null);
      const response = await fetch(`/api/inbox/context?conversationId=${conversationId}`);
      if (!response.ok) {
        throw new Error("Unable to load context.");
      }
      const data = await response.json();
      setContext(data);
    } catch (error: any) {
      setContextError(error?.message || "Unable to load context.");
      setContext(null);
    } finally {
      setLoadingContext(false);
    }
  };

  const loadSuggestions = async (conversationId: string) => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch("/api/inbox/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId })
      });
      if (!response.ok) {
        throw new Error("Unable to load AI suggestions.");
      }
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const refreshSelected = async (conversationId: string) => {
    await Promise.all([loadMessages(conversationId), loadContext(conversationId), loadSuggestions(conversationId)]);
  };

  useEffect(() => {
    loadConversations();
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

  const managerOptions = useMemo(() => {
    const unique = new Map<string, string>();
    conversations.forEach((conv) => unique.set(conv.manager.slug, conv.manager.name));
    return Array.from(unique.entries());
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        if (unreadOnly && conv.unreadCount === 0) return false;
        if (channelFilter !== "all" && conv.channel !== channelFilter) return false;
        if (managerFilter !== "all" && conv.manager.slug !== managerFilter) return false;
        if (statusFilter !== "all" && conv.status !== statusFilter) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = conv.customerName?.toLowerCase().includes(term);
          const phoneMatch = conv.customerPhone?.toLowerCase().includes(term);
          return nameMatch || phoneMatch;
        }
        return true;
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [channelFilter, conversations, managerFilter, searchTerm, statusFilter, unreadOnly]);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) || null;

  const handleSend = async (senderType: "human" | "ai") => {
    if (!replyText.trim() || !selectedConversation) return;
    try {
      setSending(true);
      const response = await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: replyText.trim(),
          senderType
        })
      });
      if (!response.ok) {
        throw new Error("Unable to send message.");
      }
      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!selectedConversation) return;
    try {
      setSending(true);
      const response = await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: action.label,
          senderType: "ai",
          action: action.action
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } finally {
      setSending(false);
    }
  };

  const showEmptyState = !loadingList && filteredConversations.length === 0 && !listError;
  const showThread = selectedConversationId !== null;

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex bg-[#1E0B0B] rounded-2xl border border-white/10 overflow-hidden relative">
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 bg-[#2A0A0A] border-r border-white/10 flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300",
          showThread ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
        <div className="p-4 border-b border-white/10 bg-[#2A0A0A] space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight">Inbox</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-white/5 rounded-full text-white/60"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-white/40" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name or phone"
              className="bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none flex-1"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-white/50 flex-wrap">
            <button
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={cn(
                "px-3 py-1 rounded-full border transition-colors",
                unreadOnly ? "border-white/60 text-white" : "border-white/10 hover:border-white/40"
              )}
            >
              Unread
            </button>
            <div className="flex items-center gap-1 border border-white/10 rounded-full px-3 py-1">
              <span>{channelFilter === "all" ? "All channels" : channelLabel[channelFilter]}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 border border-white/10 rounded-full px-3 py-1">
              <span>{managerFilter === "all" ? "All AI Managers" : managerOptions.find(([slug]) => slug === managerFilter)?.[1]}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 border border-white/10 rounded-full px-3 py-1">
              <span>{statusFilter === "all" ? "All status" : statusFilter}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        {systemMeta && (
          <div className="p-4 space-y-3 border-b border-white/10">
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
            <div className="h-full flex items-center justify-center text-white/40">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading inbox...
            </div>
          )}
          {listError && (
            <div className="p-6 text-sm text-white/60 space-y-3">
              <div>{listError}</div>
              <button
                onClick={loadConversations}
                className="inline-flex items-center gap-2 text-sm text-white border border-white/20 px-3 py-2 rounded-lg hover:border-white/40"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}
          {showEmptyState && (
            <div className="p-8 text-center text-white/40">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No conversations yet</p>
              <p className="text-xs text-white/30 mt-2">Connect a channel to start receiving messages.</p>
            </div>
          )}
          {!loadingList && !listError && filteredConversations.length > 0 && (
            <div className="divide-y divide-white/5">
              {filteredConversations.map((conversation) => {
                const ChannelIcon = channelIcon[conversation.channel];
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "w-full text-left px-4 py-4 hover:bg-white/5 transition-colors border-l-2",
                      selectedConversationId === conversation.id
                        ? "bg-white/5 border-[var(--color-brand-red)]"
                        : "border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-black/40 text-white/70">
                          <ChannelIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold", conversation.unreadCount ? "text-white" : "text-white/70")}>
                              {conversation.customerName || conversation.customerPhone || "Unknown"}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="text-[10px] font-semibold text-white bg-[var(--color-brand-red)] rounded-full px-2 py-0.5">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/40">{conversation.manager.name}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/40 whitespace-nowrap">{formatDate(conversation.lastMessageAt)}</div>
                    </div>
                    <div className="mt-2 text-xs text-white/60 line-clamp-2">{conversation.lastMessage}</div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider">
                      <span>{channelLabel[conversation.channel]}</span>
                      <span>{conversation.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 bg-[#1E0B0B] flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300",
          showThread ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        {selectedConversation ? (
          <>
            <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-[#250808]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-full text-white/60"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                  {(selectedConversation.customerName || selectedConversation.customerPhone || "U").charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {selectedConversation.customerName || selectedConversation.customerPhone || "Unknown"}
                  </h2>
                  <div className="text-[10px] text-white/50">{channelLabel[selectedConversation.channel]}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedConversation.lastMessageAt)}
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="md:hidden border-b border-white/10 bg-[#1E0B0B]">
                  <button
                    onClick={() => setShowContext((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs text-white/70"
                  >
                    <span>{context?.managerName || "Context"}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showContext ? "rotate-180" : "")} />
                  </button>
                  {showContext && (
                    <div className="px-4 pb-4">
                      {contextError && (
                        <div className="text-xs text-white/50">{contextError}</div>
                      )}
                      {loadingContext && (
                        <div className="text-xs text-white/40 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Updating context...
                        </div>
                      )}
                      {context && (
                        <div className="space-y-3">
                          <div className="text-xs text-white/40">Updated {formatTime(context.updatedAt)}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {context.fields.map((field) => (
                              <div key={field.label} className="bg-black/30 border border-white/10 rounded-lg p-2">
                                <div className="text-white/40">{field.label}</div>
                                <div
                                  className={cn(
                                    "text-white mt-1",
                                    field.tone === "good" && "text-emerald-300",
                                    field.tone === "warn" && "text-amber-300",
                                    field.tone === "bad" && "text-red-300"
                                  )}
                                >
                                  {field.value}
                                </div>
                              </div>
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
                          {context.quickActions.filter((action) => action.variant === "secondary").length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {context.quickActions
                                .filter((action) => action.variant === "secondary")
                                .map((action) => (
                                  <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action)}
                                    disabled={action.disabled || sending}
                                    className="text-xs text-white/80 border border-white/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                            </div>
                          )}
                          <div className="text-[10px] text-white/40">{channelConstraint[selectedConversation.channel]}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1E0B0B]">
                  {loadingThread && (
                    <div className="text-sm text-white/40 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading messages...
                    </div>
                  )}
                  {threadError && (
                    <div className="text-sm text-white/50">{threadError}</div>
                  )}
                  {!loadingThread && !threadError && messages.length === 0 && (
                    <div className="text-sm text-white/40">No messages in this conversation yet.</div>
                  )}
                  {messages.map((message) => {
                    const isCustomer = message.senderType === "customer";
                    const isAi = message.senderType === "ai";
                    return (
                      <div
                        key={message.id}
                        className={cn("flex gap-3 max-w-[85%]", isCustomer ? "" : "ml-auto flex-row-reverse")}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1",
                            isCustomer ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-white/10 border border-white/10"
                          )}
                        >
                          {isCustomer ? (selectedConversation.customerName || selectedConversation.customerPhone || "U").charAt(0) : isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div
                            className={cn(
                              "rounded-2xl p-3 text-sm leading-relaxed shadow-sm",
                              isCustomer
                                ? "bg-[#2A0A0A] border border-white/10 rounded-tl-none text-white/90"
                                : "bg-white/10 border border-white/10 rounded-tr-none text-white"
                            )}
                          >
                            {message.content}
                          </div>
                          <div className={cn("text-[10px] mt-1 flex items-center gap-2", isCustomer ? "text-white/30 ml-1" : "text-white/40 justify-end mr-1")}>
                            <span>{formatTime(message.timestamp)}</span>
                            <span>{isAi ? "AI" : isCustomer ? "Customer" : "You"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-[#250808] border-t border-white/10 pb-safe md:pb-3 space-y-3">
                  <div className="flex items-end gap-2 bg-[#1E0B0B] border border-white/10 rounded-2xl p-2 focus-within:border-white/30 transition-colors">
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none max-h-32 py-2 resize-none"
                      rows={1}
                    />
                    <button
                      onClick={() => handleSend("human")}
                      disabled={!replyText.trim() || sending}
                      className="p-2 bg-white/10 text-white rounded-full disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {loadingSuggestions && (
                        <span className="text-[10px] text-white/40">Loading AI replies...</span>
                      )}
                      {!loadingSuggestions &&
                        suggestions.slice(0, 3).map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setReplyText(suggestion)}
                            className="text-xs text-white/80 border border-white/10 px-3 py-1.5 rounded-full hover:border-white/40"
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                    <button
                      onClick={() => handleSend("ai")}
                      disabled={!replyText.trim() || sending}
                      className="text-xs font-semibold bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-full disabled:opacity-50"
                    >
                      Send as AI
                    </button>
                  </div>
                  <div className="text-[10px] text-white/40 flex items-center gap-2">
                    <ArrowDownLeft className="w-3 h-3" />
                    Sending as AI uses credits
                  </div>
                </div>
              </div>

              <div className="hidden md:flex w-80 bg-[#140707] border-l border-white/10 flex-col p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/40">Context</div>
                    <div className="text-sm font-semibold text-white">{context?.managerName || selectedConversation.manager.name}</div>
                  </div>
                  <button
                    onClick={() => loadContext(selectedConversation.id)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Refresh
                  </button>
                </div>
                {loadingContext && (
                  <div className="text-xs text-white/40 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating context...
                  </div>
                )}
                {contextError && (
                  <div className="text-xs text-white/50">{contextError}</div>
                )}
                {context && (
                  <>
                    <div className="text-[10px] text-white/40">Updated {formatTime(context.updatedAt)}</div>
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      {context.fields.map((field) => (
                        <div key={field.label} className="bg-black/30 border border-white/10 rounded-lg p-3">
                          <div className="text-white/40">{field.label}</div>
                          <div
                            className={cn(
                              "text-white mt-1",
                              field.tone === "good" && "text-emerald-300",
                              field.tone === "warn" && "text-amber-300",
                              field.tone === "bad" && "text-red-300"
                            )}
                          >
                            {field.value}
                          </div>
                        </div>
                      ))}
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
                    {context.quickActions.filter((action) => action.variant === "secondary").length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {context.quickActions
                          .filter((action) => action.variant === "secondary")
                          .map((action) => (
                            <button
                              key={action.id}
                              onClick={() => handleQuickAction(action)}
                              disabled={action.disabled || sending}
                              className="text-xs text-white/80 border border-white/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              {action.label}
                            </button>
                          ))}
                      </div>
                    )}
                    <div className="text-[10px] text-white/40">{channelConstraint[selectedConversation.channel]}</div>
                  </>
                )}
                {!context && !loadingContext && (
                  <div className="text-xs text-white/40">Context will appear here once available.</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-white/30">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">Select a conversation to view details</p>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/70">
          <div className="bg-[#1E0B0B] border-t border-white/10 rounded-t-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Filters</div>
              <button onClick={() => setShowFilters(false)} className="text-xs text-white/50">
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs border",
                  unreadOnly ? "border-white/60 text-white" : "border-white/10 text-white/70"
                )}
              >
                Unread only
              </button>
              {(["all", "whatsapp", "instagram", "messenger", "web"] as const).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setChannelFilter(channel)}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs border",
                    channelFilter === channel ? "border-white/60 text-white" : "border-white/10 text-white/70"
                  )}
                >
                  {channel === "all" ? "All channels" : channelLabel[channel]}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-2">AI Manager</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setManagerFilter("all")}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs border",
                    managerFilter === "all" ? "border-white/60 text-white" : "border-white/10 text-white/70"
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
                      managerFilter === slug ? "border-white/60 text-white" : "border-white/10 text-white/70"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Status</div>
              <div className="flex flex-wrap gap-2">
                {(["all", "open", "pending", "paid", "scheduled"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-2 rounded-full text-xs border",
                      statusFilter === status ? "border-white/60 text-white" : "border-white/10 text-white/70"
                    )}
                  >
                    {status === "all" ? "All status" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
