import { API_CONFIG, STORAGE_KEYS } from '../config/api';

// Flag to prevent multiple refresh attempts at the same time
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class ApiService {
    private static baseUrl = API_CONFIG.BASE_URL;

    /**
     * Try to refresh the access token
     * Returns true if refresh was successful, false otherwise
     */
    private static async tryRefreshToken(): Promise<boolean> {
        // If already refreshing, wait for that to complete
        if (isRefreshing && refreshPromise) {
            return refreshPromise;
        }

        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                if (!refreshToken) {
                    return false;
                }

                const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                const data = await response.json();

                if (response.ok && data.success && data.data?.accessToken) {
                    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
                    return true;
                }

                return false;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return false;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }

    /**
     * Clear all tokens and redirect to login
     */
    private static handleAuthFailure(): void {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Trigger a page reload to go back to login
        window.location.reload();
    }

    /**
     * Generic fetch wrapper with error handling and auto-refresh
     */
    static async request<T>(
        endpoint: string,
        options: RequestInit = {},
        isRetry: boolean = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Get access token from localStorage
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        // Default headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // Add Authorization header if token exists
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            // Handle 401 - try to refresh token (except for auth endpoints)
            if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    // Retry the original request with new token
                    return this.request<T>(endpoint, options, true);
                } else {
                    // Refresh failed, logout user
                    this.handleAuthFailure();
                    throw { status: 401, message: 'Session expired. Please login again.' };
                }
            }

            // Handle other HTTP errors
            if (!response.ok) {
                throw {
                    status: response.status,
                    ...data,
                };
            }

            return data as T;
        } catch (error) {
            // Re-throw the error for handling in the calling code
            throw error;
        }
    }

    /**
     * GET request
     */
    static async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    static async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    static async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    static async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    /**
     * PATCH request
     */
    static async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request with FormData (for file uploads)
     */
    static async putFormData<T>(endpoint: string, formData: FormData, isRetry: boolean = false): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        const headers: Record<string, string> = {};
        // Don't set Content-Type - browser will set it with boundary for FormData

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: formData,
            });

            const data = await response.json();

            // Handle 401 - try to refresh token
            if (response.status === 401 && !isRetry) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    return this.putFormData<T>(endpoint, formData, true);
                } else {
                    this.handleAuthFailure();
                    throw { status: 401, message: 'Session expired. Please login again.' };
                }
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    ...data,
                };
            }

            return data as T;
        } catch (error) {
            throw error;
        }
    }
}
