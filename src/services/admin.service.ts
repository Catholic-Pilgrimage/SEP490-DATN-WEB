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
    VerificationUpdateResponse
} from '../types/admin.types';
import { ApiService } from './api.service';

export class AdminService {
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
}
