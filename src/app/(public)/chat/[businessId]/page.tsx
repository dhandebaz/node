"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Phone, MessageSquare, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";

// Types
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

export default function PublicChatPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  
  const [session, setSession] = useState<GuestSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Load session from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`nodebase_chat_${businessId}`);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setInitializing(false);
  }, [businessId]);

  // Poll for messages if session exists
  useEffect(() => {
    if (!session) return;
    
    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/messages?conversationId=${session.conversationId}`);
            if (res.ok) {
                const data = await res.json();
                // Merge with local state to preserve "sending" status if any?
                // Actually, if we poll, we might overwrite local optimistic updates.
                // Simple strategy: only add new messages that we don't have.
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMsgs = data.filter((m: Message) => !existingIds.has(m.id));
                    
                    // Also update status of sent messages if they appear in backend
                    // But backend IDs might be UUIDs vs our timestamp IDs.
                    // This is tricky without a temporary ID mapping.
                    // For now, let's just append new ones and keep local ones until reload.
                    // Or better: Re-fetch all and replace, but that kills "sending" state.
                    
                    if (newMsgs.length === 0) return prev;
                    return [...prev, ...newMsgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [session]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
        const res = await fetch("/api/chat/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId, name, phone })
        });
        
        if (!res.ok) throw new Error("Failed to start chat");
        
        const data = await res.json();
        const newSession = {
            id: data.guestId,
            name,
            phone,
            conversationId: data.conversationId
        };
        
        setSession(newSession);
        localStorage.setItem(`nodebase_chat_${businessId}`, JSON.stringify(newSession));
    } catch (err) {
        alert("Could not start chat. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const sendMessage = async (content: string, tempId: string) => {
    if (!session) return;
    
    try {
        const res = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: session.conversationId,
                content,
                sender: "guest"
            })
        });

        if (!res.ok) throw new Error("Failed");

        setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: "sent" } : m
        ));
    } catch (err) {
        setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: "error" } : m
        ));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session) return;

    const content = input;
    const tempId = Date.now().toString();
    const tempMsg: Message = {
        id: tempId,
        content,
        sender: "guest",
        timestamp: new Date().toISOString(),
        status: "sending"
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInput("");

    await sendMessage(content, tempId);
  };

  const handleRetry = (msg: Message) => {
      if (msg.status === 'error') {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'sending' } : m));
          sendMessage(msg.content, msg.id);
      }
  };

  if (initializing) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!session) {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">Chat with us</h1>
                    <p className="text-zinc-500 mt-2">Enter your details to start chatting.</p>
                </div>
                
                <form onSubmit={handleStartChat} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                        <div className="relative">
                            <User className="w-5 h-5 text-zinc-400 absolute left-3 top-2.5" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Phone (Optional)</label>
                        <div className="relative">
                            <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-2.5" />
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Starting..." : "Start Chat"}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
        <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                 <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h1 className="font-bold text-zinc-900">Support Chat</h1>
                <p className="text-xs text-zinc-500">We usually reply in a few minutes</p>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex flex-col ${msg.sender === 'guest' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        msg.sender === 'guest' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm'
                    }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.sender === 'guest' ? 'text-blue-200' : 'text-zinc-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {msg.sender === 'guest' && (
                                <span>
                                    {msg.status === 'sending' && '...'}
                                    {msg.status === 'error' && <AlertCircle className="w-3 h-3 text-red-300" />}
                                </span>
                            )}
                        </div>
                    </div>
                    {msg.status === 'error' && (
                        <button 
                            onClick={() => handleRetry(msg)}
                            className="text-xs text-red-500 flex items-center gap-1 mt-1 hover:underline"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    )}
                </div>
            ))}
        </div>

        <div className="p-4 bg-white border-t border-zinc-200">
            <form onSubmit={handleSend} className="flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-100 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    disabled={!input.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  );
}