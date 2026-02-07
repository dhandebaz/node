export type AiManagerStatus = "active" | "disabled";

export interface AiManager {
  slug: string;
  name: string;
  audience: string;
  responsibility: string;
  status: AiManagerStatus;
  baseMonthlyPrice: number;
  integrations: string[];
  features: string[];
}

export interface PublicPricingItem {
  slug: string;
  name: string;
  status: AiManagerStatus;
  baseMonthlyPrice: number;
}

export interface PricingEstimateInput {
  avgMessagesPerDay: number;
  avgTokensPerMessage: number;
  integrationsUsed: string[];
  calendarSyncsPerDay: number;
}

export interface PricingEstimateResult {
  estimatedMonthlyInfraCost: number;
  estimatedMonthlyTokenCost: number;
  estimatedMonthlyTotalCost: number;
  suggestedMinimumPrice: number;
}
