
import { KaisaMemory, MemoryType, LearningStats } from "@/types/kaisa-learning";

// Mock Data
let memories: KaisaMemory[] = [
  {
    id: "mem_001",
    userId: "USR-001",
    type: "preference",
    source: "explicit",
    description: "Prefer WhatsApp for urgent guest communications",
    confidence: 1.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    lastUsedAt: new Date().toISOString(),
    status: "active",
    moduleId: "frontdesk"
  },
  {
    id: "mem_002",
    userId: "USR-001",
    type: "correction",
    source: "explicit",
    description: "Do not auto-confirm bookings from 'TravelStay' agency without approval",
    confidence: 1.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastUsedAt: new Date().toISOString(),
    status: "active",
    moduleId: "frontdesk"
  },
  {
    id: "mem_003",
    userId: "USR-001",
    type: "process",
    source: "inferred",
    description: "Send billing reminders at 10:00 AM local time",
    confidence: 0.85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: "pending_confirmation",
    moduleId: "billing"
  }
];

export const kaisaMemoryService = {
  async getMemories(userId: string): Promise<KaisaMemory[]> {
    // Simulate DB delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return memories.filter(m => m.userId === userId && m.status !== 'archived');
  },

  async getStats(userId: string): Promise<LearningStats> {
    const userMemories = await this.getMemories(userId);
    const byType: Record<MemoryType, number> = {
      preference: 0,
      process: 0,
      correction: 0,
      outcome: 0
    };
    
    let lastLearnedAt = null;

    userMemories.forEach(m => {
      byType[m.type]++;
      if (!lastLearnedAt || new Date(m.createdAt) > new Date(lastLearnedAt)) {
        lastLearnedAt = m.createdAt;
      }
    });

    return {
      totalMemories: userMemories.length,
      byType,
      lastLearnedAt
    };
  },

  async addMemory(memory: Omit<KaisaMemory, "id" | "createdAt" | "status">): Promise<KaisaMemory> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMemory: KaisaMemory = {
      ...memory,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    memories.unshift(newMemory);
    return newMemory;
  },

  async updateStatus(id: string, status: KaisaMemory['status']): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = memories.findIndex(m => m.id === id);
    if (index !== -1) {
      memories[index].status = status;
    }
  },

  async deleteMemory(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    memories = memories.filter(m => m.id !== id);
  },

  async resetLearning(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    memories = memories.filter(m => m.userId !== userId);
  }
};
