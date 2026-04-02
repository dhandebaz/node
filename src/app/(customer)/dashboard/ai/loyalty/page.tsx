"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";
import { Star, Award, Gift, TrendingUp, Users, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface GuestLoyalty {
  id: string;
  guest_id: string;
  guest_name: string;
  guest_phone: string;
  total_bookings: number;
  total_spent: number;
  loyalty_tier: string;
  points: number;
  last_booking_at: string;
}

const TIER_CONFIG = {
  bronze: { min: 0, color: "text-amber-700", bg: "bg-amber-100", next: "silver", pointsPerRupee: 1 },
  silver: { min: 5, color: "text-gray-400", bg: "bg-gray-200", next: "gold", pointsPerRupee: 1.5 },
  gold: { min: 15, color: "text-yellow-500", bg: "bg-yellow-100", next: "platinum", pointsPerRupee: 2 },
  platinum: { min: 30, color: "text-purple-500", bg: "bg-purple-100", next: null, pointsPerRupee: 3 },
};

export default function LoyaltyPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);

  const [guests, setGuests] = useState<GuestLoyalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"points" | "bookings" | "spent">("points");

  useEffect(() => {
    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  const loadData = async () => {
    try {
      const data = await fetchWithAuth<{ guests: GuestLoyalty[] }>(`/api/loyalty?tenant_id=${tenant?.id}`);
      setGuests(data.guests || []);
    } catch (error) {
      console.error("Failed to load loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze;

  const filteredGuests = guests
    .filter(g => filterTier === "all" || g.loyalty_tier === filterTier)
    .sort((a, b) => {
      if (sortBy === "points") return b.points - a.points;
      if (sortBy === "bookings") return b.total_bookings - a.total_bookings;
      return b.total_spent - a.total_spent;
    });

  const totalGuests = guests.length;
  const totalBookings = guests.reduce((sum, g) => sum + g.total_bookings, 0);
  const totalRevenue = guests.reduce((sum, g) => sum + g.total_spent, 0);
  const avgBookings = totalGuests ? (totalBookings / totalGuests).toFixed(1) : "0";

  const tierCounts = {
    platinum: guests.filter(g => g.loyalty_tier === "platinum").length,
    gold: guests.filter(g => g.loyalty_tier === "gold").length,
    silver: guests.filter(g => g.loyalty_tier === "silver").length,
    bronze: guests.filter(g => g.loyalty_tier === "bronze").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">Track guest loyalty and reward top customers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{totalGuests}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Members</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{totalBookings}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Bookings</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{avgBookings}</div>
          <p className="text-sm text-muted-foreground mt-1">Avg Bookings/Guest</p>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(tierCounts).map(([tier, count]) => {
          const info = getTierInfo(tier);
          return (
            <div key={tier} className={cn("border rounded-lg p-4", info.bg)}>
              <div className={cn("text-lg font-bold capitalize", info.color)}>
                {tier}
              </div>
              <p className="text-sm text-muted-foreground">{count} members</p>
              {info.next && (
                <p className="text-xs text-muted-foreground mt-1">
                  {TIER_CONFIG[info.next as keyof typeof TIER_CONFIG].min - info.min}+ bookings to upgrade
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Tiers</option>
          <option value="platinum">Platinum</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="points">Sort by Points</option>
          <option value="bookings">Sort by Bookings</option>
          <option value="spent">Sort by Spent</option>
        </select>
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No loyalty members yet</h3>
          <p className="text-muted-foreground">Guest loyalty data will appear here</p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Guest</th>
                <th className="text-left p-4 text-sm font-medium">Tier</th>
                <th className="text-right p-4 text-sm font-medium">Bookings</th>
                <th className="text-right p-4 text-sm font-medium">Spent</th>
                <th className="text-right p-4 text-sm font-medium">Points</th>
                <th className="text-right p-4 text-sm font-medium">Last Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredGuests.map(guest => {
                const info = getTierInfo(guest.loyalty_tier);
                const nextTier = info.next ? TIER_CONFIG[info.next as keyof typeof TIER_CONFIG] : null;
                const pointsToNext = nextTier 
                  ? (nextTier.min - guest.total_bookings) * 100 * info.pointsPerRupee
                  : 0;
                
                return (
                  <tr key={guest.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{guest.guest_name}</div>
                      <div className="text-sm text-muted-foreground">{guest.guest_phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", info.bg, info.color)}>
                        {guest.loyalty_tier}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">{guest.total_bookings}</td>
                    <td className="p-4 text-right font-medium">₹{guest.total_spent.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{guest.points.toLocaleString()}</div>
                      {pointsToNext > 0 && (
                        <div className="text-xs text-muted-foreground">{pointsToNext} pts to {nextTier?.min} bookings</div>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-muted-foreground">
                      {guest.last_booking_at ? format(parseISO(guest.last_booking_at), "MMM d, yyyy") : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
