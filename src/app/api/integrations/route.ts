import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { encryptToken } from '@/lib/crypto';

export async function GET() {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServer();
  
  // Fetch integrations
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('id, user_id, provider, status, last_sync, expires_at, error_code, metadata, scopes') // Exclude tokens
    .eq('user_id', session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format response
  const formattedIntegrations = integrations.map((i: any) => ({
    id: i.id,
    userId: i.user_id,
    provider: i.provider,
    status: i.status,
    lastSync: i.last_sync,
    expiresAt: i.expires_at,
    errorCode: i.error_code,
    metadata: i.metadata,
    scopes: i.scopes
  }));

  return NextResponse.json(formattedIntegrations);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServer();
  
  const body = await request.json();
  const { provider, status, metadata, accessToken, refreshToken, scopes, expiresIn } = body;

  // Validate provider
  const validProviders = ['google', 'airbnb', 'booking', 'instagram', 'whatsapp'];
  if (!validProviders.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // Prepare update data
  const updateData: any = {
    user_id: session.userId,
    provider,
    status: status || 'connected',
    metadata: metadata || {},
    updated_at: new Date().toISOString()
  };

  if (status === 'connected') {
      updateData.last_sync = new Date().toISOString();
  }

  // Handle Tokens (Encrypt)
  if (accessToken) updateData.access_token = encryptToken(accessToken);
  if (refreshToken) updateData.refresh_token = encryptToken(refreshToken);
  if (scopes) updateData.scopes = scopes;
  if (expiresIn) {
      updateData.expires_at = new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  // Upsert integration
  const { data, error } = await supabase
    .from('integrations')
    .upsert(updateData, { onConflict: 'user_id, provider' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    userId: data.user_id,
    provider: data.provider,
    status: data.status,
    lastSync: data.last_sync
  });
}


