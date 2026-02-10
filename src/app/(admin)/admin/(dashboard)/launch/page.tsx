"use client";

import { useEffect, useState, useTransition } from "react";
import { getLaunchData, toggleSystemFlagAction, toggleEarlyAccessAction } from "@/app/actions/launch-control";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, AlertTriangle, Users } from "lucide-react";
import { SystemFlagKey } from "@/lib/services/controlService";

export default function LaunchControlPage() {
  const [data, setData] = useState<{ flags: Record<string, boolean>, tenants: any[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getLaunchData().then(setData);
  }, []);

  const handleFlagToggle = (key: SystemFlagKey, checked: boolean) => {
    startTransition(async () => {
       await toggleSystemFlagAction(key, checked);
       const newData = await getLaunchData();
       setData(newData);
    });
  };

  const handleEarlyAccessToggle = (tenantId: string, checked: boolean) => {
    startTransition(async () => {
      await toggleEarlyAccessAction(tenantId, checked);
      const newData = await getLaunchData();
      setData(newData);
    });
  };

  if (!data) return <div className="p-8 text-white">Loading launch controls...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-500/20 rounded-xl">
          <Rocket className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Launch Control Center</h1>
          <p className="text-white/50">Manage global kill switches and early access rollout.</p>
        </div>
      </div>

      {/* Global Kill Switches */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-500" />
             <CardTitle className="text-white">Global Kill Switches</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Emergency controls to pause system functions globally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
             <div>
               <div className="font-bold text-white">Allow New Signups</div>
               <div className="text-sm text-white/50">If disabled, new users cannot register.</div>
             </div>
             <Switch 
               checked={data.flags['signups_global_enabled'] ?? true} 
               onCheckedChange={(c) => handleFlagToggle('signups_global_enabled', c)}
               disabled={isPending}
             />
           </div>

           <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
             <div>
               <div className="font-bold text-white">Enable AI Globally</div>
               <div className="text-sm text-white/50">Master switch for all AI agents.</div>
             </div>
             <Switch 
               checked={data.flags['ai_global_enabled'] ?? true} 
               onCheckedChange={(c) => handleFlagToggle('ai_global_enabled', c)}
               disabled={isPending}
             />
           </div>
           
           <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
             <div>
               <div className="font-bold text-white">Enable Payments</div>
               <div className="text-sm text-white/50">Master switch for wallet top-ups.</div>
             </div>
             <Switch 
               checked={data.flags['payments_global_enabled'] ?? true} 
               onCheckedChange={(c) => handleFlagToggle('payments_global_enabled', c)}
               disabled={isPending}
             />
           </div>
        </CardContent>
      </Card>

      {/* Early Access Rollout */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Users className="w-5 h-5 text-blue-400" />
             <CardTitle className="text-white">Early Access Rollout (First 100)</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Grant Early Access status to tenants. Grants 1000 bonus credits and priority support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5 text-white/50 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Tenant</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Early Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{tenant.name}</td>
                    <td className="p-4 opacity-70">{tenant.business_type}</td>
                    <td className="p-4 opacity-50">{new Date(tenant.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end">
                         <Switch 
                            checked={tenant.early_access} 
                            onCheckedChange={(c) => handleEarlyAccessToggle(tenant.id, c)}
                            disabled={isPending}
                         />
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
