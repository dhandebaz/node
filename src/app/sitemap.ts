import { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/runtime-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();
  const lastModified = new Date();
  const routes = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/trust", changeFrequency: "monthly", priority: 0.8 },
    { path: "/employees", changeFrequency: "weekly", priority: 0.85 },
    { path: "/employees/host-ai", changeFrequency: "monthly", priority: 0.8 },
    { path: "/employees/nurse-ai", changeFrequency: "monthly", priority: 0.8 },
    { path: "/employees/dukan-ai", changeFrequency: "monthly", priority: 0.8 },
    { path: "/employees/thrift-ai", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare", changeFrequency: "weekly", priority: 0.9 },
    { path: "/compare/kommo", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/respondio", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/wati", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/interakt", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/intercom", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/zendesk", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/freshdesk", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/hubspot", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/drift", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/livechat", changeFrequency: "monthly", priority: 0.8 },
    { path: "/compare/botpress", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries", changeFrequency: "weekly", priority: 0.9 },
    { path: "/industries/hospitality", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/healthcare", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/retail", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/social-commerce", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/real-estate", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/education", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/fitness", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/automotive", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/legal", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/beauty", changeFrequency: "monthly", priority: 0.8 },
    { path: "/industries/food", changeFrequency: "monthly", priority: 0.8 },
    { path: "/docs", changeFrequency: "weekly", priority: 0.8 },
    {
      path: "/docs/getting-started",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      path: "/docs/getting-started/quickstart",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    { path: "/docs/kaisa", changeFrequency: "monthly", priority: 0.75 },
    {
      path: "/docs/kaisa/agents-api",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/docs/kaisa/integrations",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { path: "/company", changeFrequency: "monthly", priority: 0.75 },
    {
      path: "/company/careers",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      path: "/company/contact",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/company/partners",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/company/partners/system-integrators",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      path: "/company/partners/technology",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    { path: "/legal/terms", changeFrequency: "yearly", priority: 0.5 },
    { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.5 },
    { path: "/legal/cookies", changeFrequency: "yearly", priority: 0.45 },
    { path: "/legal/refund", changeFrequency: "yearly", priority: 0.45 },
    { path: "/legal/risk", changeFrequency: "yearly", priority: 0.45 },
    { path: "/legal/sla", changeFrequency: "yearly", priority: 0.45 },
    { path: "/legal/aup", changeFrequency: "yearly", priority: 0.45 },
  ] as const;

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
