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

// ============ SITE CONTENT APIs (Admin) ============

// Site basic info in response
export interface SiteBasicInfo {
    id: string;
    code: string;
    name: string;
}

// Local Guide in site
export interface SiteLocalGuide {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
}

// GET /api/admin/sites/{siteId}/local-guides - Query params
export interface SiteLocalGuidesParams {
    page?: number;
    limit?: number;
}

// GET /api/admin/sites/{siteId}/local-guides - Response
export interface SiteLocalGuidesResponse {
    site: SiteBasicInfo;
    guides: SiteLocalGuide[];
    pagination: Pagination;
}

// ============ SITE SHIFTS APIs ============

// Shift status
export type ShiftSubmissionStatus = 'pending' | 'approved' | 'rejected';

// Individual shift in a submission
export interface SiteShift {
    id: string;
    day_of_week: number; // 0-6 (Sunday-Saturday)
    start_time: string; // HH:mm:ss
    end_time: string;   // HH:mm:ss
}

// Guide basic info in shift submission
export interface ShiftGuide {
    id: string;
    full_name: string;
    email: string;
}

// Shift submission in site
export interface SiteShiftSubmission {
    id: string;
    guide_id: string;
    site_id: string;
    code: string | null;
    week_start_date: string;
    submission_type: 'new' | 'edit';
    change_reason: string | null;
    previous_submission_id: string | null;
    status: ShiftSubmissionStatus;
    total_shifts: number;
    rejection_reason: string | null;
    approved_by: string | null;
    approved_at: string | null;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    guide: ShiftGuide;
    shifts: SiteShift[];
}

// GET /api/admin/sites/{siteId}/shifts - Query params
export interface SiteShiftsParams {
    page?: number;
    limit?: number;
    status?: ShiftSubmissionStatus;
}

// GET /api/admin/sites/{siteId}/shifts - Response
export interface SiteShiftsResponse {
    site: SiteBasicInfo;
    submissions: SiteShiftSubmission[];
    pagination: Pagination;
}

// ============ SITE MEDIA APIs ============

// Media type
export type MediaType = 'image' | 'video' | 'model_3d';

// Media status
export type MediaStatus = 'pending' | 'approved' | 'rejected';

// Creator info in media
export interface MediaCreator {
    id: string;
    full_name: string;
    email: string;
}

// Media item in site
export interface SiteMedia {
    id: string;
    site_id: string;
    code: string;
    url: string;
    type: MediaType;
    caption: string | null;
    status: MediaStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator: MediaCreator;
}

// GET /api/admin/sites/{siteId}/media - Query params
export interface SiteMediaParams {
    page?: number;
    limit?: number;
    status?: MediaStatus;
    type?: MediaType;
}

// GET /api/admin/sites/{siteId}/media - Response
export interface SiteMediaResponse {
    site: SiteBasicInfo;
    media: SiteMedia[];
    pagination: Pagination;
}

// ============ SITE SCHEDULES APIs ============

// Schedule status (same as Media status but keeping separate for clarity)
export type ScheduleStatus = 'pending' | 'approved' | 'rejected';

// Schedule item in site
export interface SiteSchedule {
    id: string;
    site_id: string;
    code: string;
    days_of_week: number[]; // 0-6 (Sunday-Saturday)
    time: string; // HH:mm:ss
    note: string | null;
    status: ScheduleStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator: MediaCreator; // Same structure as MediaCreator
}

// GET /api/admin/sites/{siteId}/schedules - Query params
export interface SiteSchedulesParams {
    page?: number;
    limit?: number;
    status?: ScheduleStatus;
}

// GET /api/admin/sites/{siteId}/schedules - Response
export interface SiteSchedulesResponse {
    site: SiteBasicInfo;
    schedules: SiteSchedule[];
    pagination: Pagination;
}

// ============ SITE EVENTS APIs ============

// Event status
export type EventStatus = 'pending' | 'approved' | 'rejected';

// Event item in site
export interface SiteEvent {
    id: string;
    site_id: string;
    code: string;
    name: string;
    description: string | null;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    start_time: string; // HH:mm:ss
    end_time: string; // HH:mm:ss
    location: string | null;
    banner_url: string | null;
    status: EventStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator: MediaCreator;
}

// GET /api/admin/sites/{siteId}/events - Query params
export interface SiteEventsParams {
    page?: number;
    limit?: number;
    status?: EventStatus;
}

// GET /api/admin/sites/{siteId}/events - Response
export interface SiteEventsResponse {
    site: SiteBasicInfo;
    events: SiteEvent[];
    pagination: Pagination;
}

// ============ SITE NEARBY PLACES APIs ============

// Nearby place category
export type NearbyPlaceCategory = 'food' | 'lodging' | 'medical';

// Nearby place status
export type NearbyPlaceStatus = 'pending' | 'approved' | 'rejected';

// Proposer info
export interface NearbyPlaceProposer {
    id: string;
    full_name: string;
    email: string;
}

// Nearby place item in site
export interface SiteNearbyPlace {
    id: string;
    site_id: string;
    code: string;
    proposed_by: string;
    name: string;
    category: NearbyPlaceCategory;
    address: string | null;
    latitude: string;
    longitude: string;
    distance_meters: number;
    phone: string | null;
    description: string | null;
    status: NearbyPlaceStatus;
    rejection_reason: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    is_active: boolean;
    created_at: string;
    proposer: NearbyPlaceProposer;
}

// GET /api/admin/sites/{siteId}/nearby-places - Query params
export interface SiteNearbyPlacesParams {
    page?: number;
    limit?: number;
    status?: NearbyPlaceStatus;
    category?: NearbyPlaceCategory;
}

// GET /api/admin/sites/{siteId}/nearby-places - Response
export interface SiteNearbyPlacesResponse {
    site: SiteBasicInfo;
    nearby_places: SiteNearbyPlace[];
    pagination: Pagination;
}
