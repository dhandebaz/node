import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { AppError, ErrorCode } from "@/lib/errors";
import { WalletTransaction } from "@/types";

export class WalletService {
  /**
   * Get current wallet balance for a tenant
   */
  static async getBalance(tenantId: string): Promise<number> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", tenantId)
      .single();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') { // PGRST116 is not found, which is fine for default 0
        log.error("Failed to fetch wallet balance", error, { tenantId });
      }
      return 0;
    }
    return Number(data.balance);
  }

  /**
   * Check if tenant has enough balance for an operation
   */
  static async hasSufficientBalance(tenantId: string, estimatedCost: number): Promise<boolean> {
    const balance = await this.getBalance(tenantId);
    return balance >= estimatedCost;
  }

  /**
   * Deduct credits from wallet.
   * This uses an RPC function to ensure atomic recording of transaction and usage event.
   */
  static async deductCredits(
    tenantId: string, 
    amount: number, 
    actionType: string, 
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    const supabase = await getSupabaseServer();
    
    // Ensure amount is negative for the transaction (deduction)
    const deduction = Math.abs(amount) * -1;

    // Use RPC for atomic operation
    const { data, error } = await supabase.rpc('record_ai_usage_v1', {
      p_tenant_id: tenantId,
      p_amount: deduction,
      p_action_type: actionType,
      p_model: metadata.model || 'unknown',
      p_tokens_used: metadata.tokens || 0,
      p_metadata: metadata as any
    });

    const result = data as { success?: boolean; error?: string; code?: string } | null;

    if (error || !result?.success) {
      const errorMsg = error?.message || result?.error || 'Unknown error';
      const errorCode = error?.code || result?.code;

      if (errorCode === '23514' || errorCode === 'P0001') {
         log.warn(`Wallet deduction blocked for tenant ${tenantId} due to insufficient funds.`);
         throw new AppError(ErrorCode.BAD_REQUEST, "Insufficient wallet balance", { tenantId, required: amount });
      } else {
         log.error("Failed to deduct credits (RPC)", { error: errorMsg, code: errorCode, tenantId });
         throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to process credit deduction");
      }
    }

    return true;
  }

  static async topUp(tenantId: string, amount: number, description: string = "Top Up", metadata: Record<string, unknown> = {}): Promise<boolean> {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase.rpc('atomic_wallet_transaction_v1', {
      p_tenant_id: tenantId,
      p_amount: Math.abs(amount),
      p_type: 'top_up',
      p_metadata: { ...metadata, description } as any
    });

    const result = data as { success?: boolean; error?: string; idempotent?: boolean } | null;

    if (error || !result?.success) {
      log.error("Failed to top up wallet atomically", { error: error || result?.error, tenantId, amount });
      return false;
    }
    
    if (result.idempotent) {
      log.info(`Duplicate top-up skipped (idempotent)`, { paymentId: metadata.paymentId, tenantId });
    }

    return true;
  }

  /**
   * Admin adjustment (positive or negative)
   */
  static async adjustBalance(tenantId: string, amount: number, reason: string): Promise<boolean> {
    const supabase = await getSupabaseServer();

    const { error } = await supabase
      .from("wallet_transactions")
      .insert({
        tenant_id: tenantId,
        amount: amount,
        type: "admin_adjustment",
        metadata: { description: reason }
      });

    if (error) {
      log.error("Failed to adjust balance", error, { tenantId, amount, reason });
      return false;
    }
    return true;
  }

  static async addCredits(tenantId: string, amount: number, type: string, metadata: Record<string, unknown> = {}): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.rpc('atomic_wallet_transaction_v1', {
      p_tenant_id: tenantId,
      p_amount: Math.abs(amount),
      p_type: type,
      p_metadata: { ...metadata, description: `Credit: ${type}` } as any
    });

    const result = data as { success?: boolean; error?: string } | null;

    if (error || !result?.success) {
        log.error("Failed to add credits atomically", { error: error || result?.error, tenantId, amount, type });
        return false;
    }
    return true;
  }

  /**
   * Check if a specific transaction type exists (for one-time bonuses)
   */
  static async hasTransactionType(tenantId: string, type: string): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("type", type)
      .maybeSingle();
    
    return !!data;
  }

  /**
   * Get transaction history
   */
  static async getHistory(tenantId: string, limit: number = 20): Promise<WalletTransaction[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as WalletTransaction[];
  }

  /**
   * Get total usage (cost) in the last 24 hours
   */
  static async getUsage24h(tenantId: string): Promise<number> {
    const supabase = await getSupabaseServer();
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "ai_usage")
      .gte("created_at", yesterday.toISOString());

    if (error || !data) return 0;
    
    // Sum absolute values of deductions
    return data.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  }
}
