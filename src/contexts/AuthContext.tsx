"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axiosInstance from '@/utils/axios';

// Định nghĩa kiểu dữ liệu User
interface User {
    id: number;
    username: string;
    email: string;
}

// Kiểu dữ liệu cho Context xác thực
interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    isAuthenticated: boolean;
    login: (
        accessToken: string,
        refreshToken: string,
        user: User,
        accessTokenExpiresAt: Date,
        refreshTokenExpiresAt: Date
    ) => void;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Component AuthProvider
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // State cho dữ liệu xác thực
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<Date | null>(null);
    const [refreshTokenExpiresAt, setRefreshTokenExpiresAt] = useState<Date | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Khởi tạo trạng thái xác thực từ localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        const storedAccessToken = localStorage.getItem('auth_access_token');
        const storedRefreshToken = localStorage.getItem('auth_refresh_token');
        const storedAccessTokenExpiresAt = localStorage.getItem('auth_access_token_expires_at');
        const storedRefreshTokenExpiresAt = localStorage.getItem('auth_refresh_token_expires_at');

        if (storedUser && storedAccessToken && storedRefreshToken &&
            storedAccessTokenExpiresAt && storedRefreshTokenExpiresAt) {

            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setAccessTokenExpiresAt(new Date(storedAccessTokenExpiresAt));
            setRefreshTokenExpiresAt(new Date(storedRefreshTokenExpiresAt));
            setIsAuthenticated(true);
        }

        setLoading(false);
    }, []);

    // Thiết lập header authorization cho axios khi accessToken thay đổi
    useEffect(() => {
        if (accessToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [accessToken]);

    // Logic bảo vệ các route
    useEffect(() => {
        // Bỏ qua trong quá trình tải ban đầu
        if (loading) return;

        // Các route được bảo vệ ngoại trừ trang login
        const isProtectedRoute =
            !pathname?.startsWith('/login');

        if (isProtectedRoute && !isAuthenticated) {
            router.push('/login');
        } else if (pathname === '/login' && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [pathname, isAuthenticated, loading, router]);

    // Hàm đăng nhập
    const login = (
        newAccessToken: string,
        newRefreshToken: string,
        newUser: User,
        newAccessTokenExpiresAt: Date,
        newRefreshTokenExpiresAt: Date
    ) => {
        // Thiết lập state
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);
        setAccessTokenExpiresAt(newAccessTokenExpiresAt);
        setRefreshTokenExpiresAt(newRefreshTokenExpiresAt);
        setIsAuthenticated(true);

        // Ensure valid dates before storing them
        const validAccessExpires = isValidDate(newAccessTokenExpiresAt) 
            ? newAccessTokenExpiresAt.toISOString() 
            : new Date(Date.now() + 3600 * 1000).toISOString(); // Default 1 hour expiry
        
        const validRefreshExpires = isValidDate(newRefreshTokenExpiresAt)
            ? newRefreshTokenExpiresAt.toISOString()
            : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(); // Default 7 days expiry

        // Lưu vào localStorage
        localStorage.setItem('auth_access_token', newAccessToken);
        localStorage.setItem('auth_refresh_token', newRefreshToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        localStorage.setItem('auth_access_token_expires_at', validAccessExpires);
        localStorage.setItem('auth_refresh_token_expires_at', validRefreshExpires);
    };

    // Helper function to check if a date is valid
    const isValidDate = (date: any): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    // Hàm đăng xuất
    const logout = () => {
        // Xóa state
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setAccessTokenExpiresAt(null);
        setRefreshTokenExpiresAt(null);
        setIsAuthenticated(false);

        // Xóa localStorage
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_access_token_expires_at');
        localStorage.removeItem('auth_refresh_token_expires_at');

        // Chuyển hướng đến trang đăng nhập
        router.push('/login');
    };

    // Hàm làm mới access token
    const refreshAccessToken = async () => {
        if (!refreshToken) {
            logout();
            return;
        }

        try {
            const response = await axiosInstance.post('/api/auth/refresh', {
                refresh_token: refreshToken
            });

            if (response.data.status === 'success') {
                const data = response.data.data;

                setAccessToken(data.access_token);
                setAccessTokenExpiresAt(new Date(data.access_token_expires_at));

                localStorage.setItem('auth_access_token', data.access_token);
                localStorage.setItem('auth_access_token_expires_at', data.access_token_expires_at);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
        }
    };

    // Thiết lập cơ chế làm mới token
    useEffect(() => {
        if (!accessToken || !accessTokenExpiresAt) return;

        // Tính toán thời gian đến khi token cần được làm mới (5 phút trước khi hết hạn)
        const currentTime = new Date();
        const expiryTime = new Date(accessTokenExpiresAt);
        const timeUntilExpiry = expiryTime.getTime() - currentTime.getTime();
        const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 5 phút trước khi hết hạn

        if (refreshTime <= 0) {
            // Đã cần làm mới
            refreshAccessToken();
            return;
        }

        // Thiết lập hẹn giờ để làm mới token
        const refreshTimer = setTimeout(() => {
            refreshAccessToken();
        }, refreshTime);

        return () => clearTimeout(refreshTimer);
    }, [accessToken, accessTokenExpiresAt]);

    // Cung cấp context xác thực
    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                accessTokenExpiresAt,
                refreshTokenExpiresAt,
                isAuthenticated,
                login,
                logout,
                refreshAccessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook tùy chỉnh để sử dụng context xác thực
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}