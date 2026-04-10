import { Conversation } from "@/components/dashboard/ai/inbox/ConversationListItem";

export type ConversationMessage = {
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

export type ContextField = {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "bad";
};

export type QuickAction = {
  id: string;
  label: string;
  action: "send_payment_link" | "request_id" | "send_guide" | "custom";
  icon: string;
  description: string;
};

export type MessageStatus = "sending" | "sent" | "failed" | "delivered" | "read";

export type InboxViewMode = "list" | "pipeline";
