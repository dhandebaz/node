
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  UserCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  Zap,
  MessageSquare,
  Settings2,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api/fetcher";

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/team/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this agent?")) return;
    try {
      await fetchWithAuth(`/api/team/agents/${id}`, { method: "DELETE" });
      toast.success("Agent removed");
      fetchAgents();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        <p className="text-white/40 text-sm">Loading your AI team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Users className="text-purple-500 w-8 h-8" />
            AI Team
          </h1>
          <p className="text-white/50 text-sm">
            Manage specialized AI agents for different parts of your business.
          </p>
        </div>
        <Button 
          onClick={() => { setEditingAgent({ name: "", role: "Assistant", personality: "", instructions: "" }); setShowEditor(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-zinc-900 border-white/5 hover:border-purple-500/30 transition-all overflow-hidden group">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <UserCircle className="w-8 h-8" />
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none uppercase tracking-widest text-[10px]">
                  {agent.status}
                </Badge>
              </div>
              <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-purple-400 font-bold uppercase tracking-tighter text-xs">
                {agent.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Personality</div>
                <p className="text-xs text-white/70 italic line-clamp-2">"{agent.personality || "No personality defined"}"</p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold"
                  onClick={() => { setEditingAgent(agent); setShowEditor(true); }}
                >
                  <Settings2 className="w-3 h-3 mr-2" />
                  Configure
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDelete(agent.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Modal Mock */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-zinc-900 border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Configure AI Agent</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)} className="text-white/40 hover:text-white">Close</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Agent Name</label>
                    <input 
                      type="text" 
                      value={editingAgent?.name} 
                      onChange={(e) => setEditingAgent({...editingAgent, name: e.target.value})}
                      placeholder="e.g. Sarah"
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Role</label>
                    <input 
                      type="text" 
                      value={editingAgent?.role} 
                      onChange={(e) => setEditingAgent({...editingAgent, role: e.target.value})}
                      placeholder="e.g. Concierge"
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Personality</label>
                  <textarea 
                    value={editingAgent?.personality} 
                    onChange={(e) => setEditingAgent({...editingAgent, personality: e.target.value})}
                    placeholder="e.g. Enthusiastic, professional, and very detail-oriented."
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white h-20"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">System Instructions</label>
                  <textarea 
                    value={editingAgent?.instructions} 
                    onChange={(e) => setEditingAgent({...editingAgent, instructions: e.target.value})}
                    placeholder="e.g. Focus on recommending local restaurants and booking transport."
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white h-24"
                  />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="ghost" onClick={() => setShowEditor(false)} className="text-zinc-500 font-bold">Discard</Button>
                  <Button onClick={async () => {
                    const method = editingAgent.id ? 'PUT' : 'POST';
                    const url = editingAgent.id ? `/api/team/agents/${editingAgent.id}` : '/api/team/agents';
                    await fetch(url, { method, body: JSON.stringify(editingAgent) });
                    toast.success("Agent saved!");
                    setShowEditor(false);
                    fetchAgents();
                  }} className="bg-white text-black hover:bg-zinc-200 font-bold">Save Agent</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
