
'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { AnalyticsService, TimeRange } from "@/lib/services/analyticsService";

export async function getPersonaMetricsAction(businessType: string, range: TimeRange = '30d') {
  const tenantId = await requireActiveTenant();
  return await AnalyticsService.getPersonaMetrics(tenantId, businessType, range);
}

export async function getAIROIMetricsAction(range: TimeRange = '30d') {
  const tenantId = await requireActiveTenant();
  return await AnalyticsService.getAIROIMetrics(tenantId, range);
}
