
import { NodeStatus } from "./node";

export type OnboardingStep = "interest" | "details" | "kyc" | "review" | "mou" | "allocation" | "complete";
export type OnboardingStatus = "pending" | "approved" | "rejected" | "more_info_needed";

export interface InvestorProfile {
  userId: string;
  legalName: string;
  email: string;
  phone: string;
  kycStatus: "verified" | "pending" | "rejected" | "not_submitted";
  onboardingStep: OnboardingStep;
  onboardingStatus: OnboardingStatus;
  totalNodes: number;
  joinedAt: string;
}

export interface InvestorNodeSummary {
  id: string;
  dataCenterName: string; // e.g., "Okhla – Delhi"
  unitValue: number;
  status: NodeStatus;
  activationDate?: string;
  holdPeriodEnd?: string;
  contractStatus: "signed" | "pending";
}

export interface InvestorNodeDetail extends InvestorNodeSummary {
  deploymentTimeline: {
    date: string;
    event: string;
    description: string;
  }[];
  infrastructure: {
    pool: string;
    location: string;
  };
  adminNotes: string; // Read-only, sanitized
}

export interface InvestorDashboardStats {
  totalNodes: number;
  activeNodes: number;
  deployingNodes: number;
  totalValue: number;
  dataCenters: string[];
  nextReportDate: string;
}

export interface InvestorReport {
  id: string;
  title: string;
  period: string; // e.g., "Q3 2025"
  generatedAt: string;
  type: "operational" | "utilization" | "financial_summary";
  downloadUrl: string;
  isNew: boolean;
}

export interface InvestorDocument {
  id: string;
  title: string;
  type: "mou" | "terms" | "risk_disclosure" | "amendment";
  signedDate?: string;
  version: string;
  downloadUrl: string;
  content?: string;
}

export interface SupportTicket {
  id: string;
  category: "node" | "reports" | "documents" | "other";
  subject: string;
  status: "open" | "closed" | "in_progress";
  createdAt: string;
  lastUpdate: string;
}
