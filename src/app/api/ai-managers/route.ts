import { NextResponse } from "next/server";
import { aiManagerPricingService } from "@/lib/services/aiManagerPricingService";

export async function GET() {
  try {
    const managers = await aiManagerPricingService.getManagers();
    return NextResponse.json(managers);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch AI managers" }, { status: 500 });
  }
}
