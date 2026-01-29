import { API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/auth.types';
import {
    ManagerSite,
    CreateManagerSiteData,
    UpdateManagerSiteData,
    LocalGuideListParams,
    LocalGuideListResponse,
    CreateLocalGuideData,
    CreateLocalGuideResponse,
    UpdateLocalGuideStatusData,
    UpdateLocalGuideStatusResponse,
    ShiftSubmissionListParams,
    ShiftSubmissionListResponse,
    ShiftSubmissionDetail,
    UpdateShiftSubmissionStatusData,
    UpdateShiftSubmissionStatusResponse,
    MediaListParams,
    MediaListResponse,
    UpdateMediaStatusData,
    UpdateMediaStatusResponse,
    ToggleMediaActiveData,
    ToggleMediaActiveResponse,
    ScheduleListParams,
    ScheduleListResponse,
    UpdateScheduleStatusData,
    UpdateScheduleStatusResponse,
    ToggleScheduleActiveData,
    ToggleScheduleActiveResponse,
    EventListParams,
    EventListResponse,
    UpdateEventStatusData,
    UpdateEventStatusResponse,
    ToggleEventActiveData,
    ToggleEventActiveResponse
} from '../types/manager.types';
import { ApiService } from './api.service';

/**
 * Manager Service - APIs for Manager role
 */
export class ManagerService {
    // ============ SITE METHODS ============

    /**
     * Get manager's site
     * Manager can only have 1 site
     */
    static async getMySite(): Promise<ApiResponse<ManagerSite>> {
        return ApiService.get<ApiResponse<ManagerSite>>(API_CONFIG.ENDPOINTS.MANAGER.SITES);
    }

    /**
     * Create new site (Manager only - max 1 site)
     * Uses FormData for file upload
     */
    static async createSite(data: CreateManagerSiteData): Promise<ApiResponse<ManagerSite>> {
        const formData = new FormData();

        // Required fields
        formData.append('name', data.name);
        formData.append('address', data.address);
        formData.append('province', data.province);
        formData.append('latitude', data.latitude.toString());
        formData.append('longitude', data.longitude.toString());
        formData.append('region', data.region);
        formData.append('type', data.type);

        // Optional fields
        if (data.description) {
            formData.append('description', data.description);
        }
        if (data.history) {
            formData.append('history', data.history);
        }
        if (data.district) {
            formData.append('district', data.district);
        }
        if (data.patron_saint) {
            formData.append('patron_saint', data.patron_saint);
        }
        if (data.cover_image) {
            formData.append('cover_image', data.cover_image);
        }
        if (data.opening_hours) {
            formData.append('opening_hours', JSON.stringify(data.opening_hours));
        }
        if (data.contact_info) {
            formData.append('contact_info', JSON.stringify(data.contact_info));
        }

        return ApiService.postFormData<ApiResponse<ManagerSite>>(
            API_CONFIG.ENDPOINTS.MANAGER.SITES,
            formData
        );
    }

    /**
     * Update manager's site
     * Uses FormData for file upload
     */
    static async updateSite(data: UpdateManagerSiteData): Promise<ApiResponse<ManagerSite>> {
        const formData = new FormData();

        // Only append fields that are provided
        if (data.name !== undefined) {
            formData.append('name', data.name);
        }
        if (data.description !== undefined) {
            formData.append('description', data.description);
        }
        if (data.history !== undefined) {
            formData.append('history', data.history);
        }
        if (data.address !== undefined) {
            formData.append('address', data.address);
        }
        if (data.province !== undefined) {
            formData.append('province', data.province);
        }
        if (data.district !== undefined) {
            formData.append('district', data.district);
        }
        if (data.latitude !== undefined) {
            formData.append('latitude', data.latitude.toString());
        }
        if (data.longitude !== undefined) {
            formData.append('longitude', data.longitude.toString());
        }
        if (data.region !== undefined) {
            formData.append('region', data.region);
        }
        if (data.type !== undefined) {
            formData.append('type', data.type);
        }
        if (data.patron_saint !== undefined) {
            formData.append('patron_saint', data.patron_saint);
        }
        if (data.cover_image !== undefined) {
            if (data.cover_image) {
                formData.append('cover_image', data.cover_image);
            }
        }
        if (data.opening_hours !== undefined) {
            formData.append('opening_hours', JSON.stringify(data.opening_hours));
        }
        if (data.contact_info !== undefined) {
            formData.append('contact_info', JSON.stringify(data.contact_info));
        }

        return ApiService.putFormData<ApiResponse<ManagerSite>>(
            API_CONFIG.ENDPOINTS.MANAGER.SITES,
            formData
        );
    }

    // ============ LOCAL GUIDE METHODS ============

    /**
     * Get list of local guides for manager's site
     * With filter and pagination
     */
    static async getLocalGuides(params?: LocalGuideListParams): Promise<ApiResponse<LocalGuideListResponse>> {
        const queryParams = new URLSearchParams();

        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }
        if (params?.search) {
            queryParams.append('search', params.search);
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_CONFIG.ENDPOINTS.MANAGER.LOCAL_GUIDES}?${queryString}`
            : API_CONFIG.ENDPOINTS.MANAGER.LOCAL_GUIDES;

        return ApiService.get<ApiResponse<LocalGuideListResponse>>(url);
    }

    /**
     * Create new Local Guide for manager's site
     * Password sẽ được auto-generate và gửi qua email
     * 
     * Giải thích:
     * - Gọi API POST với body là JSON (không phải FormData vì không có file upload)
     * - ApiService.post() sẽ tự động thêm Content-Type: application/json
     */
    static async createLocalGuide(data: CreateLocalGuideData): Promise<ApiResponse<CreateLocalGuideResponse>> {
        return ApiService.post<ApiResponse<CreateLocalGuideResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.LOCAL_GUIDES,
            data  // { email, full_name, phone }
        );
    }

    /**
     * Update Local Guide status (ban/unban)
     * 
     * Giải thích:
     * - PATCH request: cập nhật 1 phần dữ liệu (chỉ status)
     * - Endpoint có {id} nên dùng hàm từ config: LOCAL_GUIDE_STATUS(id)
     * - Body chỉ cần { status: 'active' | 'banned' }
     * 
     * @param id - ID của Local Guide cần cập nhật
     * @param data - Object chứa status mới { status: 'active' | 'banned' }
     */
    static async updateLocalGuideStatus(
        id: string,
        data: UpdateLocalGuideStatusData
    ): Promise<ApiResponse<UpdateLocalGuideStatusResponse>> {
        return ApiService.patch<ApiResponse<UpdateLocalGuideStatusResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.LOCAL_GUIDE_STATUS(id),
            data  // { status: 'active' hoặc 'banned' }
        );
    }

    // ============ SHIFT SUBMISSION METHODS ============

    /**
     * Get list of shift submissions for manager's site
     * 
     * Giải thích:
     * - Lấy danh sách đăng ký lịch làm việc của các Local Guide
     * - Có thể filter theo: guide_id, status, week_start_date
     * - Có pagination: page, limit
     * 
     * @param params - Các tham số filter và pagination
     */
    static async getShiftSubmissions(
        params?: ShiftSubmissionListParams
    ): Promise<ApiResponse<ShiftSubmissionListResponse>> {
        // Tạo query string từ các tham số
        const queryParams = new URLSearchParams();

        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.guide_id) {
            queryParams.append('guide_id', params.guide_id);
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }
        if (params?.week_start_date) {
            queryParams.append('week_start_date', params.week_start_date);
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_CONFIG.ENDPOINTS.MANAGER.SHIFT_SUBMISSIONS}?${queryString}`
            : API_CONFIG.ENDPOINTS.MANAGER.SHIFT_SUBMISSIONS;

        return ApiService.get<ApiResponse<ShiftSubmissionListResponse>>(url);
    }

    /**
     * Get shift submission detail by ID
     * 
     * Giải thích:
     * - Lấy chi tiết 1 submission theo ID
     * - Nếu submission_type = 'change', response sẽ có field `changes` 
     *   chứa danh sách các thay đổi so với lịch cũ (diff)
     * 
     * @param id - ID của submission cần xem
     */
    static async getShiftSubmissionDetail(
        id: string
    ): Promise<ApiResponse<ShiftSubmissionDetail>> {
        return ApiService.get<ApiResponse<ShiftSubmissionDetail>>(
            API_CONFIG.ENDPOINTS.MANAGER.SHIFT_SUBMISSION_DETAIL(id)
        );
    }

    /**
     * Update shift submission status (approve/reject)
     * 
     * Giải thích:
     * - Duyệt hoặc từ chối submission lịch làm việc
     * - Khi reject, bắt buộc phải có rejection_reason
     * - Khi approved, lịch cũ (nếu có) sẽ bị deactivate
     * 
     * @param id - ID của submission
     * @param data - { status: 'approved' | 'rejected', rejection_reason?: string }
     */
    static async updateShiftSubmissionStatus(
        id: string,
        data: UpdateShiftSubmissionStatusData
    ): Promise<ApiResponse<UpdateShiftSubmissionStatusResponse>> {
        return ApiService.patch<ApiResponse<UpdateShiftSubmissionStatusResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.SHIFT_SUBMISSION_STATUS(id),
            data
        );
    }

    // ========================================================================
    // CONTENT MANAGEMENT - MEDIA
    // ========================================================================

    /**
     * Get list of media for the manager's site
     * 
     * Giải thích:
     * - Lấy danh sách media (hình ảnh, video, panorama) của site
     * - Hỗ trợ filter theo: type, status, is_active
     * - Có pagination
     * 
     * @param params - { page, limit, type, status, is_active }
     */
    static async getMediaList(
        params?: MediaListParams
    ): Promise<ApiResponse<MediaListResponse>> {
        const queryParams = new URLSearchParams();

        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.type) {
            queryParams.append('type', params.type);
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }
        if (params?.is_active !== undefined) {
            queryParams.append('is_active', params.is_active.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_CONFIG.ENDPOINTS.MANAGER.CONTENT.MEDIA}?${queryString}`
            : API_CONFIG.ENDPOINTS.MANAGER.CONTENT.MEDIA;

        return ApiService.get<ApiResponse<MediaListResponse>>(url);
    }

    /**
     * Update media status (approve or reject)
     * 
     * Giải thích:
     * - Manager duyệt hoặc từ chối media
     * - Nếu reject, phải có rejection_reason
     * 
     * @param id - ID của media
     * @param data - { status: 'approved' | 'rejected', rejection_reason? }
     */
    static async updateMediaStatus(
        id: string,
        data: UpdateMediaStatusData
    ): Promise<ApiResponse<UpdateMediaStatusResponse>> {
        return ApiService.patch<ApiResponse<UpdateMediaStatusResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.MEDIA_STATUS(id),
            data
        );
    }

    /**
     * Toggle media active status (soft delete/restore)
     * 
     * Giải thích:
     * - is_active = false: Ẩn media (soft delete)
     * - is_active = true: Khôi phục media
     * 
     * @param id - ID của media
     * @param data - { is_active: boolean }
     */
    static async toggleMediaActive(
        id: string,
        data: ToggleMediaActiveData
    ): Promise<ApiResponse<ToggleMediaActiveResponse>> {
        return ApiService.patch<ApiResponse<ToggleMediaActiveResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.MEDIA_ACTIVE(id),
            data
        );
    }

    // =====================================================================
    // SCHEDULE MANAGEMENT
    // =====================================================================

    /**
     * Get schedule list
     * 
     * @param params - { page, limit, status, day_of_week, is_active }
     */
    static async getScheduleList(
        params: ScheduleListParams = {}
    ): Promise<ApiResponse<ScheduleListResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.day_of_week !== undefined) {
            queryParams.append('day_of_week', params.day_of_week.toString());
        }
        if (params.is_active !== undefined) {
            queryParams.append('is_active', params.is_active.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_CONFIG.ENDPOINTS.MANAGER.CONTENT.SCHEDULES}?${queryString}`
            : API_CONFIG.ENDPOINTS.MANAGER.CONTENT.SCHEDULES;

        return ApiService.get<ApiResponse<ScheduleListResponse>>(url);
    }

    /**
     * Update schedule status (approve or reject)
     * 
     * @param id - Schedule ID
     * @param data - { status: 'approved' | 'rejected', rejection_reason? }
     */
    static async updateScheduleStatus(
        id: string,
        data: UpdateScheduleStatusData
    ): Promise<ApiResponse<UpdateScheduleStatusResponse>> {
        return ApiService.patch<ApiResponse<UpdateScheduleStatusResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.SCHEDULES_STATUS(id),
            data
        );
    }

    /**
     * Toggle schedule active status (soft delete/restore)
     * 
     * @param id - Schedule ID
     * @param data - { is_active: boolean }
     */
    static async toggleScheduleActive(
        id: string,
        data: ToggleScheduleActiveData
    ): Promise<ApiResponse<ToggleScheduleActiveResponse>> {
        return ApiService.patch<ApiResponse<ToggleScheduleActiveResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.SCHEDULES_ACTIVE(id),
            data
        );
    }

    // =====================================================================
    // EVENT MANAGEMENT
    // =====================================================================

    /**
     * Get event list
     * 
     * @param params - { page, limit, status, is_active }
     */
    static async getEventList(
        params: EventListParams = {}
    ): Promise<ApiResponse<EventListResponse>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.is_active !== undefined) {
            queryParams.append('is_active', params.is_active.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_CONFIG.ENDPOINTS.MANAGER.CONTENT.EVENTS}?${queryString}`
            : API_CONFIG.ENDPOINTS.MANAGER.CONTENT.EVENTS;

        return ApiService.get<ApiResponse<EventListResponse>>(url);
    }

    /**
     * Update event status (approve or reject)
     * 
     * @param id - Event ID
     * @param data - { status: 'approved' | 'rejected', rejection_reason? }
     */
    static async updateEventStatus(
        id: string,
        data: UpdateEventStatusData
    ): Promise<ApiResponse<UpdateEventStatusResponse>> {
        return ApiService.patch<ApiResponse<UpdateEventStatusResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.EVENTS_STATUS(id),
            data
        );
    }

    /**
     * Toggle event active status (soft delete/restore)
     * 
     * @param id - Event ID
     * @param data - { is_active: boolean }
     */
    static async toggleEventActive(
        id: string,
        data: ToggleEventActiveData
    ): Promise<ApiResponse<ToggleEventActiveResponse>> {
        return ApiService.patch<ApiResponse<ToggleEventActiveResponse>>(
            API_CONFIG.ENDPOINTS.MANAGER.CONTENT.EVENTS_ACTIVE(id),
            data
        );
    }
}
