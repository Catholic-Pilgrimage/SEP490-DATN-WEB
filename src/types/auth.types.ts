// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        message: string;
        details?: unknown[];
    };
}

// Login Request
export interface LoginRequest {
    email: string;
    password: string;
}

// Login Response Data
export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
}

// API Error
export interface ApiError {
    success: false;
    error: {
        message: string;
        details?: unknown[];
    };
}

// User Profile from backend
export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    date_of_birth: string | null;
    role: 'admin' | 'manager' | 'pilgrim' | 'local_guide';
    status: 'active' | 'inactive' | 'banned';
    language: string;
    site_id?: string;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

// Update Profile Request
export interface UpdateProfileRequest {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    language?: string;
    avatar?: File;
}

// Change Password Request
export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

// Refresh Token Request
export interface RefreshTokenRequest {
    refreshToken: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
    accessToken: string;
}
