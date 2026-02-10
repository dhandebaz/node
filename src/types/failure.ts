export type FailureCategory = 'auth' | 'integration' | 'payment' | 'calendar' | 'ai' | 'system';
export type FailureSeverity = 'info' | 'warning' | 'critical';

export interface FailureRecord {
  id: string;
  tenant_id: string;
  category: FailureCategory;
  source: string;
  severity: FailureSeverity;
  message: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  resolved_at?: string | null;
}

export interface CreateFailureParams {
  tenant_id: string;
  category: FailureCategory;
  source: string;
  severity: FailureSeverity;
  message: string;
  metadata?: Record<string, any>;
}
