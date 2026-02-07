import { NextResponse } from "next/server";
import { aiManagerPricingService } from "@/lib/services/aiManagerPricingService";

export async function GET() {
  try {
    const pricing = await aiManagerPricingService.getPublicPricing();
    return NextResponse.json(pricing);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch pricing" }, { status: 500 });
  }
}
