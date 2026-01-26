// Admin API Types

// User item in list
export interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    date_of_birth: string | null;
    role: 'admin' | 'manager' | 'pilgrim' | 'local_guide';
    status: 'active' | 'banned';
    site_id: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    avatar_url: string | null;
    language: string;
}

// Pagination info
export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// GET /api/admin/users - Query Parameters
export interface UserListParams {
    page?: number;
    limit?: number;
    role?: 'admin' | 'manager' | 'pilgrim' | 'local_guide' | '';
    status?: 'active' | 'banned' | '';
    search?: string;
}

// GET /api/admin/users - Response Data
export interface UserListData {
    users: AdminUser[];
    pagination: Pagination;
}

// PUT /api/admin/users/{id} - Request Body
export interface UpdateUserData {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    role?: 'admin' | 'manager' | 'pilgrim' | 'local_guide';
    site_id?: string | null;
}

// PATCH /api/admin/users/{id}/status - Request Body
export interface UpdateUserStatusData {
    status: 'active' | 'banned';
}

// ============ SITE TYPES ============

// Site regions
export type SiteRegion = 'Bac' | 'Trung' | 'Nam';

// Site types
export type SiteType = 'church' | 'shrine' | 'monastery' | 'center' | 'other';

// Site item in list
export interface AdminSite {
    id: string;
    code: string;
    name: string;
    description: string | null;
    address: string | null;
    province: string | null;
    district: string | null;
    region: SiteRegion;
    type: SiteType;
    patron_saint: string | null;
    cover_image: string | null;
    is_active: boolean;
    created_at: string;
}

// GET /api/admin/sites - Query Parameters
export interface SiteListParams {
    page?: number;
    limit?: number;
    region?: SiteRegion | '';
    type?: SiteType | '';
    is_active?: boolean | '';
    search?: string;
}

// GET /api/admin/sites - Response Data
export interface SiteListData {
    sites: AdminSite[];
    pagination: Pagination;
}

// Opening hours structure
export interface SiteOpeningHours {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}

// Contact info structure
export interface SiteContactInfo {
    email?: string;
    phone?: string;
}

// Creator info
export interface SiteCreatedBy {
    id: string;
    full_name: string;
    email: string;
}

// GET /api/admin/sites/{id} - Site Detail Response
export interface SiteDetail extends AdminSite {
    history: string | null;
    latitude: string | null;
    longitude: string | null;
    opening_hours: SiteOpeningHours | null;
    contact_info: SiteContactInfo | null;
    created_by: SiteCreatedBy | null;
    updated_at: string;
}

// PUT /api/admin/sites/{id} - Request Body (FormData)
export interface UpdateSiteData {
    name?: string;
    description?: string;
    history?: string;
    address?: string;
    province?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    region?: SiteRegion;
    type?: SiteType;
    patron_saint?: string;
    cover_image?: File | null;  // File để upload ảnh mới
    is_active?: boolean;
    opening_hours?: SiteOpeningHours;
    contact_info?: SiteContactInfo;
}

// ============ VERIFICATION REQUEST TYPES ============

// Verification request status
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

// Applicant info in verification request
export interface VerificationApplicant {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

// Verification request item in list
export interface VerificationRequest {
    id: string;
    code: string;
    site_name: string;
    site_province: string;
    site_type: SiteType;
    site_region: SiteRegion;
    status: VerificationStatus;
    created_at: string;
    applicant: VerificationApplicant;
}

// GET /api/admin/verification-requests - Query Parameters
export interface VerificationListParams {
    page?: number;
    limit?: number;
    status?: VerificationStatus | '';
    search?: string;
}

// GET /api/admin/verification-requests - Response Data
export interface VerificationListData {
    requests: VerificationRequest[];
    pagination: Pagination;
}

// Applicant detail (with phone)
export interface VerificationApplicantDetail extends VerificationApplicant {
    phone: string | null;
}

// Reviewer info
export interface VerificationReviewer {
    id: string;
    full_name: string;
    email: string;
}

// GET /api/admin/verification-requests/{id} - Response Data
export interface VerificationRequestDetail {
    id: string;
    code: string;
    site_name: string;
    site_address: string;
    site_province: string;
    site_type: SiteType;
    site_region: SiteRegion;
    certificate_url: string | null;
    introduction: string | null;
    status: VerificationStatus;
    rejection_reason: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    applicant: VerificationApplicantDetail;
    reviewer: VerificationReviewer | null;
}

// PATCH /api/admin/verification-requests/{id} - Request Body
export interface UpdateVerificationStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string; // Required when status is 'rejected'
}

// PATCH /api/admin/verification-requests/{id} - Response Data
export interface VerificationUpdateResponse {
    id: string;
    code: string;
    status: VerificationStatus;
    verified_at: string;
}
