
  import { 
  User, 
  UserFilterOptions, 
  AuditLog, 
  AccountStatus, 
  KYCStatus,
  KYCDocument
} from "@/types/user";

// Mock Data
let MOCK_USERS: User[] = [
  {
    identity: {
      id: "ADMIN-001",
      phone: "+91 9910778576",
      email: "admin@nodebase.com",
      createdAt: "2023-11-01T10:00:00Z",
    },
    status: {
      account: "active",
      kyc: "verified",
    },
    roles: {
      isKaisaUser: true,
      isSpaceUser: true,
      isNodeParticipant: true,
    },
    metadata: {
      tags: ["admin", "staff"],
      notes: ["Super Admin User"],
      lastActivity: new Date().toISOString(),
    },
    products: {
      kaisa: {
        businessType: "Technology",
        activeModules: ["Bookings", "Inventory", "Staff"],
        role: "owner",
        status: "active",
      },
      space: {
        hostingPlans: ["Pro Cloud", "Dedicated"],
        status: "active",
      },
      node: {
        nodeUnits: 10,
        mouStatus: "signed",
      }
    },
  },
  {
    identity: {
      id: "USR-001",
      phone: "+91 9876543210",
      email: "rahul@homestay.com",
      createdAt: "2023-12-01T10:00:00Z",
    },
    status: {
      account: "active",
      kyc: "verified",
    },
    roles: {
      isKaisaUser: true,
      isSpaceUser: true,
      isNodeParticipant: false,
    },
    metadata: {
      tags: ["early-adopter", "premium"],
      notes: ["High value customer"],
      lastActivity: "2024-02-10T15:30:00Z",
    },
    products: {
      kaisa: {
        businessType: "Homestay",
        activeModules: ["Bookings", "Inventory"],
        role: "manager",
        status: "active",
      },
      space: {
        hostingPlans: ["Pro Cloud"],
        status: "active",
      },
    },
  },
  {
    identity: {
      id: "USR-002",
      phone: "+91 9876543211",
      createdAt: "2024-01-15T09:00:00Z",
    },
    status: {
      account: "active",
      kyc: "pending",
      kycDocuments: [
        {
          type: "PAN",
          fileUrl: "/mock-docs/pan-card.jpg",
          verified: false,
          verificationDetails: {
            name: "Rahul Sharma",
            idNumber: "ABCDE1234F",
            confidence: 0.95,
            dob: "1990-01-01"
          }
        },
        {
          type: "AADHAAR",
          fileUrl: "/mock-docs/aadhaar-front.jpg",
          verified: false,
          verificationDetails: {
            name: "Rahul Kumar Sharma",
            idNumber: "1234 5678 9012",
            address: "123, Main Street, Delhi",
            confidence: 0.88
          }
        }
      ]
    },
    roles: {
      isKaisaUser: false,
      isSpaceUser: false,
      isNodeParticipant: true,
    },
    metadata: {
      tags: ["investor"],
      notes: [],
      lastActivity: "2024-02-11T09:00:00Z",
    },
    products: {
      node: {
        nodeUnits: 5,
        mouStatus: "pending",
      },
    },
  },
  {
    identity: {
      id: "USR-003",
      phone: "+91 9876543212",
      email: "suspended@user.com",
      createdAt: "2023-11-20T14:00:00Z",
    },
    status: {
      account: "suspended",
      kyc: "rejected",
    },
    roles: {
      isKaisaUser: true,
      isSpaceUser: false,
      isNodeParticipant: false,
    },
    metadata: {
      tags: ["spam-risk"],
      notes: ["Suspicious activity detected"],
      lastActivity: "2024-01-05T10:00:00Z",
    },
    products: {
      kaisa: {
        businessType: "Retail",
        activeModules: [],
        role: "manager",
        status: "paused",
      },
    },
  },
];

let MOCK_AUDIT_LOGS: AuditLog[] = [];

// Service Methods

import { settingsService } from "./settingsService";

export const userService = {
  async getUsers(filters?: UserFilterOptions): Promise<User[]> {
    const isProduction = await settingsService.isProductionMode();
    // In production, return empty array for now (or real DB connection later)
    // In mock mode, return the mock users
    let users = isProduction ? [] : [...MOCK_USERS];

    if (filters) {
      // Search
      if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
          u.identity.id.toLowerCase().includes(search) ||
          u.identity.phone.includes(search) ||
          u.identity.email?.toLowerCase().includes(search) ||
          u.metadata.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      // Product Filter
      if (filters.product) {
        if (filters.product === "kaisa") users = users.filter(u => u.roles.isKaisaUser);
        if (filters.product === "space") users = users.filter(u => u.roles.isSpaceUser);
        if (filters.product === "node") users = users.filter(u => u.roles.isNodeParticipant);
      }

      // Status Filters
      if (filters.kycStatus) {
        users = users.filter(u => u.status.kyc === filters.kycStatus);
      }
      if (filters.accountStatus) {
        users = users.filter(u => u.status.account === filters.accountStatus);
      }
    }

    // Sort by createdAt desc by default
    return users.sort((a, b) => 
      new Date(b.identity.createdAt).getTime() - new Date(a.identity.createdAt).getTime()
    );
  },

  async getUserById(id: string): Promise<User | null> {
    return MOCK_USERS.find(u => u.identity.id === id) || null;
  },

  async updateUserStatus(
    adminId: string, 
    userId: string, 
    status: AccountStatus
  ): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user) return false;

    const oldStatus = user.status.account;
    user.status.account = status;

    await this.logAction(adminId, userId, "status_change", `Changed status from ${oldStatus} to ${status}`);
    return true;
  },

  async updateKYCStatus(
    adminId: string, 
    userId: string, 
    status: KYCStatus, 
    reason?: string
  ): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user) return false;

    const oldStatus = user.status.kyc;
    user.status.kyc = status;

    // Auto-update document verification status based on global decision
    if (status === "verified" && user.status.kycDocuments) {
      user.status.kycDocuments.forEach(doc => {
        doc.verified = true;
        doc.verifiedAt = new Date().toISOString();
      });
    } else if (status === "rejected" && user.status.kycDocuments) {
       // If rejected, we might want to mark them as failed or leave them as is with a reason
       // For now, let's just leave them as unverified but ensuring they aren't marked as verified
       user.status.kycDocuments.forEach(doc => {
        doc.verified = false;
        // In a real scenario, we might add the rejection reason to the document details
        if (reason && doc.verificationDetails) {
            doc.verificationDetails.reason = reason;
        }
      });
    }

    await this.logAction(adminId, userId, "kyc_decision", `Changed KYC from ${oldStatus} to ${status}. ${reason ? `Reason: ${reason}` : ""}`);
    return true;
  },

  async addNote(adminId: string, userId: string, note: string): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user) return false;

    user.metadata.notes.push(note);
    await this.logAction(adminId, userId, "note_added", note);
    return true;
  },

  async updateTags(adminId: string, userId: string, tags: string[]): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user) return false;

    user.metadata.tags = tags;
    await this.logAction(adminId, userId, "tag_update", `Tags updated: ${tags.join(", ")}`);
    return true;
  },

  async updateKaisaStatus(
    adminId: string,
    userId: string,
    status: "active" | "paused"
  ): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user || !user.products.kaisa) return false;

    const oldStatus = user.products.kaisa.status;
    user.products.kaisa.status = status;

    await this.logAction(
        adminId, 
        userId, 
        "status_change", 
        `Changed kaisa status from ${oldStatus} to ${status}`
    );
    return true;
  },

  async addKYCDocument(userId: string, document: KYCDocument): Promise<boolean> {
    const user = MOCK_USERS.find(u => u.identity.id === userId);
    if (!user) return false;

    if (!user.status.kycDocuments) {
      user.status.kycDocuments = [];
    }

    user.status.kycDocuments.push(document);
    
    // Auto-update status if document is verified
    if (document.verified) {
      // If we have both verified PAN and Aadhaar, mark user as verified
      const hasPan = user.status.kycDocuments.some(d => d.type === "PAN" && d.verified);
      const hasAadhaar = user.status.kycDocuments.some(d => d.type === "AADHAAR" && d.verified);
      
      if (hasPan && hasAadhaar) {
        user.status.kyc = "verified";
      } else {
        user.status.kyc = "pending";
      }
    }

    await this.logAction(
      "SYSTEM", 
      userId, 
      "kyc_decision", 
      `Uploaded ${document.type} document. Verification status: ${document.verified ? "Verified" : "Pending/Failed"}`
    );
    
    return true;
  },

  async logAction(
    adminId: string, 
    targetUserId: string,  
    actionType: AuditLog["actionType"], 
    details: string
  ) {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId,
      targetUserId,
      actionType,
      details,
      timestamp: new Date().toISOString(),
    };
    MOCK_AUDIT_LOGS.unshift(log);
    console.log("[AUDIT LOG]", log);
  },

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    return MOCK_AUDIT_LOGS.filter(l => l.targetUserId === userId);
  }
};
