"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGrowthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/growth")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Growth & Referrals</h1>
        <p className="text-white/60">Monitor tenant acquisition and referral health.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">New Tenants (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.newTenantsToday}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">New Tenants (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.newTenants30d}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {data.totalReferrals > 0 
                ? `${Math.round((data.rewardedReferrals / data.totalReferrals) * 100)}%` 
                : "0%"}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {data.rewardedReferrals} rewarded
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Referral Pipeline</CardTitle>
                <CardDescription className="text-white/50">Status distribution of all referrals</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Object.entries(data.referralsByStatus || {}).map(([status, count]: [string, any]) => (
                        <div key={status} className="flex items-center justify-between">
                            <span className="capitalize text-white/70">{status.replace('_', ' ')}</span>
                            <span className="font-mono text-white">{count}</span>
                        </div>
                    ))}
                    {Object.keys(data.referralsByStatus || {}).length === 0 && (
                        <div className="text-white/40 text-sm">No referrals yet.</div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
