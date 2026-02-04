import { API_CONFIG } from '../config/api';
import { Notification, NotificationListResponse, NotificationQueryParams } from '../types/notification.types';
import { ApiResponse } from '../types/auth.types';
import { ApiService } from './api.service';

export class NotificationService {
    /**
     * Get list of notifications
     */
    static async getNotifications(params?: NotificationQueryParams): Promise<NotificationListResponse> {
        const queryParams = new URLSearchParams();
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());
        
        // Add timestamp to prevent caching
        queryParams.append('_t', Date.now().toString());

        const url = `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE}?${queryParams.toString()}`;
        
        return ApiService.get<NotificationListResponse>(url);
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(): Promise<number> {
        const response = await this.getNotifications({ page: 1, limit: 1, is_read: false });
        return response.data.unread_count;
    }

    /**
     * Mark a notification as read
     */
    static async markAsRead(id: string): Promise<ApiResponse<Notification>> {
        return ApiService.patch<ApiResponse<Notification>>(
            API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
            {}
        );
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(): Promise<ApiResponse<void>> {
        return ApiService.patch<ApiResponse<void>>(
            API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
            {}
        );
    }

    /**
     * Delete a notification
     */
    static async deleteNotification(id: string): Promise<ApiResponse<void>> {
        return ApiService.delete<ApiResponse<void>>(
            API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id)
        );
    }

    /**
     * Delete all notifications
     */
    static async deleteAllNotifications(): Promise<ApiResponse<void>> {
        return ApiService.delete<ApiResponse<void>>(
            API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE_ALL
        );
    }
}
