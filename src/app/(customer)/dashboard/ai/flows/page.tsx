
"use client";

import { useEffect, useState } from "react";
import { 
  GitMerge, 
  Plus, 
  Play, 
  Trash2, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Zap,
  ArrowRight,
  Settings2,
  MessageSquare,
  UserCheck,
  Frown
} from "lucide-react";
import { getFlowsAction, deleteFlowAction, saveFlowAction } from "@/app/actions/flows";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function FlowsPage() {
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);

  const fetchData = async () => {
    try {
      const data = await getFlowsAction();
      setFlows(data);
    } catch (e) {
      toast.error("Failed to load flows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flow?")) return;
    try {
      await deleteFlowAction(id);
      toast.success("Flow deleted");
      fetchData();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (flow: any, active: boolean) => {
    try {
      await saveFlowAction({ ...flow, status: active ? 'active' : 'draft' });
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        <p className="text-white/40 text-sm">Loading Custom Logic...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <GitMerge className="text-blue-500 w-8 h-8" />
            Kaisa Flows
          </h1>
          <p className="text-white/50 text-sm">
            Define custom "If-This-Then-That" logic to handle specific guest scenarios.
          </p>
        </div>
        <Button 
          onClick={() => { setEditingFlow({ name: "New Flow", trigger_type: "message_received", status: "draft", nodes: [], edges: [] }); setShowEditor(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {flows.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-white/20">
            <GitMerge className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-white font-bold">No custom flows yet</h3>
            <p className="text-white/40 text-sm">
              Custom flows allow you to intercept messages. For example: "If message contains 'booking', notify me immediately."
            </p>
          </div>
          <Button variant="outline" onClick={() => {}} className="border-white/10 text-white hover:bg-white/5">
            View Templates
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <Card key={flow.id} className="bg-zinc-900 border-white/5 hover:border-blue-500/30 transition-all overflow-hidden group">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                    flow.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                  )}>
                    {flow.status}
                  </div>
                  <Switch 
                    checked={flow.status === 'active'} 
                    onCheckedChange={(checked) => handleToggle(flow, checked)}
                  />
                </div>
                <CardTitle className="text-white text-lg">{flow.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{flow.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Trigger: {flow.trigger_type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>Last run: Never</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold"
                    onClick={() => { setEditingFlow(flow); setShowEditor(true); }}
                  >
                    <Settings2 className="w-3 h-3 mr-2" />
                    Edit Logic
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(flow.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal Mock (Simplified for this step) */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-zinc-900 border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Edit Flow: {editingFlow?.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)} className="text-white/40 hover:text-white">Close</Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Trigger</div>
                      <div className="text-sm text-white font-medium">When a new message is received</div>
                    </div>
                  </div>

                  <div className="ml-5 border-l-2 border-dashed border-zinc-800 py-4 pl-8 space-y-6">
                    {/* Condition or Sentiment Check */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-900 border-2 border-zinc-800 rounded-full" />
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Frown className="w-4 h-4 text-red-400" />
                          <div className="text-xs text-white/80">IF <span className="font-bold text-white">Sentiment</span> is <span className="font-bold text-white">"Negative or Angry"</span></div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] text-zinc-500 font-bold uppercase">Change</Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-700 ml-4">
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Then</span>
                    </div>

                    {/* Action */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-900 border-2 border-zinc-800 rounded-full" />
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-4 h-4 text-blue-400" />
                          <div className="text-xs text-white/80 font-medium">Handover to Human & Pause AI</div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] text-blue-400 font-bold uppercase">Change</Button>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="ghost" onClick={() => setShowEditor(false)} className="text-zinc-500 font-bold">Discard</Button>
                  <Button onClick={async () => {
                    await saveFlowAction(editingFlow);
                    toast.success("Flow logic saved!");
                    setShowEditor(false);
                    fetchData();
                  }} className="bg-white text-black hover:bg-zinc-200 font-bold">Save Changes</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
