import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { PricingService } from "@/lib/services/pricingService";

export async function GET() {
  try {
    await requireAdmin();
    const rules = await PricingService.getRules();
    return NextResponse.json(rules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const updated = await PricingService.updateRules(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}
