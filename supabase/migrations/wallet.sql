-- wallet.sql
-- Run this in the Supabase SQL Editor to eliminate TOCTOU race conditions

CREATE OR REPLACE FUNCTION atomic_wallet_transaction_v1(
  p_tenant_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_metadata JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_payment_id TEXT;
BEGIN
  -- Extract idempotency key from metadata (paymentId)
  v_payment_id := p_metadata->>'paymentId';

  -- If a paymentId exists, verify it doesn't already exist for this tenant
  IF v_payment_id IS NOT NULL THEN
    -- Attempt to find existing transaction atomically
    SELECT id INTO v_transaction_id
    FROM wallet_transactions
    WHERE tenant_id = p_tenant_id
      AND type = p_type
      AND metadata->>'paymentId' = v_payment_id
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    -- If found, return success (Idempotent replay)
    IF v_transaction_id IS NOT NULL THEN
      RETURN jsonb_build_object('success', true, 'idempotent', true, 'transaction_id', v_transaction_id);
    END IF;
  END IF;

  -- Proceed with safe insertion
  INSERT INTO wallet_transactions (tenant_id, amount, type, metadata)
  VALUES (p_tenant_id, ABS(p_amount), p_type, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object('success', true, 'idempotent', false, 'transaction_id', v_transaction_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
END;
$$;
