// Notification Types
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

export type NotificationType =
    // ========== ADMIN NOTIFICATIONS (3 types) ==========
    | 'verification_submitted'        // User request to become Manager
    | 'site_registration_submitted'   // Manager registers new Site
    | 'sos_created'                   // New SOS request created

    // ========== MANAGER NOTIFICATIONS (9 types) ==========
    // Content submitted by Local Guide (need approval)
    | 'media_submitted'
    | 'event_submitted'
    | 'schedule_submitted'
    | 'nearby_place_submitted'
    | 'shift_submitted'

    // Site status updates from Admin
    | 'site_approved'
    | 'site_rejected'
    | 'site_hidden'
    | 'site_update_submitted';

export interface NotificationListResponse {
    success: boolean;
    message?: string;
    data: {
        notifications: Notification[];
        unread_count: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface NotificationQueryParams {
    page?: number;
    limit?: number;
    is_read?: boolean;
}
