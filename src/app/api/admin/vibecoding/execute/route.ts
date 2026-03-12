import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { vpsService } from '@/lib/services/vpsService';

type Language = 'python' | 'javascript' | 'bash';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as {
      code?: string;
      language?: Language;
      timeout?: number;
    };

    if (!body.code || !body.language) {
      return NextResponse.json({ error: 'Missing code or language' }, { status: 400 });
    }

    const result = await vpsService.executeCode({
      code: body.code,
      language: body.language,
      timeout: body.timeout,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
