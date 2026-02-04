
export type MemoryType = 'preference' | 'process' | 'correction' | 'outcome';
export type MemorySource = 'explicit' | 'inferred';
export type MemoryStatus = 'active' | 'pending_confirmation' | 'archived';

export interface KaisaMemory {
  id: string;
  userId: string;
  type: MemoryType;
  source: MemorySource;
  description: string; // Human readable description
  confidence: number; // 0 to 1, mostly for inferred
  createdAt: string; // ISO Date
  lastUsedAt?: string; // ISO Date
  status: MemoryStatus;
  moduleId?: string; // Optional: linked to specific module (e.g., 'billing')
  metadata?: Record<string, any>;
}

export interface LearningStats {
  totalMemories: number;
  byType: Record<MemoryType, number>;
  lastLearnedAt: string | null;
}
