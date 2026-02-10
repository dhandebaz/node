import { NextResponse } from "next/server";
import { WalletService } from "@/lib/services/walletService";

export async function POST(req: Request) {
  try {
    const { tenant_id, amount, reason } = await req.json();
    
    if (!tenant_id || amount === undefined || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const success = await WalletService.adjustBalance(tenant_id, Number(amount), reason);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to adjust balance" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
