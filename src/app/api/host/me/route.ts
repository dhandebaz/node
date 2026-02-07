import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await getSupabaseServer();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: account } = await supabase
    .from('kaisa_accounts')
    .select('wallet_balance')
    .eq('user_id', user.id)
    .single();

  const host = {
    id: user.id,
    name: profile?.full_name || user.user_metadata?.full_name || 'User',
    email: user.email || '',
    address: profile?.address || '',
    kycStatus: profile?.kyc_status || 'pending',
    walletBalance: account?.wallet_balance || 0,
    businessName: profile?.business_name || '',
  };

  return NextResponse.json(host);
}
