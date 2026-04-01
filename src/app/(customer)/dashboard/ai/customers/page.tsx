"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Search,
  Filter,
  ChevronRight,
  Tag,
  User,
  Loader2,
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
  default: <User className="h-4 w-4 text-gray-400" />
};

const customerTypeColors: Record<string, string> = {
  vip: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  customer: "bg-green-500/20 text-green-400 border-green-500/30",
  lead: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  prospect: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export default function CustomersPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (searchParams.get("q")) params.set("search", searchParams.get("q")!);

        const response = await fetch(`/api/contacts?${params}`);
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchContacts, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [search, searchParams]);

  const allChannels = [...new Set(contacts.flatMap(c => c.channels))];

  const filteredContacts = contacts.filter(contact => {
    if (filterChannel && !contact.channels.includes(filterChannel)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unified customer profiles across all channels
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterChannel(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filterChannel
                ? "bg-primary text-primary-foreground"
                : "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {allChannels.map(channel => (
            <button
              key={channel}
              onClick={() => setFilterChannel(channel === filterChannel ? null : channel)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                channel === filterChannel
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {channelIcons[channel] || channelIcons.default}
              {channel}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No customers found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map(contact => (
            <a
              key={contact.id}
              href={`/dashboard/ai/customers/${contact.id}`}
              className="block bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground">
                    {contact.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      {contact.name || "Unknown"}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${customerTypeColors[contact.customerType] || customerTypeColors.prospect}`}>
                        {contact.customerType}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {contact.channels.map(channel => (
                        <span key={channel} className="flex items-center gap-1 text-xs text-muted-foreground">
                          {channelIcons[channel] || channelIcons.default}
                          {channel}
                        </span>
                      ))}
                      {contact.tags.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {contact.tags.slice(0, 3).join(", ")}
                          {contact.tags.length > 3 && ` +${contact.tags.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {contact.totalSpent > 0 && (
                      <p className="text-sm font-medium text-foreground">
                        ₹{contact.totalSpent.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Last seen {contact.lastSeenAt ? new Date(contact.lastSeenAt).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
