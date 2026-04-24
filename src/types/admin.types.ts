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
    latitude: string | null;
    longitude: string | null;
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

// Manager info in site detail
export interface SiteManager {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
}

// GET /api/admin/sites/{id} - Site Detail Response
export interface SiteDetail extends AdminSite {
    history: string | null;
    opening_hours: SiteOpeningHours | null;
    contact_info: SiteContactInfo | null;
    created_by: SiteCreatedBy | null;
    manager: SiteManager | null;
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

// POST /api/admin/sites - Request Body (Create new site)
export interface CreateSiteData {
    name: string;  // Required: 2-255 characters
    province: string;  // Required
    region: SiteRegion;  // Required: 'Bac' | 'Trung' | 'Nam'
    type: SiteType;  // Required: 'church' | 'shrine' | 'monastery' | 'center' | 'other'
    description?: string;
    history?: string;
    address?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    patron_saint?: string;
    cover_image?: File;
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
    site_cover_image: string | null;
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
    audio_url: string | null;
    narration_text: string | null;
    narrative_status: string | null;
    narrative_rejection_reason: string | null;
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
export type EventTimeState = 'upcoming' | 'ongoing' | 'ended';

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
    category: string; // 'solemn_feast' | 'sacrament_mass' | 'retreat' | ...
    time_state: EventTimeState; // 'upcoming' | 'ongoing' | 'ended'
    status: EventStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
    creator: MediaCreator;
}

// GET /api/admin/sites/{siteId}/events - Query params
export interface SiteEventsParams {
    page?: number;
    limit?: number;
    status?: EventStatus;
    time_state?: EventTimeState;
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

// ============ SOS APIs ============

export type SOSStatus = 'pending' | 'accepted' | 'resolved' | 'cancelled';

export interface SOSPilgrim {
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url?: string | null;
}

export interface SOSGuide {
    id: string;
    full_name: string;
    phone?: string | null;
    avatar_url?: string | null;
}

export interface AdminSOSRequest {
    id: string;
    code: string;
    user_id: string;
    site_id: string;
    latitude: string | number;
    longitude: string | number;
    message: string;
    contact_phone: string;
    status: SOSStatus;
    assigned_to: string | null;
    assigned_at: string | null;
    notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    site: {
        id: string;
        name: string;
        address?: string;
        province: string;
    };
    pilgrim: SOSPilgrim;
    assignedGuide: SOSGuide | null;
}

export interface AdminSOSListParams {
    page?: number;
    limit?: number;
    status?: SOSStatus | '';
    site_id?: string;
    from_date?: string;
    to_date?: string;
}

export interface AdminSOSListData {
    sosRequests: AdminSOSRequest[];
    pagination: Pagination;
}

// GET /api/sos/admin/stats - Response Data
export interface AdminSOSSiteStat {
    site_id: string;
    site_name: string;
    count: number;
}

export interface AdminSOSStats {
    total: number;
    pending: number;
    accepted: number;
    resolved: number;
    cancelled: number;
    by_site: AdminSOSSiteStat[];
    average_resolution_minutes: number;
}

// ============ DASHBOARD APIs ============

export type DashboardPeriod = 'today' | 'week' | 'month' | 'custom';

/** Admin dashboard filter: `all` = không gửi `period` (thống kê toàn thời gian, theo API). */
export type AdminDashboardPeriod = DashboardPeriod | 'all';

export interface DashboardFilterApplied {
    period: DashboardPeriod | 'all';
    from_date: string | null;
    to_date: string | null;
}

export interface DashboardUsersStats {
    total: number;
    by_role: {
        pilgrim: number;
        local_guide: number;
        manager: number;
        admin: number;
    };
    new_this_month: number;
    banned: number;
}

export interface DashboardSitesStats {
    total: number;
    active: number;
    inactive: number;
    by_region: {
        Bac: number;
        Trung: number;
        Nam: number;
    };
    by_type: {
        church: number;
        shrine: number;
        monastery: number;
        center: number;
        other: number;
    };
}

export interface DashboardPlannersStats {
    total: number;
    planning: number;
    ongoing: number;
    completed: number;
}

export interface DashboardCheckinsStats {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
}

export interface DashboardJournalsStats {
    total: number;
    public: number;
    private: number;
    this_month: number;
}

export interface DashboardPostsStats {
    total: number;
    this_month: number;
    total_likes: number;
    total_comments: number;
}

export interface DashboardSOSStats {
    total: number;
    by_status: {
        pending: number;
        accepted: number;
        resolved: number;
        cancelled: number;
    };
    by_region: {
        Bac: number;
        Trung: number;
        Nam: number;
        unknown: number;
    };
    avg_resolution_minutes: number;
}

export interface DashboardReportsStats {
    total: number;
    by_status: {
        pending: number;
        resolved: number;
        dismissed?: number;
        reject?: number;
    };
    by_reason: {
        spam: number;
        inappropriate: number;
        harassment: number;
        other: number;
    };
}

export interface DashboardContentPending {
    verification_requests: number;
    media: number;
    schedules: number;
    events: number;
    nearby_places: number;
    shifts: number;
}

export interface DashboardOverviewData {
    filter_applied: DashboardFilterApplied;
    users: DashboardUsersStats;
    sites: DashboardSitesStats;
    planners: DashboardPlannersStats;
    checkins: DashboardCheckinsStats;
    journals: DashboardJournalsStats;
    posts: DashboardPostsStats;
    sos: DashboardSOSStats;
    reports: DashboardReportsStats;
    content_pending_review: DashboardContentPending;
}

export interface DashboardOverviewParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
}

// ============ ANALYTICS API TYPES ============

// GET /api/admin/dashboard/analytics/users-growth - Query Parameters
export interface UsersGrowthParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
    days?: number;
}

// GET /api/admin/dashboard/analytics/users-growth - Response Data
export interface UsersGrowthData {
    date: string;
    count: number;
}

// GET /api/admin/dashboard/analytics/checkins - Query Parameters
export interface CheckinsAnalyticsParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
    days?: number;
}

// GET /api/admin/dashboard/analytics/checkins - Response Data
export interface CheckinsAnalyticsData {
    date: string;
    count: number;
}

// ============ ANALYTICS POPULAR SITES TYPES ============

// GET /api/admin/dashboard/analytics/popular-sites - Query Parameters
export interface PopularSitesParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
    limit?: number;
}

// GET /api/admin/dashboard/analytics/popular-sites - Site Info
export interface PopularSiteInfo {
    id: string;
    code: string;
    name: string;
    region: SiteRegion;
    type: SiteType;
    cover_image: string | null;
}

// GET /api/admin/dashboard/analytics/popular-sites - Response Data
export interface PopularSiteData {
    site: PopularSiteInfo;
    visit_count: number;
}

// ============ ANALYTICS SOS BY SITE TYPES ============

// GET /api/admin/dashboard/analytics/sos-by-site - Query Parameters
export interface SOSBySiteParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
    limit?: number;
}

// GET /api/admin/dashboard/analytics/sos-by-site - Response Data
export interface SOSBySiteData {
    site: PopularSiteInfo;
    sos_count: number;
    resolved_count: number;
    pending_count: number;
}

// GET /api/admin/dashboard/analytics/checkins - Query Parameters
export interface CheckinsAnalyticsParams {
    period?: DashboardPeriod;
    from_date?: string;
    to_date?: string;
    days?: number;
}

// GET /api/admin/dashboard/analytics/checkins - Response Data
export interface CheckinsAnalyticsData {
    date: string;
    count: number;
}

// ============ FINANCE TYPES ============

// GET /api/admin/dashboard/finance - Response Data
export interface FinanceOverviewData {
    total_escrow_locked: number;
    total_pending_payouts: number;
    total_withdrawn_today: number;
    total_transactions_today: number;
    failed_payouts_today: number;
    total_wallet_balance: number;
    total_withdraw_failed: number;
    active_escrow_planners: number;
}

// ============ WALLET TRANSACTION TYPES ============

export type TransactionType = 'escrow_lock' | 'escrow_refund' | 'withdraw' | 'penalty_applied' | 'penalty_received' | 'penalty_refunded' | 'deposit' | 'topup';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';
export type TransactionReferenceType = 'planner_deposit' | 'planner' | 'planner_penalty' | 'payos_payout' | 'payos_topup' | 'wallet';

export interface WalletTransactionUser {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

export interface WalletInfo {
    id: string;
    user_id: string;
    balance: string;
    locked_balance: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: WalletTransactionUser;
}

export interface WalletTransaction {
    id: string;
    wallet_id: string;
    amount: string;
    type: TransactionType;
    status: TransactionStatus;
    reference_type: TransactionReferenceType;
    reference_id: string;
    description: string;
    bank_info: BankInfo | null;
    code: string;
    created_at: string;
    updated_at: string;
    wallet: WalletInfo;
}

// GET /api/admin/wallet/transactions - Query Parameters
export interface WalletTransactionParams {
    type?: TransactionType | '';
    status?: TransactionStatus | '';
    reference_type?: TransactionReferenceType | '';
    planner_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// GET /api/admin/wallet/transactions - Response Data
export interface WalletTransactionListData {
    transactions: WalletTransaction[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// ============ WITHDRAWAL TYPES ============

export interface BankInfo {
    account_number: string;
    account_name: string;
    bank_code: string;
}

export interface BankInfo {
  bin: string;
  name: string;
  short_name: string;
  code: string;
  logo: string;
}

export interface Withdrawal {
    id: string;
    amount: string;
    status: TransactionStatus;
    reference_id: string;
    description: string;
    bank_info: BankInfo | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
    user: WalletTransactionUser;
}

// GET /api/admin/wallet/withdrawals - Query Parameters
export interface WithdrawalParams {
    status?: TransactionStatus | '';
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

// GET /api/admin/wallet/withdrawals - Response Data
export interface WithdrawalListData {
    withdrawals: Withdrawal[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// ============ WALLET ESCROW TYPES ============

export interface WalletEscrowPlannerOwner {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
}

export interface WalletEscrowPlannerItem {
    planner_id: string;
    planner_name: string;
    status: string;
    start_date: string;
    end_date: string;
    owner: WalletEscrowPlannerOwner;
    deposit_amount: string | number;
    member_count: number;
    total_locked: number;
    net_locked: number;
    penalty_pending: number;
}

// GET /api/admin/wallet/escrow - Query Parameters
export interface WalletEscrowParams {
    page?: number;
    limit?: number;
}

// GET /api/admin/wallet/escrow - Response Data
export interface WalletEscrowListData {
    escrow: WalletEscrowPlannerItem[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// ============ REPORT TYPES ============

/** Trạng thái trên từng báo cáo (có thể có dismissed từ dữ liệu cũ) */
export type ReportStatus = 'pending' | 'resolved' | 'dismissed' | 'reject' | 'cancelled';
/** GET /api/reports — query `status` (theo BE) */
export type ReportQueryStatus = 'pending' | 'resolved' | 'reject' | 'cancelled';
export type ReportTargetType =
    | 'post'
    | 'comment'
    | 'journal'
    | 'site_review'
    | 'nearby_place_review';
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';

export interface Reporter {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

export interface Resolver {
    id: string;
    full_name: string;
    email: string;
}

export interface Report {
    id: string;
    code?: string;
    reporter_id: string;
    target_type: ReportTargetType;
    target_id: string;
    reason: ReportReason | string;
    description: string | null;
    status: ReportStatus;
    admin_note?: string | null;
    resolved_by: string | null;
    created_at: string;
    updated_at: string;
    reporter: Reporter;
    resolver: Resolver | null;
}

/** Nội dung đánh giá site khi target_type = site_review (GET /api/reports/:id) */
export interface ReportSiteReviewTargetContent {
    id: string;
    site_id: string;
    user_id: string;
    checkin_id: string | null;
    rating: number;
    feedback: string;
    image_urls: string[];
    verified_visit: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    reviewer: Reporter;
}

/** Tác giả nội dung bị báo cáo */
export interface ReportContentAuthor {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

/** Nội dung bài viết khi target_type = post (GET /api/reports/:id) */
export interface ReportPostTargetContent {
    id: string;
    user_id: string;
    content: string;
    title: string | null;
    image_urls: string[];
    audio_url: string | null;
    video_url: string | null;
    likes_count: number;
    status: string;
    created_at: string;
    updated_at: string;
    journal_id: string | null;
    site_id: string | null;
    planner_id: string | null;
    is_active: boolean;
    author: ReportContentAuthor;
}

/** Nội dung bình luận khi target_type = comment (GET /api/reports/:id) */
export interface ReportCommentTargetContent {
    id: string;
    user_id: string;
    post_id: string;
    content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: ReportContentAuthor;
}

/** Nội dung nhật ký khi target_type = journal (GET /api/reports/:id) */
export interface ReportJournalTargetContent {
    id: string;
    user_id: string;
    title: string | null;
    content: string;
    image_urls: string[];
    audio_url: string | null;
    video_url: string | null;
    visibility: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: ReportContentAuthor;
}

/** Nội dung đánh giá điểm lân cận khi target_type = nearby_place_review (GET /api/reports/:id) */
export interface ReportNearbyPlaceReviewTargetContent {
    id: string;
    nearby_place_id: string;
    user_id: string;
    rating: number;
    comment: string;
    image_urls: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    reviewer: Reporter;
}

/** Union type cho tất cả target_content */
export type ReportTargetContent =
    | ReportSiteReviewTargetContent
    | ReportPostTargetContent
    | ReportCommentTargetContent
    | ReportJournalTargetContent
    | ReportNearbyPlaceReviewTargetContent
    | Record<string, unknown>
    | null;

/** GET /api/reports/:id — data */
export interface ReportDetail {
    id: string;
    code: string;
    reporter_id: string;
    target_type: string;
    target_id: string;
    reason: string;
    description: string | null;
    status: string;
    admin_note: string | null;
    resolved_by: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    reporter: Reporter;
    resolver: Resolver | null;
    target_content: ReportTargetContent;
}

export function isReportSiteReviewTarget(
    content: ReportTargetContent | undefined
): content is ReportSiteReviewTargetContent {
    return (
        !!content &&
        typeof content === 'object' &&
        'rating' in content &&
        'feedback' in content &&
        'reviewer' in content
    );
}

export function isReportPostTarget(
    content: ReportTargetContent | undefined
): content is ReportPostTargetContent {
    return (
        !!content &&
        typeof content === 'object' &&
        'content' in content &&
        'likes_count' in content &&
        'author' in content
    );
}

export function isReportCommentTarget(
    content: ReportTargetContent | undefined
): content is ReportCommentTargetContent {
    return (
        !!content &&
        typeof content === 'object' &&
        'post_id' in content &&
        'content' in content &&
        'author' in content
    );
}

export function isReportJournalTarget(
    content: ReportTargetContent | undefined
): content is ReportJournalTargetContent {
    return (
        !!content &&
        typeof content === 'object' &&
        'visibility' in content &&
        'content' in content &&
        'author' in content
    );
}

export function isReportNearbyPlaceReviewTarget(
    content: ReportTargetContent | undefined
): content is ReportNearbyPlaceReviewTargetContent {
    return (
        !!content &&
        typeof content === 'object' &&
        'nearby_place_id' in content &&
        'rating' in content &&
        'comment' in content &&
        'reviewer' in content
    );
}

// GET /api/reports - Query Parameters
export interface ReportParams {
    status?: ReportQueryStatus | '';
    target_type?: ReportTargetType | '';
    page?: number;
    limit?: number;
}

// GET /api/reports - Response Data
export interface ReportListData {
    reports: Report[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        limit: number;
    };
}

// PATCH /api/reports/:id/resolve - Request Body
export interface ResolveReportBody {
    action: 'resolved' | 'reject';
    note?: string;
    penalty?: unknown;
}

// ============ AI PROMPTS TYPES ============

export type AIPromptKey = 
    | 'route' 
    | 'article' 
    | 'review_summary' 
    | 'events' 
    | 'prayer' 
    | 'translation_post_vi_en' 
    | 'translation_comment_vi_en';

export interface AIPrompt {
    prompt_key: AIPromptKey;
    description: string;
    instruction_text: string;
    version: number;
    source: 'db' | 'default';
    updated_at: string;
}

// GET /api/admin/ai-prompts - Response Data
export type AIPromptsListData = AIPrompt[];

// GET /api/admin/ai-prompts/{key} - Response Data
export interface AIPromptDetailData {
    prompt: AIPrompt;
}

// PUT /api/admin/ai-prompts/{key} - Request Body
export interface UpdateAIPromptData {
    instruction_text: string;
    description?: string;
}
