"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthResponse } from '@/services/authService';
import { LoginRequest, RegisterRequest } from '@/types/database';

interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (loginRequest: LoginRequest) => Promise<{ success: boolean, message: string }>;
    register: (registerRequest: RegisterRequest) => Promise<{ success: boolean, message: string }>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @description 
 * Thành phần cung cấp Context cho xác thực người dùng trong ứng dụng.
 * Quản lý trạng thái đăng nhập, lưu trữ thông tin người dùng và xử lý các token xác thực.
 * Cung cấp các hàm để đăng nhập, đăng xuất và kiểm tra trạng thái xác thực hiện tại.
 * 
 * Hoạt động:
 * - Khi khởi tạo, kiểm tra xem người dùng đã đăng nhập từ trước chưa
 * - Cung cấp phương thức đăng nhập với username/email và mật khẩu
 * - Lưu trữ token xác thực vào localStorage và cookies để sử dụng cả ở client và server
 * - Tự động thiết lập header Authorization cho các request API
 * - Cung cấp phương thức đăng xuất để xóa dữ liệu phiên người dùng
 * 
 * @param {Object} props - Props của component
 * @param {ReactNode} props.children - Các component con được bọc bởi Context Provider
 * 
 * @returns {JSX.Element} AuthContext.Provider với các giá trị và phương thức xác thực
 * 
 * @example
 * // Bọc ứng dụng bằng AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Sử dụng trong component con
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra xem người dùng đã đăng nhập từ trước chưa
        const loadUser = () => {
            if (authService.isAuthenticated()) {
                const accessToken = authService.getAccessToken();
                if (accessToken) {
                    // Có thể gọi API để lấy thông tin user hiện tại
                    // Hoặc lưu user info trong localStorage và load lại
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const userData = JSON.parse(userStr);
                        setUser(userData);
                    }
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const clearError = () => {
        setError(null);
    }; const login = async (loginRequest: LoginRequest): Promise<{ success: boolean, message: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(loginRequest);

            if (response.status === 'success') {
                const userData = response.data.user;
                setUser(userData);

                // Lưu thông tin người dùng vào localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                // Sync tokens to cookies để middleware có thể đọc
                if (typeof window !== 'undefined') {
                    const accessToken = authService.getAccessToken();
                    const refreshToken = authService.getRefreshToken();

                    if (accessToken) {
                        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
                    }
                    if (refreshToken) {
                        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
                    }
                }

                return { success: true, message: response.message };
            } else {
                setError(response.message);
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to login';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (registerRequest: RegisterRequest): Promise<{ success: boolean, message: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register(registerRequest);

            if (response.status === 'success') {
                const userData = response.data.user;
                setUser(userData);

                // Lưu thông tin người dùng vào localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                return { success: true, message: response.message };
            } else {
                setError(response.message);
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to register';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }; const logout = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.logout();
        } catch (err: any) {
            // Ghi log lỗi nhưng vẫn tiếp tục quá trình đăng xuất
            console.error('Error during logout:', err.message);
        } finally {
            // Xóa dữ liệu người dùng bất kể phản hồi API
            setUser(null);
            localStorage.removeItem('user');

            // Clear cookies
            if (typeof window !== 'undefined') {
                document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            setIsLoading(false);
            router.push('/login');
        }
    };

    const refreshToken = async (): Promise<void> => {
        try {
            const response = await authService.refreshToken();
            if (response.status === 'success') {
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (err: any) {
            console.error('Error refreshing token:', err.message);
            // Nếu refresh thất bại, đăng xuất người dùng
            await logout();
        }
    };

    const getAccessToken = (): string | null => {
        return authService.getAccessToken();
    };

    const getRefreshToken = (): string | null => {
        return authService.getRefreshToken();
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            error,
            login,
            register,
            logout,
            refreshToken,
            clearError,
            getAccessToken,
            getRefreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}