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
    UpdateLocalGuideStatusResponse
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
}
