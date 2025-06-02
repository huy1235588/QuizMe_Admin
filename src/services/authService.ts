import axiosInstance from '@/utils/axios';
import { LoginRequest, RegisterRequest } from '@/types/database';

// Types for API responses
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message: string;
    timestamp?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

export interface TokenRequest {
    refreshToken: string;
}

class AuthService {
    /**
     * Đăng nhập người dùng
     */
    async login(loginRequest: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
                '/api/auth/login',
                loginRequest
            );

            // Lưu tokens vào localStorage nếu đăng nhập thành công
            if (response.data.status === 'success') {
                const { accessToken, refreshToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Cập nhật header mặc định cho các request tiếp theo
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    }

    /**
     * Đăng ký người dùng mới
     */
    async register(registerRequest: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
                '/api/auth/register',
                registerRequest
            );

            // Lưu tokens vào localStorage nếu đăng ký thành công
            if (response.data.status === 'success') {
                const { accessToken, refreshToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Cập nhật header mặc định cho các request tiếp theo
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    }

    /**
     * Đăng xuất người dùng
     */
    async logout(): Promise<ApiResponse<void>> {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            const tokenRequest: TokenRequest = { refreshToken };

            const response = await axiosInstance.post<ApiResponse<void>>(
                '/api/auth/logout',
                tokenRequest
            );

            // Xóa tokens khỏi localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // Xóa header Authorization
            delete axiosInstance.defaults.headers.common['Authorization'];

            return response.data;
        } catch (error: any) {
            // Vẫn xóa tokens local ngay cả khi API call thất bại
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            delete axiosInstance.defaults.headers.common['Authorization'];

            throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
        }
    }

    /**
     * Làm mới access token
     */
    async refreshToken(): Promise<ApiResponse<AuthResponse>> {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            const tokenRequest: TokenRequest = { refreshToken };

            const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
                '/api/auth/refresh-token',
                tokenRequest
            );

            // Cập nhật tokens mới
            if (response.data.status === 'success') {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Cập nhật header mặc định
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            return response.data;
        } catch (error: any) {
            // Nếu refresh token không hợp lệ, xóa tất cả tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            delete axiosInstance.defaults.headers.common['Authorization'];

            throw new Error(error.response?.data?.message || 'Làm mới token thất bại');
        }
    }

    /**
     * Kiểm tra trạng thái đăng nhập
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    }

    /**
     * Lấy access token hiện tại
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Lấy refresh token hiện tại
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Xóa tất cả dữ liệu xác thực
     */
    clearAuth(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
