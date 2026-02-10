import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlService, TenantControlKey } from "@/lib/services/controlService";
import { WalletService } from "@/lib/services/walletService";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: tenantId } = await params;
    const { control, value, reason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: "Reason is required for tenant controls" }, { status: 400 });
    }

    await ControlService.toggleTenantControl(tenantId, control as TenantControlKey, value, session.userId, reason);

    // Special handling for Early Access: Grant bonus credits if enabling
    if (control === 'early_access' && value === true) {
      const BONUS_AMOUNT = 1000;
      const BONUS_TYPE = 'bonus_early_access';
      
      const hasBonus = await WalletService.hasTransactionType(tenantId, BONUS_TYPE);
      if (!hasBonus) {
        await WalletService.addCredits(tenantId, BONUS_AMOUNT, BONUS_TYPE, { 
          reason: 'Early Access Bonus', 
          admin_id: session.userId 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
