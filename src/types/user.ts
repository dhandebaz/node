
import { OmniRoleType } from "./omni";

export type AccountStatus = "active" | "suspended" | "blocked";
export type KYCStatus = "not_started" | "pending" | "verified" | "rejected";
export type ProductType = "omni";

export interface UserIdentity {
  id: string; // Immutable internal ID
  phone: string; // Primary identifier
  email?: string;
  createdAt: string; // ISO date string
}

export interface KYCDocument {
  type: "PAN" | "AADHAAR";
  fileUrl: string; // This would typically be a secure URL or path
  verified: boolean;
  verifiedAt?: string;
  verificationDetails?: {
    name?: string;
    idNumber?: string;
    dob?: string;
    address?: string;
    confidence: number;
    reason?: string;
  };
}

export interface UserStatus {
  account: AccountStatus;
  kyc: KYCStatus;
  onboarding: "pending" | "completed";
  kycDocuments?: KYCDocument[];
}

export interface UserRoles {
  isOmniUser: boolean;
  isAdmin?: boolean;
}

export interface UserMetadata {
  tags: string[]; // Admin-defined tags
  notes: string[]; // Admin-only notes
  lastActivity: string; // ISO date string
}

export interface OmniProfile {
  businessType: string;
  tenantId?: string; // Added tenantId
  activeModules: string[];
  role: OmniRoleType;
  status: "active" | "paused";
}

export interface UserProductProfiles {
  omni?: OmniProfile;
}

export interface UserProfile {
  fullName: string | null;
}

import { Tenant } from "./index";

export interface User {
  identity: UserIdentity;
  profile: UserProfile | null;
  status: UserStatus;
  roles: UserRoles;
  metadata: UserMetadata;
  products: UserProductProfiles;
  tenant?: Tenant; // Full tenant context
}

export interface AuditLog {
  id: string;
  adminId: string;
  targetUserId: string;
  actionType: "status_change" | "kyc_decision" | "tag_update" | "note_added";
  details: string;
  timestamp: string;
}

// Filter Options Interface
export interface UserFilterOptions {
  search?: string;
  product?: ProductType;
  kycStatus?: KYCStatus;
  accountStatus?: AccountStatus;
}
