
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { geminiService } from "./geminiService";

export type FlowNodeType = 'trigger' | 'condition' | 'sentiment_check' | 'action_reply' | 'action_handover' | 'action_api';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export class FlowService {
  /**
   * Execute flows for a given trigger.
   */
  static async executeTrigger(tenantId: string, triggerType: string, triggerData: any) {
    const supabase = await getSupabaseAdmin(); // System level execution
    
    // 1. Fetch active flows for this trigger
    const { data: flows } = await supabase
      .from("kaisa_flows")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("trigger_type", triggerType)
      .eq("status", "active")
      .order("priority", { ascending: false });

    if (!flows || flows.length === 0) return null;

    const results = [];

    for (const flow of flows) {
      try {
        const executionResult = await this.runFlow(flow, triggerData, tenantId);
        results.push({ flowId: flow.id, ...executionResult });
        
        // If a flow "handled" the trigger, we might want to stop executing others
        if (executionResult.halted) break;
      } catch (error: any) {
        log.error(`Flow execution failed for ${flow.id}`, error);
      }
    }

    return results;
  }

  /**
   * Internal engine to step through nodes.
   */
  private static async runFlow(flow: any, triggerData: any, tenantId: string) {
    const nodes = flow.nodes as FlowNode[];
    const edges = flow.edges as FlowEdge[];
    const steps: any[] = [];
    
    // Find starting trigger node
    let currentNode = nodes.find(n => n.type === 'trigger');
    if (!currentNode) return { halted: false, error: "No trigger node" };

    let halted = false;

    while (currentNode) {
      steps.push({ nodeId: currentNode.id, type: currentNode.type });

      // Execute node logic
      const actionResult = await this.executeNode(currentNode, triggerData, tenantId);
      
      if (actionResult.halt) {
        halted = true;
        break;
      }

      // Find next node based on result handle (e.g. 'true'/'false' for conditions)
      const edge = edges.find(e => 
        e.source === currentNode?.id && 
        (!e.sourceHandle || e.sourceHandle === actionResult.handle)
      );

      currentNode = edge ? nodes.find(n => n.id === edge.target) : undefined;
    }

    // Log execution
    const supabase = await getSupabaseAdmin();
    await supabase.from("flow_execution_logs").insert({
      tenant_id: tenantId,
      flow_id: flow.id,
      trigger_data: triggerData,
      execution_steps: steps,
      status: halted ? 'halted' : 'success',
      finished_at: new Date().toISOString()
    });

    return { halted, steps };
  }

  private static async executeNode(node: FlowNode, triggerData: any, tenantId: string) {
    switch (node.type) {
      case 'condition':
        const isMatch = this.evaluateCondition(node.data, triggerData);
        return { handle: isMatch ? 'true' : 'false' };
      
      case 'sentiment_check':
        const analysis = await geminiService.analyzeSentiment(triggerData.content || "");
        // data.threshold could be 'negative' or 'angry'
        const threshold = node.data.threshold || 'negative';
        const isTriggered = 
          (threshold === 'negative' && (analysis.sentiment === 'negative' || analysis.sentiment === 'angry')) ||
          (threshold === 'angry' && analysis.sentiment === 'angry');
        
        return { handle: isTriggered ? 'true' : 'false' };
      
      case 'action_reply':
        // logic to send AI reply via existing AIService/WahaService
        return { handle: 'next', halt: node.data.haltAfterReply };

      case 'action_handover':
        // logic to pause AI for guest
        return { handle: 'next', halt: true };

      default:
        return { handle: 'next' };
    }
  }

  private static evaluateCondition(config: any, data: any): boolean {
    const { field, operator, value } = config;
    const actualValue = data[field];

    switch (operator) {
      case 'contains': return String(actualValue).toLowerCase().includes(String(value).toLowerCase());
      case 'equals': return actualValue === value;
      default: return false;
    }
  }
}
