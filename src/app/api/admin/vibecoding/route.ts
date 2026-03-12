import { AIService, AIProvider, AIModel } from '@/lib/services/aiService';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import type { UIMessage } from 'ai';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { messages, provider, model, apiKey, system } = (await req.json()) as {
      messages?: UIMessage[];
      provider?: string;
      model?: string;
      apiKey?: string;
      system?: string;
    };

    if (!provider || !model) {
      return NextResponse.json({ error: 'Missing provider or model' }, { status: 400 });
    }

    const aiService = new AIService();
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
    }
    
    const result = await aiService.stream({
      provider: provider as AIProvider,
      model: model as AIModel,
      messages,
      system: system,
      apiKey: apiKey,
    });

    return result.toUIMessageStreamResponse();

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
