import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireActiveTenant } from '@/lib/auth/tenant';

export async function GET() {
  const supabase = await getSupabaseServer();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const { data: transactions, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('timestamp', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedTransactions = transactions.map((t: any) => ({
    id: t.id,
    hostId: t.host_id,
    type: t.type,
    amount: t.amount,
    reason: t.reason,
    timestamp: t.timestamp,
    status: t.status || 'completed',
  }));

  return NextResponse.json(formattedTransactions);
}
