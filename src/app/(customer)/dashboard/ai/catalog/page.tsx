import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { 
  ShoppingBag, 
  RefreshCcw, 
  CheckCircle2, 
  History,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { syncCatalogAction } from "@/app/actions/meta-catalog";
import { timeAgo } from "@/lib/utils";

export default async function CatalogPage() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // 1. Get Integration
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("provider", "meta")
    .maybeSingle();

  if (!integration) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] glass-card">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-foreground">Meta Commerce Sync</h2>
        <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm leading-relaxed">
          Sync your product listings to Meta Catalog to sell on Facebook and Instagram Shops.
        </p>
        <Button asChild className="font-bold">
          <Link href="/dashboard/ai/integrations">
            Connect Meta
          </Link>
        </Button>
      </div>
    );
  }

  const meta = (integration.settings as any) || {};
  const lastSync = meta.last_catalog_sync_at;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Meta Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
             Synchronize your listings with the Facebook and Instagram commerce ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
            {/* Using a form action for the sync trigger */}
            <form action={async () => {
                "use server";
                if (meta.active_catalog_id) {
                    await syncCatalogAction(meta.active_catalog_id);
                }
            }}>
                <Button className="font-bold" disabled={!meta.active_catalog_id}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Sync Now
                </Button>
            </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            {/* Sync Status Card */}
            <Card className="glass-card border-none shadow-none bg-primary/5">
                <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Active Connection</h3>
                                <p className="text-sm text-muted-foreground">Successfully linked to Meta Commerce Manager.</p>
                            </div>
                        </div>
                        <Badge className="bg-green-500 text-white font-bold px-3 py-1">Synced</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Last Sync
                            </div>
                            <div className="text-sm font-bold text-foreground">{lastSync ? timeAgo(lastSync) : "Never"}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Catalog ID
                            </div>
                            <div className="text-sm font-bold text-foreground truncate max-w-[120px]">{meta.active_catalog_id || "None set"}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Listings Count
                            </div>
                            <div className="text-sm font-bold text-foreground">Calculating...</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sync Settings */}
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">Product Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl border border-border/50 flex items-center justify-between">
                        <div>
                            <div className="font-bold text-sm">Automatic Daily Sync</div>
                            <p className="text-xs text-muted-foreground">Nodebase will automatically push updates to Meta every 24h.</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold opacity-50">Enterprise Only</Badge>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                        <div>
                            <div className="font-bold text-sm">Custom Price Mapping</div>
                            <p className="text-xs text-muted-foreground">Adjust listing prices specifically for Meta Shop displays.</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">Planned</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">Need help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                        Setting up a Meta Catalog requires a verified Meta Business Account. Your listings will undergo a short review process by Facebook before appearing in your shop.
                    </div>
                    <Button variant="outline" className="w-full font-bold">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Common Issues
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-none bg-zinc-900">
                <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-4">Channel Preview</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center"><ShoppingBag className="w-3 h-3 text-white" /></div>
                            <span className="text-xs font-medium text-zinc-300">Facebook Marketplace</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300">
                            <div className="w-6 h-6 rounded-md bg-pink-600 flex items-center justify-center"><ShoppingBag className="w-3 h-3 text-white" /></div>
                            <span className="text-xs font-medium">Instagram Shop</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300 opacity-50">
                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center"><ShoppingBag className="w-3 h-3 text-white" /></div>
                            <span className="text-xs font-medium">WhatsApp Catalog</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
