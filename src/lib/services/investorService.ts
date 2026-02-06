
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
import { userService } from "./userService";
import { dcService } from "./datacenterService";

export const investorService = {
  async getProfile(userId: string): Promise<InvestorProfile | null> {
    const user = await userService.getUserById(userId);
    if (!user) return null;

    const nodes = await nodeService.getByUserId(userId);

    // Map KYC status
    let kycStatus: "verified" | "pending" | "rejected" | "not_submitted" = "not_submitted";
    if (user.status.kyc === "verified") kycStatus = "verified";
    else if (user.status.kyc === "pending") kycStatus = "pending";
    else if (user.status.kyc === "rejected") kycStatus = "rejected";

    return {
      userId: user.identity.id,
      legalName: user.profile?.fullName || "Investor",
      email: user.identity.email || "",
      phone: user.identity.phone,
      kycStatus,
      onboardingStep: kycStatus === 'verified' ? 'complete' : 'kyc',
      onboardingStatus: kycStatus === 'verified' ? 'approved' : 'pending',
      totalNodes: nodes.length,
      joinedAt: user.identity.createdAt
    };
  },

  async getStats(userId: string): Promise<InvestorDashboardStats> {
    const nodes = await nodeService.getByUserId(userId);
    
    const dcIds = Array.from(new Set(nodes.map(n => n.infrastructure.dcId)));
    const dcNames: string[] = [];
    
    // Serial fetch for simplicity, can be parallelized
    for (const id of dcIds) {
        const dc = await dcService.getById(id);
        if (dc) dcNames.push(dc.name);
    }

    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(n => n.state.status === 'active').length,
      deployingNodes: nodes.filter(n => n.state.status === 'deploying').length,
      totalValue: nodes.reduce((sum, n) => sum + (Number(n.identity.unitValue) || 0), 0),
      dataCenters: dcNames,
      nextReportDate: "TBD"
    };
  },

  async getNodes(userId: string): Promise<InvestorNodeSummary[]> {
    const nodes = await nodeService.getByUserId(userId);
    const summaries: InvestorNodeSummary[] = [];
    
    for (const node of nodes) {
        const dc = await dcService.getById(node.infrastructure.dcId);
        summaries.push({
            id: node.identity.id,
            dataCenterName: dc?.name || "Unknown DC",
            unitValue: Number(node.identity.unitValue),
            status: node.state.status,
            activationDate: node.state.activationDate,
            holdPeriodEnd: node.state.holdPeriodEnd,
            contractStatus: node.contract.mouStatus === 'signed' ? 'signed' : 'pending'
        });
    }
    return summaries;
  },

  async getNodeDetail(userId: string, nodeId: string): Promise<InvestorNodeDetail | null> {
    const node = await nodeService.getById(nodeId);
    if (!node || node.participant.userId !== userId) return null;

    const dc = await dcService.getById(node.infrastructure.dcId);

    // Build timeline
    const timeline = [
      { event: "Participation Created", date: node.identity.createdAt, description: "Node participation request initialized." }
    ];

    if (node.contract.signedDate) {
      timeline.push({ event: "MoU Signed", date: node.contract.signedDate, description: "Contract signed by both parties." });
    }

    if (node.state.activationDate) {
      timeline.push({ event: "Node Activated", date: node.state.activationDate, description: "Hardware provisioned and online." });
    }

    if (node.state.holdPeriodEnd) {
        // This is a future event, but we can list it. Or only list past events?
        // Usually timeline shows history. Future events might be confusing if not marked.
        // But for "Lock-in End", it's useful.
        // The type definition doesn't specify past/future, but UI handles it.
    }

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
        id: node.identity.id,
        dataCenterName: dc?.name || "Unknown DC",
        unitValue: Number(node.identity.unitValue),
        status: node.state.status,
        activationDate: node.state.activationDate,
        holdPeriodEnd: node.state.holdPeriodEnd,
        contractStatus: node.contract.mouStatus === 'signed' ? 'signed' : 'pending',
        deploymentTimeline: timeline, 
        infrastructure: {
            pool: node.infrastructure.pool,
            location: dc?.location.city || "Unknown"
        },
        adminNotes: node.metadata.adminNotes[node.metadata.adminNotes.length - 1] || "" // Show latest note
    };
  },

  async getReports(userId: string): Promise<InvestorReport[]> { return []; },
  
  async getDocuments(userId: string): Promise<InvestorDocument[]> { return []; },
  
  async getDocument(userId: string, docId: string): Promise<InvestorDocument | null> { return null; },
  
  async getTickets(userId: string): Promise<SupportTicket[]> { return []; },
  
  async createTicket(userId: string, ticket: any): Promise<void> { 
      // TODO: Implement support tickets
      console.log("Create ticket", userId, ticket);
  }
};
