import {
  convertToModelMessages,
  generateText,
  streamText,
  type UIMessage,
} from "ai";
import { KnowledgeService } from "./knowledgeService";
import {
  getGatewayProviderOptions,
  type AIModel,
  type AIProvider,
} from "@/lib/ai/config";
export type { AIModel, AIProvider } from "@/lib/ai/config";

interface GenerateOptions {
  provider: AIProvider;
  model: AIModel;
  tenantId: string; // Required for RAG
  agentId?: string; // NEW: Optional for Multi-Agent
  prompt?: string;
  messages?: UIMessage[];
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string; // BYOK support
}

export class AIService {
  private getModel(modelName: AIModel) {
    return modelName;
  }

  async generate({
    provider,
    model,
    tenantId,
    agentId,
    prompt,
    system,
    temperature,
    maxOutputTokens,
    apiKey,
  }: GenerateOptions) {
    const aiModel = this.getModel(model);
    const providerOptions = getGatewayProviderOptions(provider, apiKey);
    if (!prompt) {
      throw new Error("Missing prompt");
    }

    // 1. Fetch Knowledge from RAG
    const knowledge = await KnowledgeService.queryKnowledge(tenantId, prompt);

    // 2. Fetch Agent Instructions if applicable
    let agentContext = "";
    if (agentId) {
      const { getSupabaseAdmin } = await import("@/lib/supabase/server");
      const supabaseAdmin = await getSupabaseAdmin();
      const { data: agent } = await supabaseAdmin
        .from("team_agents")
        .select("name, role, instructions, personality")
        .eq("id", agentId)
        .single();

      if (agent) {
        agentContext = `
          You are ${agent.name}, acting as ${agent.role}.
          Personality: ${agent.personality}
          Specific Instructions: ${agent.instructions}
        `;
      }
    }

    // 3. Inject into System Prompt
    const augmentedSystem = `
      ${agentContext || system || "You are a helpful AI assistant."}
      ${knowledge ? `\n\nUSE THIS SPECIFIC KNOWLEDGE TO ANSWER:\n${knowledge}` : ""}
    `;

    return await generateText({
      model: aiModel,
      prompt,
      system: augmentedSystem,
      temperature,
      maxOutputTokens,
      providerOptions,
    });
  }

  async stream({
    provider,
    model,
    tenantId,
    agentId,
    prompt,
    messages,
    system,
    temperature,
    maxOutputTokens,
    apiKey,
  }: GenerateOptions) {
    const aiModel = this.getModel(model);
    const providerOptions = getGatewayProviderOptions(provider, apiKey);

    // Get the last user message for RAG query
    const lastUserMessage =
      messages
        ?.filter((m) => m.role === "user")
        .pop()
        ?.parts?.map((p) => (p.type === "text" ? p.text : ""))
        .join(" ") ||
      prompt ||
      "";

    // 1. Fetch Knowledge from RAG
    const knowledge = await KnowledgeService.queryKnowledge(
      tenantId,
      lastUserMessage,
    );

    // 2. Fetch Agent Instructions if applicable
    let agentContext = "";
    if (agentId) {
      const { getSupabaseAdmin } = await import("@/lib/supabase/server");
      const supabaseAdmin = await getSupabaseAdmin();
      const { data: agent } = await supabaseAdmin
        .from("team_agents")
        .select("name, role, instructions, personality")
        .eq("id", agentId)
        .single();

      if (agent) {
        agentContext = `
          You are ${agent.name}, acting as ${agent.role}.
          Personality: ${agent.personality}
          Specific Instructions: ${agent.instructions}
        `;
      }
    }

    // 3. Inject into System Prompt
    const augmentedSystem = `
      ${agentContext || system || "You are a helpful AI assistant."}
      ${knowledge ? `\n\nUSE THIS SPECIFIC KNOWLEDGE TO ANSWER:\n${knowledge}` : ""}
    `;

    if (messages && messages.length > 0) {
      return await streamText({
        model: aiModel,
        messages: await convertToModelMessages(messages),
        system: augmentedSystem,
        temperature,
        maxOutputTokens,
        providerOptions,
      });
    }

    if (!prompt) {
      throw new Error("Missing prompt or messages");
    }

    return await streamText({
      model: aiModel,
      prompt,
      system: augmentedSystem,
      temperature,
      maxOutputTokens,
      providerOptions,
    });
  }
}

export const aiService = new AIService();
