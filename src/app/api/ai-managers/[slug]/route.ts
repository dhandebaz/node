import { NextResponse } from "next/server";
import { aiManagerPricingService } from "@/lib/services/aiManagerPricingService";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const manager = await aiManagerPricingService.getManager(params.slug);
    if (!manager) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(manager);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch AI manager" }, { status: 500 });
  }
}
