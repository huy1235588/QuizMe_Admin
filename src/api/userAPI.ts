import { userService } from '@/services/userService';
import { UserResponse, UserProfileResponse, UserFilterParams, PageResponse, UserRequest } from '@/types/database';
import { UserUtils } from '@/utils/userUtils';

/**
 * User API Helper - Utility functions for user management
 */
export class UserAPI {
    /**
     * Lấy thông tin người dùng theo ID
     */
    static async getUserById(id: number): Promise<UserResponse> {
        const response = await userService.getUserById(id);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to get user');
    }

    /**
     * Lấy danh sách người dùng có tổng số quiz được chơi nhiều nhất
     */
    static async getTopUsers(): Promise<UserResponse[]> {
        const response = await userService.getTopUsersByTotalQuizPlays();
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to get top users');
    }

    /**
     * Lấy tổng số người dùng trong hệ thống
     */
    static async getUserCount(): Promise<number> {
        const response = await userService.getUserCount();
        if (response.status === 'success') {
            return response.data.count;
        }
        throw new Error(response.message || 'Failed to get user count');
    }

    /**
     * Lấy danh sách người dùng theo phân trang và lọc
     */
    static async getPagedUsers(params: UserFilterParams): Promise<PageResponse<UserResponse>> {
        const response = await userService.getPagedUsers(params);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to get paged users');
    }

    /**
     * Lấy thông tin profile của người dùng hiện tại đã đăng nhập
     */
    static async getCurrentUserProfile(): Promise<UserProfileResponse> {
        const response = await userService.getCurrentUserProfile();
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to get current user profile');
    }

    /**
     * Lấy thông tin profile của người dùng theo ID
     */
    static async getUserProfile(id: number): Promise<UserProfileResponse> {
        const response = await userService.getUserProfileById(id);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to get user profile');
    }

    /**
     * Upload avatar cho người dùng hiện tại
     */
    static async uploadAvatar(avatarFile: File): Promise<UserResponse> {
        // Validate file before upload
        const validation = UserUtils.validateAvatarFile(avatarFile);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        const response = await userService.uploadAvatar(avatarFile);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to upload avatar');
    }

    /**
     * Xóa avatar của người dùng hiện tại
     */
    static async removeAvatar(): Promise<UserResponse> {
        const response = await userService.removeAvatar();
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to remove avatar');
    }

    /**
     * Tạo mới người dùng
     * @param userData Dữ liệu người dùng mới
     * @return Thông tin người dùng đã tạo
     */
    static async createUser(userData: UserRequest): Promise<UserResponse> {
        const response = await userService.createUser(userData);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to create user');
    }

    /**
     * Cập nhật thông tin người dùng
     * @param userData Dữ liệu người dùng cần cập nhật
     * @return Thông tin người dùng đã cập nhật
     * */
    static async updateUser(userData: UserRequest): Promise<UserResponse> {
        const response = await userService.updateUser(userData);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to update user');
    }

    /**
     * Xóa người dùng theo ID
     * @param id ID của người dùng cần xóa
     * @return Thông tin người dùng đã xóa
     */
    static async deleteUser(id: number): Promise<UserResponse> {
        const response = await userService.deleteUser(id);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to delete user');
    }

    /**
     * Khóa hoặc mở khóa tài khoản người dùng
     * @param id ID của người dùng cần khóa/mở khóa
     * @param isActive Trạng thái mới của tài khoản (true = mở khóa, false = khóa)
     * @return Thông tin người dùng đã cập nhật trạng thái
     */
    static async toggleUserStatus(id: number, isActive: boolean): Promise<UserResponse> {
        const response = await userService.toggleUserStatus(id, isActive);
        if (response.status === 'success') {
            return response.data;
        }
        throw new Error(response.message || 'Failed to toggle user status');
    }

    // Utility functions using UserUtils
    /**
     * Utility function - Format user display name
     */
    static formatUserDisplayName(user: UserResponse): string {
        return UserUtils.getDisplayName(user);
    }

    /**
     * Utility function - Check if user is admin
     */
    static isAdmin(user: UserResponse): boolean {
        return UserUtils.isAdmin(user);
    }

    /**
     * Utility function - Get user avatar URL with fallback
     */
    static getUserAvatarUrl(user: UserResponse, fallbackUrl?: string): string {
        return UserUtils.getAvatarUrl(user, fallbackUrl);
    }

    /**
     * Utility function - Format user joined date
     */
    static formatJoinDate(dateString: string): string {
        return UserUtils.formatJoinDate(dateString);
    }

    /**
     * Utility function - Get user initials
     */
    static getUserInitials(user: UserResponse): string {
        return UserUtils.getInitials(user);
    }

    /**
     * Utility function - Get role display name
     */
    static getRoleDisplayName(user: UserResponse): string {
        return UserUtils.getRoleDisplayName(user.role);
    }

    /**
     * Utility function - Get status display name
     */
    static getStatusDisplayName(user: UserResponse): string {
        return UserUtils.getStatusDisplayName(user.isActive);
    }

    /**
     * Utility function - Sort users
     */
    static sortUsers(users: UserResponse[], sortBy: keyof UserResponse, ascending: boolean = true): UserResponse[] {
        return UserUtils.sortUsers(users, sortBy, ascending);
    }

    /**
     * Utility function - Filter users by search term
     */
    static filterUsers(users: UserResponse[], searchTerm: string): UserResponse[] {
        return UserUtils.filterUsers(users, searchTerm);
    }

    /**
     * Utility function - Calculate user statistics
     */
    static calculateUserStats(profile: UserProfileResponse) {
        return UserUtils.calculateUserStats(profile);
    }
}
