// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout',
            REFRESH: '/api/auth/refresh-token',
            PROFILE: '/api/auth/profile',
            CHANGE_PASSWORD: '/api/auth/change-password',
        },
        ADMIN: {
            USERS: '/api/admin/users',
            USER_DETAIL: (id: string) => `/api/admin/users/${id}`,
            USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,
            SITES: '/api/admin/sites',
            SITE_DETAIL: (id: string) => `/api/admin/sites/${id}`,
            SITE_RESTORE: (id: string) => `/api/admin/sites/${id}/restore`,
            SITE_LOCAL_GUIDES: (siteId: string) => `/api/admin/sites/${siteId}/local-guides`,
            SITE_SHIFTS: (siteId: string) => `/api/admin/sites/${siteId}/shifts`,
            SITE_MEDIA: (siteId: string) => `/api/admin/sites/${siteId}/media`,
            SITE_SCHEDULES: (siteId: string) => `/api/admin/sites/${siteId}/schedules`,
            SITE_EVENTS: (siteId: string) => `/api/admin/sites/${siteId}/events`,
            SITE_NEARBY_PLACES: (siteId: string) => `/api/admin/sites/${siteId}/nearby-places`,
            VERIFICATION_REQUESTS: '/api/admin/verification-requests',
            VERIFICATION_REQUEST_DETAIL: (id: string) => `/api/admin/verification-requests/${id}`,
            SOS_LIST: '/api/sos/admin/list',
            SOS_STATS: '/api/sos/admin/stats',
        },
        MANAGER: {
            SITES: '/api/manager/sites', // GET my site, POST create, PUT update
            LOCAL_GUIDES: '/api/manager/local-guides', // GET list, POST create
            LOCAL_GUIDE_STATUS: (id: string) => `/api/manager/local-guides/${id}/status`, // PATCH status
            // Shift Submissions endpoints
            SHIFT_SUBMISSIONS: '/api/manager/local-guides/shift-submissions', // GET list
            SHIFT_SUBMISSION_DETAIL: (id: string) => `/api/manager/local-guides/shift-submissions/${id}`, // GET detail
            SHIFT_SUBMISSION_STATUS: (id: string) => `/api/manager/local-guides/shift-submissions/${id}/status`, // PATCH approve/reject
            // Content Management endpoints
            CONTENT: {
                MEDIA: '/api/manager/content/media', // GET list
                MEDIA_STATUS: (id: string) => `/api/manager/content/media/${id}/status`, // PATCH approve/reject
                MEDIA_ACTIVE: (id: string) => `/api/manager/content/media/${id}/is-active`, // PATCH soft delete/restore
                UPLOAD_3D: '/api/manager/content/media/3d-model', // POST upload 3D model
                SCHEDULES: '/api/manager/content/schedules', // GET list
                SCHEDULES_STATUS: (id: string) => `/api/manager/content/schedules/${id}/status`,
                SCHEDULES_ACTIVE: (id: string) => `/api/manager/content/schedules/${id}/is-active`,
                EVENTS: '/api/manager/content/events', // GET list
                EVENTS_STATUS: (id: string) => `/api/manager/content/events/${id}/status`,
                EVENTS_ACTIVE: (id: string) => `/api/manager/content/events/${id}/is-active`,
                NEARBY_PLACES: '/api/manager/content/nearby-places', // GET list
                NEARBY_PLACES_STATUS: (id: string) => `/api/manager/content/nearby-places/${id}/status`,
                NEARBY_PLACES_ACTIVE: (id: string) => `/api/manager/content/nearby-places/${id}/is-active`,
            },
            SOS_LIST: '/api/sos/manager/list',
            SOS_STATS: '/api/sos/manager/stats',
        },
        NOTIFICATIONS: {
            BASE: '/api/notifications', // GET list, DELETE all
            MARK_READ: (id: string) => `/api/notifications/${id}/read`, // PATCH mark as read
            MARK_ALL_READ: '/api/notifications/read-all', // PATCH mark all as read
            DELETE: (id: string) => `/api/notifications/${id}`, // DELETE notification
            DELETE_ALL: '/api/notifications', // DELETE all notifications
        },
    },
    TIMEOUT: 10000, // 10 seconds
};

// Token storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
};
