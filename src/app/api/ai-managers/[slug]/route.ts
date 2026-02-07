import { NextRequest, NextResponse } from "next/server";
import { aiManagerPricingService } from "@/lib/services/aiManagerPricingService";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const manager = await aiManagerPricingService.getManager(slug);
    if (!manager) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(manager);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch AI manager" }, { status: 500 });
  }
}
