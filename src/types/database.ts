export interface DBUser {
    id: string;
    phone: string;
    role: string;
    status: string;
    kyc_status: string;
    onboarding_status?: string;
    created_at: string;
    updated_at?: string;
    metadata: UserMetadataJSON | null;
    // Relations (joined)
    profiles: DBProfile[] | DBProfile | null;
    kaisa_accounts: DBKaisaAccount[] | DBKaisaAccount | null;
    nodes: DBNode[];
    listings: DBListing[];
}

export interface UserMetadataJSON {
    tags?: string[];
    notes?: string[];
    lastActivity?: string;
    kycDocuments?: any[]; // Typed strictly if possible, but 'any' here is safer for JSONB for now
    [key: string]: any;
}

export interface DBProfile {
    id: string;
    user_id: string;
    full_name: string | null;
    business_name?: string;
    created_at: string;
}

export interface DBKaisaAccount {
    user_id: string;
    status: string;
    business_type?: string;
    // Add other columns as needed based on usage
}

export interface DBNode {
    id: string;
    unit_value?: number;
    mou_status?: string;
    created_at: string;
}

export interface DBListing {
    id: string;
    title: string;
    created_at: string;
}
