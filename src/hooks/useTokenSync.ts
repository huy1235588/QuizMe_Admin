/**
 * Custom hook để tự động sync tokens giữa localStorage và cookies
 * Đảm bảo middleware có thể đọc tokens từ cookies
 */

import { useEffect } from 'react';
import { AuthAPI } from '@/api/authAPI';

export const useTokenSync = () => {
    useEffect(() => {
        // Sync tokens khi component mount
        const syncTokens = () => {
            if (typeof window === 'undefined') return;

            const accessToken = AuthAPI.getCurrentAccessToken();
            const refreshToken = AuthAPI.getCurrentRefreshToken();

            // Sync to cookies nếu có tokens trong localStorage
            if (accessToken) {
                document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
            }

            if (refreshToken) {
                document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            }
        };

        // Sync ngay lập tức
        syncTokens();

        // Set up listener để sync khi localStorage thay đổi
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'accessToken' || e.key === 'refreshToken') {
                syncTokens();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Sync định kỳ (mỗi 5 phút) để đảm bảo cookies không hết hạn
        const syncInterval = setInterval(syncTokens, 5 * 60 * 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(syncInterval);
        };
    }, []);

    return {
        // Utility functions để sync manual
        syncTokensToCookies: () => {
            if (typeof window === 'undefined') return;

            const accessToken = AuthAPI.getCurrentAccessToken();
            const refreshToken = AuthAPI.getCurrentRefreshToken();

            if (accessToken) {
                document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
            }

            if (refreshToken) {
                document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            }
        },

        clearAllTokens: () => {
            AuthAPI.clearAllAuthData();

            if (typeof window !== 'undefined') {
                document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    };
};

export default useTokenSync;
