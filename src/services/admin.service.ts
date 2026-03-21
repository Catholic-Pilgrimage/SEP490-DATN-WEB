import { API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/auth.types';
import {
    AdminUser,
    UpdateUserData,
    UpdateUserStatusData,
    UserListData,
    UserListParams,
    SiteListData,
    SiteListParams,
    SiteDetail,
    UpdateSiteData,
    VerificationListData,
    VerificationListParams,
    VerificationRequestDetail,
    UpdateVerificationStatusData,
    VerificationUpdateResponse,
    SiteLocalGuidesParams,
    SiteLocalGuidesResponse,
    SiteShiftsParams,
    SiteShiftsResponse,
    SiteMediaParams,
    SiteMediaResponse,
    SiteSchedulesParams,
    SiteSchedulesResponse,
    SiteEventsParams,
    SiteEventsResponse,
    SiteNearbyPlacesParams,
    SiteNearbyPlacesResponse,
    AdminSOSListParams,
    AdminSOSListData,
    AdminSOSStats,
    DashboardOverviewData,
    DashboardOverviewParams,
    UsersGrowthParams,
    UsersGrowthData,
    CheckinsAnalyticsParams,
    CheckinsAnalyticsData,
    PopularSitesParams,
    PopularSiteData,
    SOSBySiteParams,
    SOSBySiteData,
    FinanceOverviewData,
    WalletTransactionParams,
    WalletTransactionListData,
    WithdrawalParams,
    WithdrawalListData,
} from '../types/admin.types';
import { ApiService } from './api.service';

export class AdminService {
    /**
     * Get dashboard overview statistics with time filter
     * @param params - { period, from_date, to_date }
     * period: 'today' | 'week' | 'month' | 'custom'
     * from_date/to_date: Required when period='custom'
     */
    static async getDashboardOverview(
        params: DashboardOverviewParams = {}
    ): Promise<ApiResponse<DashboardOverviewData>> {
        const queryParams = new URLSearchParams();

        if (params.period) {
            queryParams.append('period', params.period);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW;

        return ApiService.get<ApiResponse<DashboardOverviewData>>(endpoint);
    }

    /**
     * Get user growth analytics - new users registered by date
     * @param params - { period, from_date, to_date, days }
     * period: 'today' | 'week' | 'month' | 'custom'
     * days: fallback if no period (default 30)
     */
    static async getUsersGrowth(
        params: UsersGrowthParams = {}
    ): Promise<ApiResponse<UsersGrowthData[]>> {
        const queryParams = new URLSearchParams();

        if (params.period) {
            queryParams.append('period', params.period);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }
        if (params.days) {
            queryParams.append('days', params.days.toString());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_USERS_GROWTH}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_USERS_GROWTH;

        return ApiService.get<ApiResponse<UsersGrowthData[]>>(endpoint);
    }

    /**
     * Get check-ins analytics - check-ins count by date
     * @param params - { period, from_date, to_date, days }
     * period: 'today' | 'week' | 'month' | 'custom'
     * days: fallback if no period (default 30)
     */
    static async getCheckinsAnalytics(
        params: CheckinsAnalyticsParams = {}
    ): Promise<ApiResponse<CheckinsAnalyticsData[]>> {
        const queryParams = new URLSearchParams();

        if (params.period) {
            queryParams.append('period', params.period);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }
        if (params.days) {
            queryParams.append('days', params.days.toString());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_CHECKINS}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_CHECKINS;

        return ApiService.get<ApiResponse<CheckinsAnalyticsData[]>>(endpoint);
    }

    /**
     * Get popular sites analytics - sites with most visits
     * @param params - { period, from_date, to_date, limit }
     * period: 'today' | 'week' | 'month' | 'custom'
     * limit: default 10
     */
    static async getPopularSites(
        params: PopularSitesParams = {}
    ): Promise<ApiResponse<PopularSiteData[]>> {
        const queryParams = new URLSearchParams();

        if (params.period) {
            queryParams.append('period', params.period);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_POPULAR_SITES}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_POPULAR_SITES;

        return ApiService.get<ApiResponse<PopularSiteData[]>>(endpoint);
    }

    /**
     * Get SOS statistics by site - sites with most SOS requests
     * @param params - { period, from_date, to_date, limit }
     * period: 'today' | 'week' | 'month' | 'custom'
     * limit: default 10
     */
    static async getSOSBySite(
        params: SOSBySiteParams = {}
    ): Promise<ApiResponse<SOSBySiteData[]>> {
        const queryParams = new URLSearchParams();

        if (params.period) {
            queryParams.append('period', params.period);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_SOS_BY_SITE}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_SOS_BY_SITE;

        return ApiService.get<ApiResponse<SOSBySiteData[]>>(endpoint);
    }

    /**
     * Get finance overview for admin dashboard
     * GET /api/admin/dashboard/finance
     */
    static async getFinanceOverview(): Promise<ApiResponse<FinanceOverviewData>> {
        return ApiService.get<ApiResponse<FinanceOverviewData>>(
            API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_FINANCE
        );
    }

    /**
     * Get wallet transactions list
     * GET /api/admin/wallet/transactions
     */
    static async getWalletTransactions(params: WalletTransactionParams = {}): Promise<ApiResponse<WalletTransactionListData>> {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        if (params.reference_type) queryParams.append('reference_type', params.reference_type);
        if (params.planner_id) queryParams.append('planner_id', params.planner_id);
        if (params.date_from) queryParams.append('date_from', params.date_from);
        if (params.date_to) queryParams.append('date_to', params.date_to);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.ENDPOINTS.ADMIN.WALLET_TRANSACTIONS}${queryString ? `?${queryString}` : ''}`;
        return ApiService.get<ApiResponse<WalletTransactionListData>>(url);
    }

    /**
     * Get wallet withdrawals list
     * GET /api/admin/wallet/withdrawals
     */
    static async getWalletWithdrawals(params: WithdrawalParams = {}): Promise<ApiResponse<WithdrawalListData>> {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.date_from) queryParams.append('date_from', params.date_from);
        if (params.date_to) queryParams.append('date_to', params.date_to);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.ENDPOINTS.ADMIN.WALLET_WITHDRAWALS}${queryString ? `?${queryString}` : ''}`;
        return ApiService.get<ApiResponse<WithdrawalListData>>(url);
    }

    /**
     * Get list of users with pagination and filters
     */
    static async getUsers(params: UserListParams = {}): Promise<ApiResponse<UserListData>> {
        // Build query string from params
        const queryParams = new URLSearchParams();

        // Only add params if they have valid values
        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.role && params.role.trim() !== '') {
            queryParams.append('role', params.role);
        }
        if (params.status && params.status.trim() !== '') {
            queryParams.append('status', params.status);
        }
        if (params.search && params.search.trim() !== '') {
            queryParams.append('search', params.search.trim());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.USERS;

        return ApiService.get<ApiResponse<UserListData>>(endpoint);
    }

    /**
     * Get user detail by ID
     * @param id - User ID (UUID)
     */
    static async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.USER_DETAIL(id);
        return ApiService.get<ApiResponse<AdminUser>>(endpoint);
    }

    /**
     * Update user information (Admin only)
     * @param id - User ID (UUID)
     * @param data - User data to update
     */
    static async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<AdminUser>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.USER_DETAIL(id);
        return ApiService.put<ApiResponse<AdminUser>>(endpoint, data);
    }

    /**
     * Update user status - Ban/Unban (Admin only)
     * @param id - User ID (UUID)
     * @param data - Status to update { status: 'active' | 'banned' }
     */
    static async updateUserStatus(id: string, data: UpdateUserStatusData): Promise<ApiResponse<AdminUser>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.USER_STATUS(id);
        return ApiService.patch<ApiResponse<AdminUser>>(endpoint, data);
    }

    // ============ SITE METHODS ============

    /**
     * Get list of sites with pagination and filters
     */
    static async getSites(params: SiteListParams = {}): Promise<ApiResponse<SiteListData>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.region) {
            queryParams.append('region', params.region);
        }
        if (params.type) {
            queryParams.append('type', params.type);
        }
        if (params.is_active !== undefined && params.is_active !== '') {
            queryParams.append('is_active', params.is_active.toString());
        }
        if (params.search && params.search.trim() !== '') {
            queryParams.append('search', params.search.trim());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITES}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITES;

        return ApiService.get<ApiResponse<SiteListData>>(endpoint);
    }

    /**
     * Get site detail by ID
     * @param id - Site ID (UUID)
     */
    static async getSiteById(id: string): Promise<ApiResponse<SiteDetail>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.SITE_DETAIL(id);
        return ApiService.get<ApiResponse<SiteDetail>>(endpoint);
    }

    /**
     * Update site information (Admin only)
     * Dùng FormData vì API nhận multipart/form-data để upload ảnh
     * @param id - Site ID (UUID)
     * @param data - Site data to update
     */
    static async updateSite(id: string, data: UpdateSiteData): Promise<ApiResponse<SiteDetail>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.SITE_DETAIL(id);

        // Tạo FormData từ data object
        const formData = new FormData();

        // Thêm các field vào FormData nếu có giá trị
        if (data.name !== undefined) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.history !== undefined) formData.append('history', data.history);
        if (data.address !== undefined) formData.append('address', data.address);
        if (data.province !== undefined) formData.append('province', data.province);
        if (data.district !== undefined) formData.append('district', data.district);
        if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
        if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
        if (data.region !== undefined) formData.append('region', data.region);
        if (data.type !== undefined) formData.append('type', data.type);
        if (data.patron_saint !== undefined) formData.append('patron_saint', data.patron_saint);
        if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());

        // Upload file ảnh nếu có
        if (data.cover_image) formData.append('cover_image', data.cover_image);

        // opening_hours và contact_info gửi dạng JSON string
        if (data.opening_hours) formData.append('opening_hours', JSON.stringify(data.opening_hours));
        if (data.contact_info) formData.append('contact_info', JSON.stringify(data.contact_info));

        return ApiService.putFormData<ApiResponse<SiteDetail>>(endpoint, formData);
    }

    /**
     * Delete site - Soft Delete (Admin only)
     * @param id - Site ID (UUID)
     */
    static async deleteSite(id: string): Promise<ApiResponse<{ id: string; code: string; name: string; is_active: boolean }>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.SITE_DETAIL(id);
        return ApiService.delete<ApiResponse<{ id: string; code: string; name: string; is_active: boolean }>>(endpoint);
    }

    /**
     * Restore deleted site (Admin only)
     * @param id - Site ID (UUID)
     */
    static async restoreSite(id: string): Promise<ApiResponse<{ id: string; code: string; name: string; is_active: boolean }>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.SITE_RESTORE(id);
        return ApiService.patch<ApiResponse<{ id: string; code: string; name: string; is_active: boolean }>>(endpoint);
    }

    // ============ VERIFICATION REQUEST METHODS ============

    /**
     * Get list of verification requests with pagination and filters
     */
    static async getVerificationRequests(params: VerificationListParams = {}): Promise<ApiResponse<VerificationListData>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }
        if (params.search && params.search.trim() !== '') {
            queryParams.append('search', params.search.trim());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.VERIFICATION_REQUESTS}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.VERIFICATION_REQUESTS;

        return ApiService.get<ApiResponse<VerificationListData>>(endpoint);
    }

    /**
     * Get verification request detail by ID
     * @param id - Verification Request ID (UUID)
     */
    static async getVerificationRequestById(id: string): Promise<ApiResponse<VerificationRequestDetail>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.VERIFICATION_REQUEST_DETAIL(id);
        return ApiService.get<ApiResponse<VerificationRequestDetail>>(endpoint);
    }

    /**
     * Update verification request status (Approve/Reject)
     * @param id - Verification Request ID (UUID)
     * @param data - Status update data
     */
    static async updateVerificationStatus(
        id: string,
        data: UpdateVerificationStatusData
    ): Promise<ApiResponse<VerificationUpdateResponse>> {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN.VERIFICATION_REQUEST_DETAIL(id);
        return ApiService.patch<ApiResponse<VerificationUpdateResponse>>(endpoint, data);
    }

    // ============ SITE CONTENT APIs ============

    /**
     * Get list of local guides for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit }
     */
    static async getSiteLocalGuides(
        siteId: string,
        params: SiteLocalGuidesParams = {}
    ): Promise<ApiResponse<SiteLocalGuidesResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_LOCAL_GUIDES(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_LOCAL_GUIDES(siteId);

        return ApiService.get<ApiResponse<SiteLocalGuidesResponse>>(endpoint);
    }

    /**
     * Get list of shift submissions for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit, status }
     */
    static async getSiteShifts(
        siteId: string,
        params: SiteShiftsParams = {}
    ): Promise<ApiResponse<SiteShiftsResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status === 'pending' || params.status === 'approved' || params.status === 'rejected') {
            queryParams.append('status', params.status);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_SHIFTS(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_SHIFTS(siteId);

        return ApiService.get<ApiResponse<SiteShiftsResponse>>(endpoint);
    }

    /**
     * Get list of media for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit, status, type }
     */
    static async getSiteMedia(
        siteId: string,
        params: SiteMediaParams = {}
    ): Promise<ApiResponse<SiteMediaResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }
        if (params.type) {
            queryParams.append('type', params.type);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_MEDIA(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_MEDIA(siteId);

        return ApiService.get<ApiResponse<SiteMediaResponse>>(endpoint);
    }

    /**
     * Get list of mass schedules for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit, status }
     */
    static async getSiteSchedules(
        siteId: string,
        params: SiteSchedulesParams = {}
    ): Promise<ApiResponse<SiteSchedulesResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_SCHEDULES(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_SCHEDULES(siteId);

        return ApiService.get<ApiResponse<SiteSchedulesResponse>>(endpoint);
    }

    /**
     * Get list of events for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit, status }
     */
    static async getSiteEvents(
        siteId: string,
        params: SiteEventsParams = {}
    ): Promise<ApiResponse<SiteEventsResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_EVENTS(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_EVENTS(siteId);

        return ApiService.get<ApiResponse<SiteEventsResponse>>(endpoint);
    }

    /**
     * Get list of nearby places for a specific site
     * @param siteId - Site ID (UUID)
     * @param params - { page, limit, status, category }
     */
    static async getSiteNearbyPlaces(
        siteId: string,
        params: SiteNearbyPlacesParams = {}
    ): Promise<ApiResponse<SiteNearbyPlacesResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }
        if (params.category) {
            queryParams.append('category', params.category);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SITE_NEARBY_PLACES(siteId)}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SITE_NEARBY_PLACES(siteId);

        return ApiService.get<ApiResponse<SiteNearbyPlacesResponse>>(endpoint);
    }

    // ============ SOS APIs ============

    /**
     * Get list of SOS requests for admin
     * @param params - { page, limit, status, site_id, from_date, to_date }
     */
    static async getSOSRequests(params: AdminSOSListParams = {}): Promise<ApiResponse<AdminSOSListData>> {
        const queryParams = new URLSearchParams();

        if (params.page && params.page > 0) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit && params.limit > 0) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }
        if (params.site_id) {
            queryParams.append('site_id', params.site_id);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SOS_LIST}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SOS_LIST;

        return ApiService.get<ApiResponse<AdminSOSListData>>(endpoint);
    }

    /**
     * Get SOS statistics for admin
     * @param params - { site_id, from_date, to_date }
     */
    static async getSOSStats(params: { site_id?: string; from_date?: string; to_date?: string } = {}): Promise<ApiResponse<AdminSOSStats>> {
        const queryParams = new URLSearchParams();

        if (params.site_id) {
            queryParams.append('site_id', params.site_id);
        }
        if (params.from_date) {
            queryParams.append('from_date', params.from_date);
        }
        if (params.to_date) {
            queryParams.append('to_date', params.to_date);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.ADMIN.SOS_STATS}?${queryString}`
            : API_CONFIG.ENDPOINTS.ADMIN.SOS_STATS;

        return ApiService.get<ApiResponse<AdminSOSStats>>(endpoint);
    }
}
