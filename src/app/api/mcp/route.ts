import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { publishUnifiedPostAction } from "@/app/actions/meta-publishing";
import { syncCatalogAction } from "@/app/actions/meta-catalog";
import { getAdInsightsAction, updateCampaignStatusAction } from "@/app/actions/meta-marketing";
import { log } from "@/lib/logger";

// Initialize the MCP Server with Sentry Wrapping
const server = Sentry.wrapMcpServerWithSentry(
  new McpServer({
    name: "nodebase-meta-bridge",
    version: "1.0.0",
  })
);

/**
 * Register Meta Business Tools
 */

// 1. Social Publishing
server.tool(
  "publish_social",
  "Publish a unified post to Facebook, Instagram, and Threads",
  {
    text: z.string().describe("The post content text"),
    mediaUrl: z.string().optional().describe("Optional URL to the image or video"),
    platforms: z.object({
      facebook: z.boolean().optional(),
      instagram: z.boolean().optional(),
      threads: z.boolean().optional(),
    }).describe("Target platforms")
  },
  async (params) => {
    try {
      const result = await publishUnifiedPostAction(params);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        isError: !result.success
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: (e as Error).message }],
        isError: true
      };
    }
  }
);

// 2. Catalog Synchronization
server.tool(
  "sync_catalog",
  "Trigger synchronization of product listings to Meta Commerce Catalog",
  {
    catalogId: z.string().describe("The Meta Catalog ID to sync with")
  },
  async ({ catalogId }) => {
    try {
      const result = await syncCatalogAction(catalogId);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        isError: !result.success
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: (e as Error).message }],
        isError: true
      };
    }
  }
);

// 3. Ad Management
server.tool(
  "get_ad_insights",
  "Fetch performance insights for a specific Meta Ad Campaign or Account",
  {
    id: z.string().describe("The Ad Account or Campaign ID")
  },
  async ({ id }) => {
    try {
      const result = await getAdInsightsAction(id);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        isError: !result.success
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: (e as Error).message }],
        isError: true
      };
    }
  }
);

/**
 * Next.js Route Handlers for MCP SSE
 */

let transport: SSEServerTransport | null = null;

export async function GET(request: Request) {
  transport = new SSEServerTransport("/api/mcp", (request as any).nextUrl || request.url);
  await server.connect(transport);
  return (transport as any).handle(request);
}

export async function POST(request: Request) {
  if (!transport) {
    return new Response("No active transport", { status: 400 });
  }
  return (transport as any).handle(request);
}
