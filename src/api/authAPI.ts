import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest } from '@/types/database';

/**
 * Auth API Helper - Utility functions for authentication
 */
export class AuthAPI {
    /**
     * Đăng nhập với username/email và password
     */
    static async loginWithCredentials(usernameOrEmail: string, password: string) {
        const loginRequest: LoginRequest = {
            usernameOrEmail,
            password
        };

        return await authService.login(loginRequest);
    }

    /**
     * Đăng ký người dùng mới
     */
    static async registerUser(
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        fullName: string
    ) {
        const registerRequest: RegisterRequest = {
            username,
            email,
            password,
            confirmPassword,
            fullName
        };

        return await authService.register(registerRequest);
    }

    /**
     * Đăng xuất người dùng hiện tại
     */
    static async logoutUser() {
        return await authService.logout();
    }

    /**
     * Làm mới access token
     */
    static async refreshUserToken() {
        return await authService.refreshToken();
    }

    /**
     * Kiểm tra trạng thái đăng nhập
     */
    static isUserAuthenticated(): boolean {
        return authService.isAuthenticated();
    }

    /**
     * Lấy access token hiện tại
     */
    static getCurrentAccessToken(): string | null {
        return authService.getAccessToken();
    }

    /**
     * Lấy refresh token hiện tại
     */
    static getCurrentRefreshToken(): string | null {
        return authService.getRefreshToken();
    }

    /**
     * Xóa tất cả dữ liệu xác thực
     */
    static clearAllAuthData(): void {
        authService.clearAuth();
    }

    /**
     * Kiểm tra token có hết hạn không (client-side check)
     * Note: Đây chỉ là check cơ bản, server vẫn là nguồn tin chính thức
     */
    static isTokenExpired(): boolean {
        const token = authService.getAccessToken();
        if (!token) return true;

        try {
            // Decode JWT token để kiểm tra exp claim
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            return payload.exp < currentTime;
        } catch (error) {
            // Nếu không thể decode token, coi như đã hết hạn
            return true;
        }
    }

    /**
     * Auto refresh token nếu cần thiết
     */
    static async autoRefreshToken(): Promise<boolean> {
        try {
            if (this.isTokenExpired() && authService.getRefreshToken()) {
                const response = await this.refreshUserToken();
                return response?.status === 'success';
            }
            return true;
        } catch (error) {
            console.error('Auto refresh token failed:', error);
            return false;
        }
    }

    /**
     * Sync token từ localStorage sang cookies để middleware có thể đọc
     * Note: Cookies có thể được đọc bởi server-side middleware
     */
    static syncTokenToCookies(): void {
        if (typeof window === 'undefined') return;

        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();

        if (accessToken) {
            // Set cookie với httpOnly=false để JavaScript có thể đọc
            document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
        }

        if (refreshToken) {
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
        }
    }

    /**
     * Clear tokens từ cả localStorage và cookies
     */
    static clearAllTokens(): void {
        // Clear localStorage
        authService.clearAuth();

        // Clear cookies
        if (typeof window !== 'undefined') {
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }

    /**
     * Enhanced login with cookie sync
     */
    static async loginWithCredentialsAndSync(usernameOrEmail: string, password: string) {
        const result = await this.loginWithCredentials(usernameOrEmail, password);

        // Sync tokens to cookies after successful login
        if (result.status === 'success') {
            this.syncTokenToCookies();
        }

        return result;
    }
}

export default AuthAPI;
