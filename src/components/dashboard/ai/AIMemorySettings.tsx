"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  toggleMemoryAction, 
  getMemoriesAction, 
  addMemoryAction, 
  deleteMemoryAction 
} from "@/app/actions/ai-memory";
import { AIMemory, MemoryType } from "@/lib/services/memoryService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Trash2, 
  Plus, 
  Loader2, 
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIMemorySettingsProps {
  initialEnabled: boolean;
}

export function AIMemorySettings({ initialEnabled }: AIMemorySettingsProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filterType, setFilterType] = useState<MemoryType | "all">("all");
  const [newMemory, setNewMemory] = useState("");
  const [newMemoryType, setNewMemoryType] = useState<MemoryType>("business");
  // const { toast } = useToast(); // Commented out until I verify hook path

  useEffect(() => {
    if (isEnabled) {
      fetchMemories();
    }
  }, [isEnabled, filterType]);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const type = filterType === "all" ? undefined : filterType;
      const data = await getMemoriesAction(undefined, type);
      setMemories(data);
    } catch (error) {
      console.error("Failed to fetch memories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    startTransition(async () => {
      try {
        await toggleMemoryAction(checked);
      } catch (error) {
        setIsEnabled(!checked); // Revert on error
        console.error("Failed to toggle memory", error);
      }
    });
  };

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    
    startTransition(async () => {
      try {
        await addMemoryAction(newMemoryType, newMemory);
        setNewMemory("");
        fetchMemories(); // Refresh list
      } catch (error) {
        console.error("Failed to add memory", error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteMemoryAction(id);
        setMemories(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error("Failed to delete memory", error);
      }
    });
  };

  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-white">AI Memory (Beta)</CardTitle>
            <CardDescription className="text-white/50">
              Control what your AI remembers about your business and customers.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Enable Memory</Label>
            <div className="text-sm text-white/50">
              Allow AI to remember preferences and rules to improve responses.
            </div>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle} 
            disabled={isPending}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Add Memory Input */}
            <div className="flex gap-2">
              <Select 
                value={newMemoryType} 
                onValueChange={(v: string) => setNewMemoryType(v as MemoryType)}
              >
                <SelectTrigger className="w-[140px] bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                  <SelectItem value="interaction">Interaction</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Teach AI something (e.g., 'We don't allow pets on weekends')" 
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
              />
              <Button 
                onClick={handleAddMemory} 
                disabled={isPending || !newMemory.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Filter className="w-4 h-4 text-white/40" />
              <div className="flex gap-2">
                {(['all', 'business', 'listing', 'interaction'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full transition-colors",
                      filterType === type 
                        ? "bg-white/10 text-white font-medium" 
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Memory List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                </div>
              ) : memories.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No memories found. AI will learn as it interacts.
                </div>
              ) : (
                memories.map((memory) => (
                  <div 
                    key={memory.id} 
                    className="group flex items-start justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase tracking-wider border-none px-1.5 py-0 h-5",
                          memory.memory_type === 'business' ? "bg-blue-500/20 text-blue-400" :
                          memory.memory_type === 'listing' ? "bg-orange-500/20 text-orange-400" :
                          "bg-purple-500/20 text-purple-400"
                        )}>
                          {memory.memory_type}
                        </Badge>
                        <span className="text-[10px] text-white/30">
                          {new Date(memory.created_at).toLocaleDateString()}
                        </span>
                        {memory.confidence < 1 && (
                            <span className="text-[10px] text-white/30" title="Confidence">
                                {Math.round(memory.confidence * 100)}%
                            </span>
                        )}
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {memory.summary}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(memory.id)}
                      disabled={isPending}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
