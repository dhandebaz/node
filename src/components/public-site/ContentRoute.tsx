"use client";

import { ArticlePage, DirectoryPage } from "@/components/public-site/primitives";
import {
  careersPage,
  companyDirectoryPage,
  docsDirectoryPage,
  docsPages,
  employeeDirectoryPage,
  employeePages,
  legalPages,
  partnerTrackPages,
  partnersDirectoryPage,
  trustPage,
} from "@/lib/public-content";

const directoryPageMap = {
  company: companyDirectoryPage,
  docs: docsDirectoryPage,
  employees: employeeDirectoryPage,
  partners: partnersDirectoryPage,
} as const;

const articlePageMap = {
  careers: careersPage,
  "docs-agents-api": docsPages["agents-api"],
  "docs-getting-started": docsPages["getting-started"],
  "docs-integrations": docsPages.integrations,
  "docs-kaisa": docsPages.kaisa,
  "docs-quickstart": docsPages.quickstart,
  "employee-dukan-ai": employeePages["dukan-ai"],
  "employee-host-ai": employeePages["host-ai"],
  "employee-nurse-ai": employeePages["nurse-ai"],
  "employee-thrift-ai": employeePages["thrift-ai"],
  "legal-aup": legalPages.aup,
  "legal-cookies": legalPages.cookies,
  "legal-privacy": legalPages.privacy,
  "legal-refund": legalPages.refund,
  "legal-risk": legalPages.risk,
  "legal-sla": legalPages.sla,
  "legal-terms": legalPages.terms,
  "partner-system-integrators": partnerTrackPages["system-integrators"],
  "partner-technology": partnerTrackPages.technology,
  trust: trustPage,
} as const;

type DirectoryPageId = keyof typeof directoryPageMap;
type ArticlePageId = keyof typeof articlePageMap;

export function RenderDirectoryRoute({
  id,
  compact = false,
}: {
  id: DirectoryPageId;
  compact?: boolean;
}) {
  return <DirectoryPage page={directoryPageMap[id]} compact={compact} />;
}

export function RenderArticleRoute({
  id,
  compact = false,
}: {
  id: ArticlePageId;
  compact?: boolean;
}) {
  return <ArticlePage page={articlePageMap[id]} compact={compact} />;
}
