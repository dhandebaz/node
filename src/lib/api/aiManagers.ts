import { AiManager, PublicPricingItem, PricingEstimateResult } from "@/types/ai-managers";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export async function fetchAiManagers(): Promise<AiManager[]> {
  const response = await fetch("/api/ai-managers", { cache: "no-store" });
  return handleResponse(response);
}

export async function fetchAiManager(slug: string): Promise<AiManager> {
  const response = await fetch(`/api/ai-managers/${slug}`, { cache: "no-store" });
  return handleResponse(response);
}

export async function fetchPublicPricing(): Promise<PublicPricingItem[]> {
  const response = await fetch("/api/pricing/public", { cache: "no-store" });
  return handleResponse(response);
}

export async function updateAdminPricing(slug: string, baseMonthlyPrice: number, status: "active" | "disabled") {
  const response = await fetch("/api/admin/pricing/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, baseMonthlyPrice, status })
  });
  return handleResponse(response);
}

export async function fetchPricingEstimate(params: {
  avgMessagesPerDay: number;
  avgTokensPerMessage: number;
  calendarSyncsPerDay: number;
  integrationsUsed: string[];
}): Promise<PricingEstimateResult> {
  const search = new URLSearchParams({
    avgMessagesPerDay: String(params.avgMessagesPerDay),
    avgTokensPerMessage: String(params.avgTokensPerMessage),
    calendarSyncsPerDay: String(params.calendarSyncsPerDay),
    integrationsUsed: params.integrationsUsed.join(",")
  });
  const response = await fetch(`/api/admin/pricing/estimate?${search.toString()}`, { cache: "no-store" });
  return handleResponse(response);
}
