"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MessageSquareShare,
  Phone,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { getCsrfToken } from "@/lib/api/csrf";

type Message = {
  id: string;
  content: string;
  sender: "guest" | "business";
  timestamp: string;
  status?: "sending" | "sent" | "error";
};

type GuestSession = {
  id: string;
  name: string;
  phone?: string;
  conversationId: string;
};

const inputClassName = "public-input";

export default function PublicChatPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const storageKey = useMemo(() => `nodebase_chat_${businessId}`, [businessId]);

  const [session, setSession] = useState<GuestSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(storageKey);
    } finally {
      setInitializing(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?conversationId=${session.conversationId}`);
        if (!response.ok) return;

        const data = await response.json();
        setMessages((current) => {
          const localOnly = current.filter((message) => message.status === "sending");
          const merged = [...data, ...localOnly];
          const unique = new Map(merged.map((message) => [message.id, message]));
          return [...unique.values()].sort(
            (left, right) =>
              new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
          );
        });
      } catch {
        // Silent polling failure, the surface keeps the last known state.
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleStartChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const csrf = getCsrfToken();
      const response = await fetch("/api/chat/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        body: JSON.stringify({ businessId, name: name.trim(), phone: phone.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Could not start chat.");
      }

      const data = await response.json();
      const nextSession = {
        id: data.guestId,
        name: name.trim(),
        phone: phone.trim(),
        conversationId: data.conversationId,
      };

      setSession(nextSession);
      localStorage.setItem(storageKey, JSON.stringify(nextSession));
    } catch (err: any) {
      setError(err?.message || "Could not start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, tempId: string) => {
    if (!session) return;

    try {
      const csrf = getCsrfToken();
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        body: JSON.stringify({
          conversationId: session.conversationId,
          content,
          sender: "guest",
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to send message.");
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === tempId ? { ...message, status: "sent" } : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === tempId ? { ...message, status: "error" } : message,
        ),
      );
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !session) return;

    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content,
      sender: "guest",
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((current) => [...current, tempMessage]);
    setInput("");
    await sendMessage(content, tempId);
  };

  const handleRetry = (message: Message) => {
    if (message.status !== "error") return;

    setMessages((current) =>
      current.map((entry) =>
        entry.id === message.id ? { ...entry, status: "sending" } : entry,
      ),
    );
    void sendMessage(message.content, message.id);
  };

  const handleResetConversation = () => {
    localStorage.removeItem(storageKey);
    setSession(null);
    setMessages([]);
    setInput("");
    setError(null);
  };

  if (initializing) {
    return (
      <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-[2rem] border border-border bg-background/90 px-6 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,1.08fr)]">
          <section className="public-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="relative z-10 space-y-6">
              <div className="public-pill public-eyebrow">Guest messaging portal</div>
              <h1 className="public-display text-4xl leading-[0.94] text-foreground sm:text-5xl">
                Start a direct conversation without calling the host repeatedly.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This chat surface is designed for guest questions, arrival coordination,
                and operational follow-up. Start with your name, then message as needed.
              </p>
              <div className="grid gap-3">
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">Use this for</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">
                    Arrival questions, check-in coordination, and host follow-up
                  </div>
                </div>
                <div className="public-inset rounded-[1.3rem] px-4 py-4">
                  <div className="public-eyebrow">What happens next</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">
                    Your chat thread stays tied to the business workflow rather than a generic web form.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="public-panel-soft p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <div className="public-eyebrow">Start chat</div>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  Tell the host who you are.
                </h2>
              </div>

              <form onSubmit={handleStartChat} className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Name
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      className={`${inputClassName} pl-11`}
                    />
                  </div>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Phone (optional)
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className={`${inputClassName} pl-11`}
                    />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-[1.3rem] border border-[rgba(146,43,34,0.16)] bg-[rgba(214,88,74,0.08)] px-4 py-3 text-sm leading-6 text-primary">
                    {error}
                  </div>
                ) : null}

                <button
                  disabled={loading}
                  className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareShare className="h-4 w-4" />}
                  Start chat
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="public-panel-soft p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10/70 text-primary">
                <MessageSquareShare className="h-5 w-5" />
              </div>
              <div>
                <div className="public-eyebrow">Active conversation</div>
                <h1 className="mt-2 text-2xl font-semibold text-foreground">
                  Guest thread for {session.name}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use this window to message the business. Replies refresh automatically.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetConversation}
              className="public-button-secondary px-5 py-3 text-sm font-semibold"
            >
              Start over
            </button>
          </div>
        </section>

        <section className="public-panel p-4 sm:p-6">
          <div className="relative z-10 grid gap-4">
            <div
              ref={scrollRef}
              className="min-h-[28rem] max-h-[34rem] space-y-3 overflow-y-auto rounded-[1.6rem] border border-border bg-[rgba(255,251,244,0.72)] p-4"
            >
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[20rem] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div className="public-inset mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10/75 text-primary">
                      <MessageSquareShare className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-foreground">
                      Conversation opened
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Send the first message when you are ready. This is the cleanest
                      way to coordinate with the business without switching channels.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isGuest = message.sender === "guest";

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-[0_10px_18px_rgba(43,29,16,0.06)]",
                          isGuest
                            ? "bg-primary text-white"
                            : "border border-border bg-white text-foreground",
                        ].join(" ")}
                      >
                        <div>{message.content}</div>
                        <div
                          className={`mt-2 flex items-center gap-2 text-[11px] ${
                            isGuest ? "text-white/75" : "text-muted-foreground"
                          }`}
                        >
                          <span>
                            {new Intl.DateTimeFormat("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(message.timestamp))}
                          </span>
                          {isGuest && message.status === "sending" ? <span>Sending...</span> : null}
                          {isGuest && message.status === "error" ? (
                            <span className="inline-flex items-center gap-1 text-[rgb(122,29,22)]">
                              <AlertCircle className="h-3 w-3" />
                              Failed
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {message.status === "error" ? (
                        <button
                          type="button"
                          onClick={() => handleRetry(message)}
                          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                className={`${inputClassName} flex-1`}
              />
              <button
                disabled={!input.trim()}
                className="public-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div>This thread refreshes automatically every few seconds.</div>
              <div className="public-pill text-[11px] font-semibold text-muted-foreground">
                Workflow-linked guest conversation
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
