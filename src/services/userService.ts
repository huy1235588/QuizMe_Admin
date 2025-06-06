import axiosInstance from '@/utils/axios';
import { UserResponse, UserProfileResponse, UserFilterParams, PageResponse, UserRequest } from '@/types/database';
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
    }    /**
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
     * Lấy danh sách người dùng theo phân trang và lọc
     */
    async getPagedUsers(params: UserFilterParams): Promise<ApiResponse<PageResponse<UserResponse>>> {
        try {
            const response = await axiosInstance.get<ApiResponse<PageResponse<UserResponse>>>(
                USER_ENDPOINTS.PAGED,
                { params }
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

    /**
     * Tạo mới người dùng
     */
    async createUser(userData: UserRequest): Promise<ApiResponse<UserResponse>> {
        try {
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('fullName', userData.fullName);
            formData.append('role', userData.role);
            formData.append('isActive', userData.isActive.toString());

            // Nếu có avatar file, thêm vào formData
            if (userData.profileImage) {
                formData.append('profileImage', userData.profileImage);
            }

            const response = await axiosInstance.post<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.CREATE,
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
     * Cập nhật thông tin người dùng
     */
    async updateUser(userData: UserRequest): Promise<ApiResponse<UserResponse>> {
        try {
            const formData = new FormData();
            formData.append('id', userData.id?.toString() || '');
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('fullName', userData.fullName);
            formData.append('role', userData.role);
            formData.append('isActive', userData.isActive.toString());

            // Nếu có avatar file, thêm vào formData
            if (userData.profileImage) {
                formData.append('profileImage', userData.profileImage);
            }

            const response = await axiosInstance.put<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.UPDATE(userData.id || 0),
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
     * Xóa người dùng theo ID
     */
    async deleteUser(id: number): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.DELETE(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Kích hoạt hoặc vô hiệu hóa người dùng
     * @param id ID của người dùng
     * @param isActive Trạng thái kích hoạt
     * @return Thông tin người dùng đã cập nhật
     */
    async toggleUserStatus(id: number, isActive: boolean): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await axiosInstance.put<ApiResponse<UserResponse>>(
                USER_ENDPOINTS.TOGGLE_STATUS(id) + `?isActive=${isActive}`,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const userService = new UserService();
