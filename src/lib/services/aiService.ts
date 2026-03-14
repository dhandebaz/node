import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, generateText, streamText, type UIMessage } from 'ai';
import { KnowledgeService } from './knowledgeService';

export type AIProvider = 'google' | 'anthropic';
export type AIModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';

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
  private google: ReturnType<typeof createGoogleGenerativeAI>;
  private anthropic: ReturnType<typeof createAnthropic>;

  constructor() {
    // Initialize with default env vars, can be overridden per request
    this.google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });
    this.anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  private getModel(provider: AIProvider, modelName: string, apiKey?: string) {
    if (provider === 'google') {
      const google = apiKey ? createGoogleGenerativeAI({ apiKey }) : this.google;
      return google(modelName);
    } else if (provider === 'anthropic') {
      const anthropic = apiKey ? createAnthropic({ apiKey }) : this.anthropic;
      return anthropic(modelName);
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  async generate({ provider, model, tenantId, agentId, prompt, system, temperature, maxOutputTokens, apiKey }: GenerateOptions) {
    const aiModel = this.getModel(provider, model, apiKey);
    if (!prompt) {
      throw new Error('Missing prompt');
    }

    // 1. Fetch Knowledge from RAG
    const knowledge = await KnowledgeService.queryKnowledge(tenantId, prompt);
    
    // 2. Fetch Agent Instructions if applicable
    let agentContext = "";
    if (agentId) {
      const { data: agent } = await (await import('@/lib/supabase/server')).getSupabaseAdmin()
        .from('team_agents')
        .select('name, role, instructions, personality')
        .eq('id', agentId)
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
    });
  }

  async stream({ provider, model, tenantId, agentId, prompt, messages, system, temperature, maxOutputTokens, apiKey }: GenerateOptions) {
    const aiModel = this.getModel(provider, model, apiKey);

    // Get the last user message for RAG query
    const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || prompt || "";
    
    // 1. Fetch Knowledge from RAG
    const knowledge = await KnowledgeService.queryKnowledge(tenantId, lastUserMessage);
    
    // 2. Fetch Agent Instructions if applicable
    let agentContext = "";
    if (agentId) {
      const { data: agent } = await (await import('@/lib/supabase/server')).getSupabaseAdmin()
        .from('team_agents')
        .select('name, role, instructions, personality')
        .eq('id', agentId)
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
      });
    }

    if (!prompt) {
      throw new Error('Missing prompt or messages');
    }

    return await streamText({
      model: aiModel,
      prompt,
      system: augmentedSystem,
      temperature,
      maxOutputTokens,
    });
  }
}

export const aiService = new AIService();
