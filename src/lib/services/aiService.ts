import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, generateText, streamText, type UIMessage } from 'ai';

export type AIProvider = 'google' | 'anthropic';
export type AIModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';

interface GenerateOptions {
  provider: AIProvider;
  model: AIModel;
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

  async generate({ provider, model, prompt, system, temperature, maxOutputTokens, apiKey }: GenerateOptions) {
    const aiModel = this.getModel(provider, model, apiKey);
    if (!prompt) {
      throw new Error('Missing prompt');
    }
    
    return await generateText({
      model: aiModel,
      prompt,
      system,
      temperature,
      maxOutputTokens,
    });
  }

  async stream({ provider, model, prompt, messages, system, temperature, maxOutputTokens, apiKey }: GenerateOptions) {
    const aiModel = this.getModel(provider, model, apiKey);

    if (messages && messages.length > 0) {
      return await streamText({
        model: aiModel,
        messages: await convertToModelMessages(messages),
        system,
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
      system,
      temperature,
      maxOutputTokens,
    });
  }
}

export const aiService = new AIService();
