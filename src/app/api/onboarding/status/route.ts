import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { OnboardingService } from "@/lib/services/onboardingService";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    const status = await OnboardingService.getStatus(user.id);

    // Map service step to client status
    const clientStatus = status.step === "ready" ? "ready" : "processing";

    return NextResponse.json({ 
      status: clientStatus,
      step: status.step,
      debug: process.env.NODE_ENV === 'development' ? {
        onboardingStatus: status.isComplete,
        tenantId: status.tenantId,
        businessType: status.businessType
      } : undefined
    });
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
