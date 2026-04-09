"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  User,
  Tag,
  Edit3,
  Save,
  X,
  Clock,
  ChevronRight,
  Calendar,
  CreditCard,
} from "lucide-react";

type Contact = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  notes: string | null;
  customerType: string;
  lifetimeValue: number;
  channels: string[];
  identifiers: {
    identifier_type: string;
    identifier_value: string;
    channel: string;
    last_seen_at: string;
  }[];
  totalBookings: number;
  totalSpent: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-green-500" />,
  instagram: <MessageCircle className="h-4 w-4 text-pink-500" />,
  telegram: <MessageSquare className="h-4 w-4 text-blue-500" />,
  web: <Globe className="h-4 w-4 text-gray-500" />,
  airbnb: <Globe className="h-4 w-4 text-green-600" />,
  default: <User className="h-4 w-4 text-gray-400" />,
};

type Message = {
  id: string;
  content: string | null;
  direction: string;
  channel: string | null;
  created_at: string;
  role: string;
};

const customerTypeColors: Record<string, string> = {
  vip: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  customer: "bg-green-500/20 text-green-400 border-green-500/30",
  lead: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  prospect: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const directionColors: Record<string, string> = {
  inbound: "bg-primary/10 text-primary",
  outbound: "bg-secondary/10 text-secondary-foreground",
  guest: "bg-blue-500/10 text-blue-600",
  agent: "bg-purple-500/10 text-purple-600",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTags, setEditingTags] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contacts/${params.id}`);
        const data = await response.json();
        setContact(data.contact);
        setTagsInput(data.contact?.tags?.join(", ") || "");
        setNotesInput(data.contact?.notes || "");
        
        const messagesResponse = await fetch(`/api/contacts/${params.id}/history`);
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      } catch (error) {
        console.error("Failed to fetch contact:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [params.id]);

  const handleSaveTags = async () => {
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const data = await response.json();
      setContact(data.contact);
      setEditingTags(false);
    } catch (error) {
      console.error("Failed to update tags:", error);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesInput }),
      });
      const data = await response.json();
      setContact(data.contact);
      setEditingNotes(false);
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">Customer not found</p>
        <Link href="/dashboard/ai/customers" className="text-primary hover:underline mt-2 inline-block">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/ai/customers"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {contact.name || "Unknown Customer"}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${customerTypeColors[contact.customerType] || customerTypeColors.prospect}`}>
              {contact.customerType}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unified customer profile across {contact.channels.length} channel{contact.channels.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Contact Info</h2>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{contact.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  First seen: {formatDate(contact.firstSeenAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Last seen: {formatDate(contact.lastSeenAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Channels</h2>
            <div className="flex flex-wrap gap-2">
              {contact.channels.map(channel => (
                <div key={channel} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  {channelIcons[channel] || channelIcons.default}
                  <span className="text-sm capitalize text-foreground">{channel}</span>
                </div>
              ))}
            </div>
            
            <h3 className="font-medium text-foreground mt-4 mb-2">All Identifiers</h3>
            <div className="space-y-2">
              {contact.identifiers?.map((id, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {channelIcons[id.channel] || channelIcons.default}
                    <span className="text-muted-foreground">{id.identifier_type}:</span>
                  </div>
                  <span className="text-foreground font-mono text-xs">{id.identifier_value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h2>
              {!editingTags && (
                <button
                  onClick={() => setEditingTags(true)}
                  className="p-1.5 hover:bg-muted rounded"
                >
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {editingTags ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTags(false);
                      setTagsInput(contact.tags.join(", "));
                    }}
                    className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {contact.tags.length > 0 ? (
                  contact.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No tags</span>
                )}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Notes</h2>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="p-1.5 hover:bg-muted rounded"
                >
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      setNotesInput(contact.notes || "");
                    }}
                    className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {contact.notes || "No notes"}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversation History
              </h2>
              <span className="text-xs text-muted-foreground">{messages.length} messages</span>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversation history yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.direction === "inbound" || msg.role === "guest"
                        ? "bg-muted ml-4"
                        : "bg-primary/10 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${directionColors[msg.role] || directionColors.guest}`}>
                          {msg.role}
                        </span>
                        {msg.channel && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {channelIcons[msg.channel]}
                            {msg.channel}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mt-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking Stats
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">{contact.totalBookings}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">₹{contact.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">₹{contact.lifetimeValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Lifetime Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
