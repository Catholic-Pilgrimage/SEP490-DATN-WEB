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
            VERIFICATION_REQUESTS: '/api/admin/verification-requests',
            VERIFICATION_REQUEST_DETAIL: (id: string) => `/api/admin/verification-requests/${id}`,
        },
        MANAGER: {
            SITES: '/api/manager/sites', // GET my site, POST create, PUT update
            LOCAL_GUIDES: '/api/manager/local-guides', // GET list, POST create
            LOCAL_GUIDE_STATUS: (id: string) => `/api/manager/local-guides/${id}/status`, // PATCH status
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
