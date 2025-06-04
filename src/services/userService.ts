import axiosInstance from '@/utils/axios';
import { UserResponse, UserProfileResponse } from '@/types/database';
import { USER_ENDPOINTS } from '@/constants/apiEndpoints';

// Types for API responses
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message: string;
    timestamp?: string;
}

class UserService {
    /**
    * Lấy thông tin người dùng theo ID
    */
    async getUserById(id: number): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.GET_BY_ID(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy danh sách người dùng có tổng số quiz được chơi nhiều nhất
     */
    async getTopUsersByTotalQuizPlays(): Promise<ApiResponse<UserResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<UserResponse[]>>(
                USER_ENDPOINTS.TOP_USERS
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy tổng số người dùng trong hệ thống
     */
    async getUserCount(): Promise<ApiResponse<{ count: number }>> {
        try {
            const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
                USER_ENDPOINTS.USER_COUNT
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy thông tin profile của người dùng hiện tại đã đăng nhập
     */
    async getCurrentUserProfile(): Promise<ApiResponse<UserProfileResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<UserProfileResponse>>(
                USER_ENDPOINTS.PROFILE
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy thông tin profile của người dùng theo ID
     */
    async getUserProfileById(id: number): Promise<ApiResponse<UserProfileResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<UserProfileResponse>>(
                USER_ENDPOINTS.PROFILE_BY_ID(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload avatar cho người dùng hiện tại
     */
    async uploadAvatar(avatarFile: File): Promise<ApiResponse<UserResponse>> {
        try {
            const formData = new FormData();
            formData.append('avatarFile', avatarFile);

            const response = await axiosInstance.post<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.AVATAR_UPLOAD,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Xóa avatar của người dùng hiện tại
     */
    async removeAvatar(): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.AVATAR_REMOVE
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const userService = new UserService();
