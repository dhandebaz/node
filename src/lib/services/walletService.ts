import { getSupabaseServer } from "@/lib/supabase/server";

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
   * This creates a negative transaction which triggers the balance update via DB trigger.
   */
  static async deductCredits(
    tenantId: string, 
    amount: number, 
    actionType: string, 
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    const supabase = await getSupabaseServer();
    
    // Ensure amount is positive for the input, we negate it for the transaction
    const deduction = Math.abs(amount) * -1;

    const { error } = await supabase
      .from("wallet_transactions")
      .insert({
        tenant_id: tenantId,
        amount: deduction,
        type: "ai_usage",
        description: `Usage: ${actionType}`,
        metadata: {
          action_type: actionType,
          ...metadata
        }
      });

    if (error) {
      // Check for check_violation (code 23514) which implies negative balance attempt
      if (error.code === '23514') {
         console.warn(`Wallet deduction blocked for tenant ${tenantId} due to insufficient funds (constraint violation).`);
      } else {
         console.error("Failed to deduct credits:", error);
      }
      return false;
    }

    // Strict Requirement Part 3: Emit usage event
    // We log this *after* successful deduction to ensure we only track paid usage.
    // For blocked usage, the caller should log an audit event (which they do).
    // This table is for "Usage Events" as defined in Part 3.
    await supabase.from("ai_usage_events").insert({
        tenant_id: tenantId,
        action_type: actionType,
        tokens_used: metadata.tokens || 0,
        credits_deducted: Math.abs(deduction),
        model: metadata.model || 'unknown',
        metadata: metadata
    });

    return true;
  }

  /**
   * Top up wallet (Admin or Payment Webhook).
   */
  static async topUp(tenantId: string, amount: number, description: string = "Top Up", metadata: Record<string, any> = {}): Promise<boolean> {
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
            console.log(`Duplicate top-up skipped for paymentId: ${metadata.paymentId}`);
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
      console.error("Failed to top up wallet:", error);
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
      console.error("Failed to adjust balance:", error);
      return false;
    }
    return true;
  }

  /**
   * Generic credit addition (Internal)
   */
  static async addCredits(tenantId: string, amount: number, type: string, metadata: Record<string, any> = {}): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.from("wallet_transactions").insert({
        tenant_id: tenantId,
        amount: Math.abs(amount),
        type,
        description: `Credit: ${type}`,
        metadata
    });
    if (error) {
        console.error("Failed to add credits:", error);
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
    
    const { data } = await supabase
      .from("wallet_transactions")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "ai_usage")
      .gte("created_at", yesterday.toISOString());
      
    if (!data) return 0;
    
    // Sum absolute values
    return data.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
  }
}
