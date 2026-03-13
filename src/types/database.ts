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
    accounts: DBAccount[] | DBAccount | null; // Added accounts relation
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
    tenant_id?: string; // Added tenant_id
    // Add other columns as needed based on usage
}

export interface DBAccount {
    id: string;
    user_id: string;
    product_type: 'ai_employee' | 'space';
    onboarding_status: string;
    tenant_id?: string;
    business_type?: string;
    created_at: string;
    updated_at?: string;
}

export interface DBTenant {
    id: string;
    name: string;
    owner_user_id: string;
    created_at: string;
    address?: string;
    tax_id?: string;
    kyc_document_path?: string;
    kyc_extracted_data?: any; // JSONB
    legal_agreement_path?: string;
    phone?: string;
    timezone?: string;
    kyc_status?: 'not_started' | 'pending' | 'verified' | 'rejected';
    kyc_verified_at?: string;
    username?: string;
    business_type?: string;
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
    tenant_id?: string;
    check_in_time?: string;
    check_out_time?: string;
    timezone?: string;
}
