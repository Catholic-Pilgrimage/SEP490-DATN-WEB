import { API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/auth.types';
import { AdminUser, UserListData, UserListParams } from '../types/admin.types';
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
}
