"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, MessageCircle, UserPlus } from "lucide-react";

interface CustomerStats {
  total: number;
  vip: number;
  customers: number;
  leads: number;
  prospects: number;
  totalLTV: number;
  newThisWeek: number;
  crossChannelLinks: number;
}

export function CustomerStatsWidget() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/contacts/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch customer stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Customers",
      value: stats.total,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "New This Week",
      value: stats.newThisWeek,
      icon: UserPlus,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Active Channels",
      value: stats.crossChannelLinks,
      icon: MessageCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "Lifetime Value",
      value: `₹${(stats.totalLTV / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
