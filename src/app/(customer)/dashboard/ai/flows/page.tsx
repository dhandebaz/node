"use client";

import { useEffect, useState } from "react";
import { GitMerge, Plus, Trash2, Loader2, Zap, Settings2 } from "lucide-react";
import {
  getFlowsAction,
  deleteFlowAction,
  saveFlowAction,
} from "@/app/actions/flows";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TriggerType =
  | "message_received"
  | "booking_confirmed"
  | "payment_failed"
  | "manual_trigger";
type FlowStatus = "active" | "draft" | "archived";

type KaisaFlow = {
  id: string;
  name: string;
  description?: string | null;
  trigger_type: TriggerType;
  status: FlowStatus;
  nodes: unknown[];
  edges: unknown[];
  priority: number;
  created_at?: string;
  updated_at?: string;
};

type DraftFlow = Omit<KaisaFlow, "id"> & { id?: string };

const FLOW_TEMPLATES: Array<
  Pick<
    DraftFlow,
    "name" | "description" | "trigger_type" | "nodes" | "edges" | "priority"
  >
> = [
  {
    name: "Escalate angry guests",
    description: "If message looks angry, pause AI and notify a human.",
    trigger_type: "message_received",
    nodes: [
      { id: "start", type: "trigger", label: "Message received" },
      { id: "sentiment", type: "check", label: "Sentiment is negative" },
      { id: "handover", type: "action", label: "Handover to human" },
    ],
    edges: [
      { from: "start", to: "sentiment" },
      { from: "sentiment", to: "handover", when: "true" },
    ],
    priority: 50,
  },
  {
    name: "Auto-reply to check-in time",
    description: "Reply instantly when someone asks about check-in time.",
    trigger_type: "message_received",
    nodes: [
      { id: "start", type: "trigger", label: "Message received" },
      { id: "match", type: "check", label: "Contains 'check-in'" },
      { id: "reply", type: "action", label: "Send policy reply" },
    ],
    edges: [
      { from: "start", to: "match" },
      { from: "match", to: "reply", when: "true" },
    ],
    priority: 10,
  },
];

export default function FlowsPage() {
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<KaisaFlow[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DraftFlow | null>(null);
  const [nodesJson, setNodesJson] = useState("[]");
  const [edgesJson, setEdgesJson] = useState("[]");
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getFlowsAction();
      setFlows(data as KaisaFlow[]);
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
      await saveFlowAction({ ...flow, status: active ? "active" : "draft" });
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const openEditor = (flow: DraftFlow) => {
    setEditingFlow(flow);
    setNodesJson(JSON.stringify(flow.nodes || [], null, 2));
    setEdgesJson(JSON.stringify(flow.edges || [], null, 2));
    setShowTemplates(false);
    setShowEditor(true);
  };

  const createNewFlow = () => {
    openEditor({
      name: "New Flow",
      description: "",
      trigger_type: "message_received",
      status: "draft",
      nodes: [],
      edges: [],
      priority: 0,
    });
  };

  const applyTemplate = (template: (typeof FLOW_TEMPLATES)[number]) => {
    openEditor({
      name: template.name,
      description: template.description || "",
      trigger_type: template.trigger_type,
      status: "draft",
      nodes: template.nodes,
      edges: template.edges,
      priority: template.priority,
    });
  };

  const saveEditedFlow = async () => {
    if (!editingFlow) return;
    let parsedNodes: unknown[] = [];
    let parsedEdges: unknown[] = [];
    try {
      const n = JSON.parse(nodesJson || "[]");
      const e = JSON.parse(edgesJson || "[]");
      parsedNodes = Array.isArray(n) ? n : [];
      parsedEdges = Array.isArray(e) ? e : [];
    } catch {
      toast.error("Nodes/Edges JSON is invalid");
      return;
    }

    setSaving(true);
    try {
      await saveFlowAction({
        ...editingFlow,
        nodes: parsedNodes,
        edges: parsedEdges,
      });
      toast.success("Flow saved");
      setShowEditor(false);
      setEditingFlow(null);
      await fetchData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
        <p className="text-foreground/40 text-sm">
          Loading Custom Logic...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
            <GitMerge className="text-blue-500 w-8 h-8" />
            Kaisa Flows
          </h1>
          <p className="text-foreground/50 text-sm">
            Define custom "If-This-Then-That" logic to handle specific guest
            scenarios.
          </p>
        </div>
        <Button
          onClick={createNewFlow}
          className="bg-blue-600 hover:bg-blue-700 text-foreground font-bold px-6 rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {flows.length === 0 ? (
        <div className="public-panel/50 border border-white/5 rounded-2xl p-12 text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-foreground/20">
            <GitMerge className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-foreground font-bold">
              No custom flows yet
            </h3>
            <p className="text-foreground/40 text-sm">
              Custom flows allow you to intercept messages. For example: "If
              message contains 'booking', notify me immediately."
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="border-border text-foreground hover:bg-white/5"
            >
              View Templates
            </Button>
            {showTemplates ? (
              <div className="w-full max-w-xl grid grid-cols-1 gap-3 text-left">
                {FLOW_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="bg-muted text-foreground border border-border rounded-xl p-4 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="text-foreground font-semibold">
                      {t.name}
                    </div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {t.description}
                    </div>
                    <div className="text-[10px] text-foreground/30 mt-2 uppercase tracking-widest">
                      Trigger: {t.trigger_type.replaceAll("_", " ")} • Priority:{" "}
                      {t.priority}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className="public-panel border-white/5 hover:border-blue-500/30 transition-all overflow-hidden group"
            >
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                      flow.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {flow.status}
                  </div>
                  <Switch
                    checked={flow.status === "active"}
                    onCheckedChange={(checked) => handleToggle(flow, checked)}
                  />
                </div>
                <CardTitle className="text-foreground text-lg">
                  {flow.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1">
                  {flow.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Trigger: {flow.trigger_type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                    <span>
                      Nodes: {Array.isArray(flow.nodes) ? flow.nodes.length : 0}{" "}
                      • Edges:{" "}
                      {Array.isArray(flow.edges) ? flow.edges.length : 0} •
                      Priority: {flow.priority ?? 0}
                    </span>
                  </div>
                  <div className="text-[10px] text-foreground/30 uppercase tracking-widest">
                    Updated:{" "}
                    {flow.updated_at
                      ? new Date(flow.updated_at).toLocaleString()
                      : " - "}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs font-bold"
                    onClick={() => openEditor(flow)}
                  >
                    <Settings2 className="w-3 h-3 mr-2" />
                    Edit Logic
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
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

      {/* Editor Modal */}
      {showEditor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <Card className="w-full max-w-2xl public-panel border-border shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle
                  id="editor-title"
                  className="text-foreground"
                >
                  {editingFlow?.id ? "Edit Flow" : "Create Flow"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditor(false)}
                  aria-label="Close editor"
                  className="text-foreground/40 hover:text-foreground"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                    Name
                  </div>
                  <Input
                    value={editingFlow?.name || ""}
                    onChange={(e) =>
                      setEditingFlow((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev,
                      )
                    }
                    className="bg-muted text-foreground border-border text-foreground placeholder:text-foreground/30"
                    placeholder="e.g. Escalate angry guests"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                    Trigger
                  </div>
                  <select
                    value={editingFlow?.trigger_type || "message_received"}
                    onChange={(e) =>
                      setEditingFlow((prev) =>
                        prev
                          ? {
                              ...prev,
                              trigger_type: e.target.value as TriggerType,
                            }
                          : prev,
                      )
                    }
                    className="h-10 w-full rounded-md bg-muted text-foreground border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="message_received">Message received</option>
                    <option value="booking_confirmed">Booking confirmed</option>
                    <option value="payment_failed">Payment failed</option>
                    <option value="manual_trigger">Manual trigger</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                    Description
                  </div>
                  <Textarea
                    value={editingFlow?.description || ""}
                    onChange={(e) =>
                      setEditingFlow((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev,
                      )
                    }
                    className="bg-muted text-foreground border-border text-foreground placeholder:text-foreground/30"
                    placeholder="What does this flow do?"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                    Status
                  </div>
                  <select
                    value={editingFlow?.status || "draft"}
                    onChange={(e) =>
                      setEditingFlow((prev) =>
                        prev
                          ? { ...prev, status: e.target.value as FlowStatus }
                          : prev,
                      )
                    }
                    className="h-10 w-full rounded-md bg-muted text-foreground border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                    Priority
                  </div>
                  <Input
                    type="number"
                    value={String(editingFlow?.priority ?? 0)}
                    onChange={(e) =>
                      setEditingFlow((prev) =>
                        prev
                          ? { ...prev, priority: Number(e.target.value || 0) }
                          : prev,
                      )
                    }
                    className="bg-muted text-foreground border-border text-foreground placeholder:text-foreground/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                  Nodes (JSON)
                </div>
                <Textarea
                  value={nodesJson}
                  onChange={(e) => setNodesJson(e.target.value)}
                  className="bg-muted text-foreground border-border text-foreground font-mono text-xs"
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-foreground/60 font-bold uppercase tracking-widest">
                  Edges (JSON)
                </div>
                <Textarea
                  value={edgesJson}
                  onChange={(e) => setEdgesJson(e.target.value)}
                  className="bg-muted text-foreground border-border text-foreground font-mono text-xs"
                  rows={8}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={() => setShowEditor(false)}
                  className="text-muted-foreground font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveEditedFlow}
                  disabled={saving || !editingFlow?.name}
                  className="bg-white text-black hover:bg-zinc-200 font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Flow"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
