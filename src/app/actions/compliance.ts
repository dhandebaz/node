'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";

export async function generateComplianceDocumentAction(docType: 'shop_act' | 'gst' | 'sop') {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // Fetch tenant business type
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('business_type')
    .eq('id', tenantId)
    .single();

  if (error || !tenant) {
    throw new Error('Tenant not found');
  }

  const prompt = `You are an expert Indian corporate lawyer and compliance officer. Generate a comprehensive, step-by-step compliance guide for a ${tenant.business_type} business in India focusing on ${docType}. Include document checklists, government portal links, and anti-bribery legal rights. Format beautifully in Markdown.`;

  // We need to use the geminiService to generate text. 
  // Based on the geminiService.ts file we saw, it has verifyDocument and generateReply.
  // We need a method to generate text from a prompt. 
  // Looking at geminiService.ts again, it seems to have a generateReply method but it's tailored for replies.
  // However, we can reuse the underlying logic or add a new method if needed.
  // But the instructions say: Call const response = await geminiService.generateText(prompt);
  // Wait, I need to check if generateText exists on geminiService. 
  // The search result showed verifyDocument and generateReply (which takes history).
  // I might need to check if generateText exists or if I should add it.
  // The user instruction implies it exists or I should use it.
  // Let's assume I need to add it or it's there but wasn't in the snippet.
  // Actually, looking at the snippet, I only saw verifyDocument and generateReply.
  // I will check geminiService.ts content again to be sure. 
  // If it doesn't exist, I'll add it to the service first or implement it here directly if I can't modify the service (but I can).
  // But the instruction says "Inside it, import geminiService... Call const response = await geminiService.generateText(prompt)".
  // This implies I should assume it exists or create it.
  // Let me check geminiService.ts fully first.
  
  // Wait, I'll write this file assuming I'll fix geminiService in a moment if needed.
  // Actually, better to check/fix geminiService first if I want to be safe, but I can't do that inside this tool call.
  // I will implement the action file now, and then immediately check/update geminiService.ts.
  
  // Re-reading the prompt: "Call const response = await geminiService.generateText(prompt);"
  // If the method doesn't exist, I must add it.
  
  // For now I will write the file using the method.
  
  const response = await geminiService.generateText(prompt);
  return { success: true, markdown: response };
}
