
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
      .from("omni_flows")
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
      
      case 'action_reply': {
        const replyContent = node.data.message || triggerData.aiReply || triggerData.content || "Thank you for your message.";
        const channel = triggerData.channel || 'whatsapp';
        const recipientId = triggerData.sender || triggerData.recipientId;
        
        // Record the reply in messages table
        const supabaseNode = await getSupabaseAdmin();
        await supabaseNode.from("messages").insert({
          tenant_id: tenantId,
          conversation_id: triggerData.conversationId,
          guest_id: triggerData.guestId,
          direction: "outbound",
          role: "assistant",
          channel,
          content: replyContent,
          metadata: { 
            read: true, 
            flow_id: node.id,
            trigger: triggerData.triggerType 
          },
          created_at: new Date().toISOString()
        });

        // Send via channel if externalId is available
        if (recipientId && channel !== 'web') {
          const { ChannelService } = await import("./channelService");
          try {
            await ChannelService.sendMessage({
              tenantId,
              recipientId,
              content: replyContent,
              channel: channel as any
            });
          } catch (err) {
            log.error("Failed to send flow reply via channel:", err);
          }
        }

        return { handle: 'next', halt: node.data.haltAfterReply };
      }

      case 'action_handover': {
        // Pause AI for this guest
        const supabaseHandover = await getSupabaseAdmin();
        if (triggerData.guestId) {
          await supabaseHandover
            .from("guests")
            .update({ ai_paused: true })
            .eq("id", triggerData.guestId);
        }
        return { handle: 'next', halt: true };
      }

      case 'action_api':
        try {
          const { url, method, headers, bodyTemplate } = node.data;
          
          if (!url) {
            log.warn("action_api node missing URL");
            return { handle: 'next', error: "Missing URL" };
          }

          // Build request headers
          const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
          };

          // Replace template variables in URL and body
          let requestUrl = url;
          let requestBody = bodyTemplate ? JSON.parse(bodyTemplate) : undefined;

          // Simple template replacement: {{variable}}
          const replaceTemplate = (str: string, data: any) => {
            return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
              return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
            });
          };

          if (typeof requestUrl === 'string') {
            requestUrl = replaceTemplate(requestUrl, triggerData);
          }

          if (requestBody && typeof requestBody === 'object') {
            const replacedBody: any = {};
            for (const [key, val] of Object.entries(requestBody)) {
              if (typeof val === 'string') {
                replacedBody[key] = replaceTemplate(val, triggerData);
              } else {
                replacedBody[key] = val;
              }
            }
            requestBody = replacedBody;
          }

          // Make the API call
          const response = await fetch(requestUrl, {
            method: method || 'GET',
            headers: requestHeaders,
            body: requestBody ? JSON.stringify(requestBody) : undefined,
          });

          // Store response data for subsequent nodes
          if (triggerData._apiResponse === undefined) {
            triggerData._apiResponse = {};
          }

          try {
            const responseData = await response.json();
            triggerData._apiResponse[node.id] = responseData;
          } catch {
            triggerData._apiResponse[node.id] = await response.text();
          }

          // Check if response indicates success or failure
          const successHandle = response.ok ? 'success' : 'error';
          return { handle: successHandle };

        } catch (error) {
          log.error("action_api node execution failed:", error);
          triggerData._apiError = error;
          return { handle: 'error', error: String(error) };
        }

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
