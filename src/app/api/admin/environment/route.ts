import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";

interface EnvVar {
  name: string;
  value: string | null;
  required: boolean;
  category: string;
}

const REQUIRED_VARS: EnvVar[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", value: null, required: true, category: "Supabase" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: null, required: true, category: "Supabase" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", value: null, required: true, category: "Supabase" },
  { name: "UPSTASH_REDIS_REST_URL", value: null, required: true, category: "Cache" },
  { name: "UPSTASH_REDIS_REST_TOKEN", value: null, required: true, category: "Cache" },
  { name: "GEMINI_API_KEY", value: null, required: false, category: "AI" },
  { name: "OPENAI_API_KEY", value: null, required: false, category: "AI" },
  { name: "ANTHROPIC_API_KEY", value: null, required: false, category: "AI" },
  { name: "AI_GATEWAY_API_KEY", value: null, required: false, category: "AI" },
  { name: "RAZORPAY_KEY_ID", value: null, required: false, category: "Payments" },
  { name: "RAZORPAY_KEY_SECRET", value: null, required: false, category: "Payments" },
  { name: "META_APP_ID", value: null, required: false, category: "Integrations" },
  { name: "META_APP_SECRET", value: null, required: false, category: "Integrations" },
  { name: "META_VERIFY_TOKEN", value: null, required: false, category: "Integrations" },
  { name: "TELEGRAM_BOT_TOKEN", value: null, required: false, category: "Integrations" },
  { name: "WHATSAPP_TOKEN", value: null, required: false, category: "Integrations" },
  { name: "WHATSAPP_PHONE_ID", value: null, required: false, category: "Integrations" },
  { name: "NEXT_PUBLIC_APP_URL", value: null, required: false, category: "App" },
];

const SENSITIVE_KEYS = ["SECRET", "KEY", "TOKEN", "PASSWORD", "CREDENTIALS"];

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const envStatus = REQUIRED_VARS.map(v => {
      const actualValue = process.env[v.name];
      const isSet = !!actualValue;
      const isSensitive = SENSITIVE_KEYS.some(sk => v.name.includes(sk));
      
      return {
        name: v.name,
        is_set: isSet,
        is_sensitive: isSensitive,
        is_required: v.required,
        category: v.category,
        display_value: isSet 
          ? (isSensitive ? "••••••••" : actualValue?.substring(0, 8) + "...")
          : "NOT SET",
      };
    });

    const byCategory: Record<string, typeof envStatus> = {};
    envStatus.forEach(v => {
      if (!byCategory[v.category]) {
        byCategory[v.category] = [];
      }
      byCategory[v.category].push(v);
    });

    const requiredMissing = envStatus.filter(v => v.is_required && !v.is_set).length;
    const optionalMissing = envStatus.filter(v => !v.is_required && !v.is_set).length;

    return NextResponse.json({
      status: requiredMissing === 0 ? "healthy" : "degraded",
      summary: {
        total: envStatus.length,
        required_missing: requiredMissing,
        optional_missing: optionalMissing,
        all_set: requiredMissing === 0,
      },
      by_category: byCategory,
      all_vars: envStatus,
    });
  } catch (error) {
    console.error("Error fetching env status:", error);
    return NextResponse.json(
      { error: "Failed to fetch environment status" },
      { status: 500 }
    );
  }
}
