export const dynamic = 'force-dynamic';


import { getLearningDataAction } from "@/app/actions/kaisa-learning";
import { FeedbackForm } from "@/components/kaisa/learning/FeedbackForm";
import { MemoryList } from "@/components/kaisa/learning/MemoryList";
import { ResetLearningButton } from "@/components/kaisa/learning/ResetLearningButton";
import { BrainCircuit, Info, ShieldCheck } from "lucide-react";

export default async function LearningPage() {
  const { memories, stats } = await getLearningDataAction();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-brand-headline)] mb-2">How Nodebase Core Works</h1>
        <p className="text-[var(--color-brand-muted)] max-w-2xl">
          Nodebase Core learns your preferences to serve you better. You are in full control—teach your AI Employee explicit rules, 
          review inferred patterns, or reset everything instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Explicit Feedback Input */}
          <section>
            <FeedbackForm />
          </section>

          {/* Memory List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-brand-headline)]">Learned Memories</h2>
              <span className="text-sm text-[var(--color-brand-muted)]">{stats.totalMemories} active items</span>
            </div>
            <MemoryList memories={memories} />
          </section>

        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          
          {/* Stats Card */}
          <div className="glass-card border border-[var(--color-brand-node-line)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--color-brand-headline)] mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[var(--color-brand-accent)]" />
              Learning Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-brand-muted)]">Preferences</span>
                <span className="text-[var(--color-brand-headline)] font-medium">{stats.byType.preference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-brand-muted)]">Process Rules</span>
                <span className="text-[var(--color-brand-headline)] font-medium">{stats.byType.process}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-brand-muted)]">Corrections</span>
                <span className="text-[var(--color-brand-headline)] font-medium">{stats.byType.correction}</span>
              </div>
              <div className="pt-3 border-t border-[var(--color-brand-node-line)] mt-3">
                 <div className="flex justify-between text-xs text-[var(--color-brand-muted)]">
                  <span>Last Updated</span>
                  <span>{stats.lastLearnedAt ? new Date(stats.lastLearnedAt).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Principles */}
          <div className="glass-card border border-[var(--color-brand-node-line)] rounded-xl p-5 space-y-4">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-[var(--color-brand-accent)] shrink-0" />
              <div>
                <h4 className="font-medium text-[var(--color-brand-headline)] text-sm mb-1">Private & Secure</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  Learning is scoped strictly to you and your business. Data is never shared across users or used for marketing.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-[var(--color-brand-accent)] shrink-0" />
              <div>
                <h4 className="font-medium text-[var(--color-brand-headline)] text-sm mb-1">Always Reversible</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  If your AI Employee learns something incorrect, you can delete the specific memory or reset everything below.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-500/10 bg-red-500/5 rounded-xl p-5">
            <h3 className="text-red-400 font-medium text-sm mb-2">Reset Learning</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Clear all memories and restore Kaisa to default factory behavior.
            </p>
            <ResetLearningButton />
          </div>

        </div>
      </div>
    </div>
  );
}
