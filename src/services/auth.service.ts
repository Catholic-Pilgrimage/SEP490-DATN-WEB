import { API_CONFIG, STORAGE_KEYS } from '../config/api';
import { ApiResponse, LoginRequest, LoginResponseData, UserProfile, UpdateProfileRequest, ChangePasswordRequest, RefreshTokenResponse } from '../types/auth.types';
import { ApiService } from './api.service';

export class AuthService {
    /**
     * Login user
     */
    static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
        const response = await ApiService.post<ApiResponse<LoginResponseData>>(
            API_CONFIG.ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // Store tokens if login successful
        if (response.success && response.data) {
            this.storeTokens(response.data.accessToken, response.data.refreshToken);
        }

        return response;
    }

    /**
     * Get user profile from backend
     */
    static async getProfile(): Promise<ApiResponse<UserProfile>> {
        return ApiService.get<ApiResponse<UserProfile>>(
            API_CONFIG.ENDPOINTS.AUTH.PROFILE
        );
    }

    /**
     * Update user profile
     */
    static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
        const formData = new FormData();

        if (data.full_name) formData.append('full_name', data.full_name);
        if (data.phone) formData.append('phone', data.phone);
        if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
        if (data.language) formData.append('language', data.language);
        if (data.avatar) formData.append('avatar', data.avatar);

        return ApiService.putFormData<ApiResponse<UserProfile>>(
            API_CONFIG.ENDPOINTS.AUTH.PROFILE,
            formData
        );
    }

    /**
     * Change password
     */
    static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
        return ApiService.put<ApiResponse<null>>(
            API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
            data
        );
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await ApiService.post<ApiResponse<RefreshTokenResponse>>(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
            { refreshToken }
        );

        // Update access token if successful
        if (response.success && response.data) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        }

        return response;
    }

    /**
     * Logout user - call backend API and clear local storage
     */
    static async logout(): Promise<void> {
        try {
            // Call backend logout API to invalidate refresh token
            await ApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Even if API fails, still clear local tokens
            console.error('Logout API error:', error);
        } finally {
            // Always clear local tokens
            this.clearTokens();
        }
    }

    /**
     * Store tokens in localStorage
     */
    private static storeTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    /**
     * Clear tokens from localStorage
     */
    private static clearTokens(): void {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    /**
     * Get access token
     */
    static getAccessToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Get refresh token
     */
    static getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}
