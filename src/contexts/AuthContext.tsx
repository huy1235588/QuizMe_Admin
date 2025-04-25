"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axios';
import Cookies from 'js-cookie';

interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    profileImage: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
    role: string;
    active: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean, message: string }>;
    logout: () => void;
    getAccessToken: () => string | null;
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
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken') || Cookies.get('accessToken');

            if (userStr && accessToken) {
                const user = JSON.parse(userStr);
                setUser(user);

                // Set auth header for API requests
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            setIsLoading(false);
        };

        loadUser();
    }, []);

    const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean, message: string }> => {
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                usernameOrEmail,
                password
            });

            if (response.data.status === 'success') {
                const { user, accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = response.data.data;

                // Tính toán thời gian hết hạn cho cookie (convert ISO string to Date object)
                const accessExpiry = new Date(accessTokenExpiry);
                const refreshExpiry = new Date(refreshTokenExpiry);

                // Store tokens in both localStorage and cookies
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('accessTokenExpiry', accessTokenExpiry);
                localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry);
                localStorage.setItem('user', JSON.stringify(user));

                // Set cookies for server-side access
                Cookies.set('accessToken', accessToken, { expires: accessExpiry, path: '/' });
                Cookies.set('refreshToken', refreshToken, { expires: refreshExpiry, path: '/' });

                // Set auth header for API requests
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                setUser(user);
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'An error occurred during login'
            };
        }
    };

    const logout = () => {
        // Remove tokens and user info from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiry');
        localStorage.removeItem('refreshTokenExpiry');
        localStorage.removeItem('user');

        // Remove tokens from cookies
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });

        // Remove auth header
        delete axiosInstance.defaults.headers.common['Authorization'];

        setUser(null);
        router.push('/login');
    };

    const getAccessToken = (): string | null => {
        return localStorage.getItem('accessToken') || Cookies.get('accessToken') || null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            getAccessToken
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