'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";

export async function generateComplianceDocumentAction(docType: 'shop_act' | 'gst' | 'sop') {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('business_type')
    .eq('id', tenantId)
    .single();

  if (error || !tenant) {
    throw new Error('Tenant not found');
  }

  const prompt = `You are an expert Indian corporate lawyer and compliance officer. Generate a comprehensive, step-by-step compliance guide for a ${tenant.business_type} business in India focusing on ${docType}. Include document checklists, government portal links, and anti-bribery legal rights. Format beautifully in Markdown.`;

  const response = await geminiService.generateText(prompt);
  return { success: true, markdown: response };
}
