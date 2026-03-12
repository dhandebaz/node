import { getActiveTenantId } from "@/lib/auth/tenant";
import { WalletService } from "@/lib/services/walletService";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import { ControlService } from "@/lib/services/controlService";
import { WalletUI } from "./WalletUI";
import { UPISettings } from "@/components/dashboard/billing/UPISettings";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/onboarding");
  
  const [balance, history, usage24h, plan] = await Promise.all([
    WalletService.getBalance(tenantId),
    WalletService.getHistory(tenantId, 50),
    WalletService.getUsage24h(tenantId),
    SubscriptionService.getTenantPlan(tenantId)
  ]);

  // Determine Pause Status
  let isPaused = false;
  let pauseReason = "";

  try {
    // 1. Check System/Admin Controls
    await ControlService.checkAction(tenantId, 'ai');
    
    // 2. Check Wallet Balance (if system checks pass)
    // We use a small threshold (e.g. 1 credit) or 0 to determine "empty"
    if (balance <= 0) {
      isPaused = true;
      pauseReason = "Insufficient wallet balance. Please top up to resume AI actions.";
    }
  } catch (error: any) {
    isPaused = true;
    pauseReason = error.message;
  }

  return (
    <div className="space-y-8">
      <WalletUI 
        initialBalance={balance} 
        history={history} 
        usage24h={usage24h}
        plan={plan}
        isPaused={isPaused}
        pauseReason={pauseReason}
      />
      <div className="grid md:grid-cols-2 gap-8">
        <UPISettings />
      </div>
    </div>
  );
}
