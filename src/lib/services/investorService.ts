
import { 
  InvestorDashboardStats, 
  InvestorNodeSummary, 
  InvestorNodeDetail, 
  InvestorReport, 
  InvestorDocument, 
  SupportTicket,
  InvestorProfile
} from "@/types/investor";
import { nodeService } from "./nodeService";
import { userService } from "./userService"; // Assuming this exists or I'll just mock profile
import { Node } from "@/types/node";

// Mock Data for Non-Node Entities
const MOCK_REPORTS: InvestorReport[] = [
  {
    id: "RPT-2024-Q3",
    title: "Q3 2024 Operational Summary",
    period: "Q3 2024",
    generatedAt: "2024-10-15T00:00:00Z",
    type: "operational",
    downloadUrl: "#",
    isNew: false
  },
  {
    id: "RPT-2024-Q4",
    title: "Q4 2024 Infrastructure Utilization",
    period: "Q4 2024",
    generatedAt: "2025-01-15T00:00:00Z",
    type: "utilization",
    downloadUrl: "#",
    isNew: true
  }
];

const MOCK_DOCS: InvestorDocument[] = [
  {
    id: "DOC-MOU-001",
    title: "Master MoU - Chishti Ventures",
    type: "mou",
    signedDate: "2023-11-25",
    version: "1.0",
    downloadUrl: "#"
  },
  {
    id: "DOC-RISK-001",
    title: "Risk Disclosure Statement",
    type: "risk_disclosure",
    signedDate: "2023-11-25",
    version: "2.1",
    downloadUrl: "#"
  }
];

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1023",
    category: "reports",
    subject: "Question about Q3 Report",
    status: "closed",
    createdAt: "2024-10-20T14:30:00Z",
    lastUpdate: "2024-10-21T09:15:00Z"
  }
];

export const investorService = {
  // Profile & Access
  async getProfile(userId: string): Promise<InvestorProfile | null> {
    // In real app, fetch from userService and enrich
    // For now, mock return based on user ID
    return {
      userId,
      legalName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      kycStatus: "verified",
      onboardingStep: "complete",
      onboardingStatus: "approved",
      totalNodes: 2,
      joinedAt: "2023-11-15T00:00:00Z"
    };
  },

  // Dashboard Overview
  async getStats(userId: string): Promise<InvestorDashboardStats> {
    const nodes = await nodeService.getByUserId(userId);
    
    const active = nodes.filter(n => n.state.status === "active").length;
    const deploying = nodes.filter(n => n.state.status === "deploying").length;
    const totalValue = nodes.reduce((sum, n) => sum + n.identity.unitValue, 0);
    
    // Extract unique DC IDs (in real app, map to names)
    const dcIds = Array.from(new Set(nodes.map(n => n.infrastructure.dcId)));
    
    return {
      totalNodes: nodes.length,
      activeNodes: active,
      deployingNodes: deploying,
      totalValue,
      dataCenters: ["Okhla – Delhi"], // Mock mapping
      nextReportDate: "2025-04-15"
    };
  },

  // Nodes
  async getNodes(userId: string): Promise<InvestorNodeSummary[]> {
    const nodes = await nodeService.getByUserId(userId);
    
    return nodes.map(n => ({
      id: n.identity.id,
      dataCenterName: "Okhla – Delhi", // Mock mapping
      unitValue: n.identity.unitValue,
      status: n.state.status,
      activationDate: n.state.activationDate,
      holdPeriodEnd: n.state.holdPeriodEnd,
      contractStatus: n.contract.mouStatus === "active" || n.contract.mouStatus === "signed" ? "signed" : "pending"
    }));
  },

  async getNodeDetail(userId: string, nodeId: string): Promise<InvestorNodeDetail | null> {
    const node = await nodeService.getById(nodeId);
    if (!node || node.participant.userId !== userId) return null;

    return {
      id: node.identity.id,
      dataCenterName: "Okhla – Delhi",
      unitValue: node.identity.unitValue,
      status: node.state.status,
      activationDate: node.state.activationDate,
      holdPeriodEnd: node.state.holdPeriodEnd,
      contractStatus: node.contract.mouStatus === "active" || node.contract.mouStatus === "signed" ? "signed" : "pending",
      deploymentTimeline: [
        { date: node.identity.createdAt, event: "Order Placed", description: "Node unit allocated." },
        { date: node.contract.signedDate || "", event: "MoU Signed", description: "Contract executed." },
        ...(node.state.activationDate ? [{ date: node.state.activationDate, event: "Activation", description: "Node is live and operational." }] : [])
      ],
      infrastructure: {
        pool: node.infrastructure.pool,
        location: "Rack 4, Row B, Okhla DC"
      },
      adminNotes: "Node performing within optimal parameters." // Generic sanitized note
    };
  },

  // Reports & Docs
  async getReports(userId: string): Promise<InvestorReport[]> {
    return MOCK_REPORTS;
  },

  async getDocuments(userId: string): Promise<InvestorDocument[]> {
    return MOCK_DOCS;
  },

  // Support
  async getTickets(userId: string): Promise<SupportTicket[]> {
    return MOCK_TICKETS;
  },

  async createTicket(userId: string, data: Partial<SupportTicket>): Promise<void> {
    MOCK_TICKETS.push({
      id: `TKT-${Math.floor(Math.random() * 10000)}`,
      category: data.category as any || "other",
      subject: data.subject || "No Subject",
      status: "open",
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    });
  }
};
