
-- Migration 008: Atomic AI Usage Recording
-- Ensures consistent recording of wallet transactions and AI usage events.

CREATE OR REPLACE FUNCTION public.record_ai_usage_v1(
  p_tenant_id UUID,
  p_amount NUMERIC,
  p_action_type TEXT,
  p_model TEXT,
  p_tokens_used INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn_id UUID;
  v_usage_id UUID;
BEGIN
  -- 1. Insert into wallet_transactions
  -- This will trigger update_wallet_balance() which will fail if balance < 0
  INSERT INTO public.wallet_transactions (
    tenant_id,
    amount,
    type,
    description,
    metadata
  )
  VALUES (
    p_tenant_id,
    p_amount, -- Should be negative for deduction
    'ai_usage',
    'Usage: ' || p_action_type,
    jsonb_build_object(
      'action_type', p_action_type,
      'model', p_model,
      'tokens', p_tokens_used
    ) || p_metadata
  )
  RETURNING id INTO v_txn_id;

  -- 2. Insert into ai_usage_events
  INSERT INTO public.ai_usage_events (
    tenant_id,
    action_type,
    tokens_used,
    credits_deducted,
    model,
    metadata
  )
  VALUES (
    p_tenant_id,
    p_action_type,
    p_tokens_used,
    ABS(p_amount),
    p_model,
    p_metadata
  )
  RETURNING id INTO v_usage_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_txn_id,
    'usage_event_id', v_usage_id
  );

EXCEPTION WHEN OTHERS THEN
  -- All inserts will rollback automatically on error
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$;
