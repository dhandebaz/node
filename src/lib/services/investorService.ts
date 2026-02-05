
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
    downloadUrl: "#",
    content: `
      <h2>MEMORANDUM OF UNDERSTANDING</h2>
      <p><strong>This Memorandum of Understanding (MOU)</strong> is made and entered into on this 25th day of November, 2023 (the "Effective Date"), by and between:</p>
      
      <p><strong>1. Chishti Ventures Private Limited</strong>, a company incorporated under the laws of India, operating the platform "Nodebase" (hereinafter referred to as the "Platform" or "Company"); AND</p>
      
      <p><strong>2. Rahul Sharma</strong>, an individual/entity residing/registered at [Investor Address] (hereinafter referred to as the "Partner" or "Node Owner").</p>

      <h3>1. PURPOSE & SCOPE</h3>
      <p>The Partner wishes to acquire and deploy high-performance computing hardware ("Nodes") through the Platform to participate in the Node Network. The Platform agrees to host, manage, and monetize these Nodes on behalf of the Partner.</p>

      <h3>2. OBLIGATIONS OF THE PARTNER</h3>
      <ul>
        <li><strong>Capital Commitment:</strong> The Partner agrees to fund the acquisition of 2 Unit(s) of Compute Nodes as specified in Annexure A.</li>
        <li><strong>Ownership:</strong> The Partner retains full legal ownership of the hardware assets for the duration of this agreement.</li>
      </ul>

      <h3>3. OBLIGATIONS OF THE PLATFORM</h3>
      <ul>
        <li><strong>Hosting & Maintenance:</strong> The Platform shall house the Nodes in its Tier-3 Data Center facility (Okhla, Delhi) and provide power, cooling, and network connectivity.</li>
        <li><strong>Utilization:</strong> The Platform is authorized to lease the compute power to third-party clients (kaisa AI, Space Cloud, etc.).</li>
      </ul>

      <h3>4. REVENUE SHARING</h3>
      <p>Net revenue generated from the utilization of the Nodes shall be distributed as follows:</p>
      <ul>
        <li><strong>Partner Share:</strong> 80% of Net Revenue.</li>
        <li><strong>Platform Fee:</strong> 20% of Net Revenue (covering management, sales, and software).</li>
      </ul>

      <h3>5. TERM & TERMINATION</h3>
      <p>This MOU is valid for a period of 36 months from the Effective Date. Either party may terminate with 90 days' written notice, subject to the Exit Clause defined in Section 8.</p>

      <hr />
      <p><em>Signed digitally via Nodebase SecureSign™</em></p>
    `
  },
  {
    id: "DOC-RISK-001",
    title: "Risk Disclosure Statement",
    type: "risk_disclosure",
    signedDate: "2023-11-25",
    version: "2.1",
    downloadUrl: "#",
    content: `
      <h2>RISK DISCLOSURE STATEMENT</h2>
      <p><strong>Important Notice:</strong> Participation in the Node Network involves significant risks. Before deploying capital, you should carefully consider the following:</p>

      <h3>1. HARDWARE RISKS</h3>
      <p>While the Platform maintains high-quality facilities, hardware components (GPU, CPU, SSDs) have a finite lifespan and may suffer failure or degradation. The Platform facilitates warranty claims but is not liable for manufacturing defects.</p>

      <h3>2. MARKET & UTILIZATION RISK</h3>
      <p>Revenue is variable and depends on market demand for compute power. The Platform does not guarantee a fixed rate of return (ROI) or specific utilization levels. Past performance is not indicative of future results.</p>

      <h3>3. REGULATORY RISK</h3>
      <p>Changes in laws regarding digital assets, data sovereignty, or taxation in India or other jurisdictions may adversely affect the operation of the Node Network.</p>

      <h3>4. LIQUIDITY</h3>
      <p>Node ownership is a tangible asset commitment. Liquidation of hardware before the end of the useful life may result in loss of capital due to depreciation and market conditions.</p>

      <p>By signing the Master MOU, you acknowledge that you have read, understood, and accepted these risks.</p>
    `
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

  async getDocument(userId: string, docId: string): Promise<InvestorDocument | undefined> {
    return MOCK_DOCS.find(d => d.id === docId);
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
