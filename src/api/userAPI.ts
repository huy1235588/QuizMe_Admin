import { userService } from '@/services/userService';
import { UserResponse, UserProfileResponse } from '@/types/database';
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
