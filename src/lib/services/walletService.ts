import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

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

    if (error || !data) return 0;
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
      p_metadata: metadata
    });

    if (error || !data?.success) {
      const errorMsg = error?.message || data?.error || 'Unknown error';
      const errorCode = error?.code || data?.code;

      if (errorCode === '23514' || errorCode === 'P0001') {
         log.warn(`Wallet deduction blocked for tenant ${tenantId} due to insufficient funds.`);
      } else {
         log.error("Failed to deduct credits (RPC)", { error: errorMsg, code: errorCode, tenantId });
      }
      return false;
    }

    return true;
  }

  /**
   * Top up wallet (Admin or Payment Webhook).
   */
  static async topUp(tenantId: string, amount: number, description: string = "Top Up", metadata: Record<string, unknown> = {}): Promise<boolean> {
    const supabase = await getSupabaseServer();

    // Idempotency check: Prevent double crediting for same payment
    if (metadata.paymentId) {
        const { data: existing } = await supabase
            .from("wallet_transactions")
            .select("id")
            // Use query filter for JSONB if possible, or we can assume unique constraint if we added one.
            // For now, let's just check metadata->>paymentId using arrow operator if supported by client type
            // or simply use contains
            .contains("metadata", { paymentId: metadata.paymentId }) 
            .maybeSingle();
        
        if (existing) {
            log.info(`Duplicate top-up skipped`, { paymentId: metadata.paymentId, tenantId });
            return true;
        }
    }

    const { error } = await supabase
      .from("wallet_transactions")
      .insert({
        tenant_id: tenantId,
        amount: Math.abs(amount),
        type: "top_up",
        description,
        metadata
      });

    if (error) {
      log.error("Failed to top up wallet", error, { tenantId, amount });
      return false;
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
        description: reason
      });

    if (error) {
      log.error("Failed to adjust balance", error, { tenantId, amount, reason });
      return false;
    }
    return true;
  }

  /**
   * Generic credit addition (Internal)
   */
  static async addCredits(tenantId: string, amount: number, type: string, metadata: Record<string, unknown> = {}): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.from("wallet_transactions").insert({
        tenant_id: tenantId,
        amount: Math.abs(amount),
        type,
        description: `Credit: ${type}`,
        metadata
    });
    if (error) {
        log.error("Failed to add credits", error, { tenantId, amount, type });
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
  static async getHistory(tenantId: string, limit: number = 20) {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data;
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
    return data.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }
}
