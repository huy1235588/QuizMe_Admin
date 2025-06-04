import { UserResponse, UserProfileResponse, Role } from '@/types/database';
import { USER_ROLES, AVATAR_CONFIG, USER_VALIDATION } from '@/constants/userConstants';

/**
 * User utility functions
 */
export class UserUtils {
    /**
     * Kiểm tra xem user có phải là admin không
     */
    static isAdmin(user: UserResponse): boolean {
        return user.role === USER_ROLES.ADMIN;
    }

    /**
     * Kiểm tra xem user có active không
     */
    static isActive(user: UserResponse): boolean {
        return user.isActive;
    }

    /**
     * Lấy display name của user (ưu tiên fullName -> username -> email)
     */
    static getDisplayName(user: UserResponse): string {
        return user.fullName?.trim() || user.username || user.email;
    }

    /**
     * Lấy initials từ tên user (để hiển thị avatar placeholder)
     */
    static getInitials(user: UserResponse): string {
        const name = this.getDisplayName(user);
        const words = name.split(' ').filter(word => word.length > 0);

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return words
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Lấy avatar URL với fallback
     */
    static getAvatarUrl(user: UserResponse, fallbackUrl?: string): string {
        return user.profileImage || fallbackUrl || AVATAR_CONFIG.DEFAULT_AVATAR;
    }

    /**
     * Format ngày tham gia
     */
    static formatJoinDate(dateString: string, locale: string = 'vi-VN'): string {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format thời gian tương đối (ví dụ: "2 giờ trước")
     */
    static formatRelativeTime(dateString: string, locale: string = 'vi-VN'): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return 'Vừa xong';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        } else if (diffInDays < 7) {
            return `${diffInDays} ngày trước`;
        } else {
            return this.formatJoinDate(dateString, locale);
        }
    }

    /**
     * Validate username
     */
    static validateUsername(username: string): { isValid: boolean; error?: string } {
        if (!username) {
            return { isValid: false, error: 'Username is required' };
        }

        if (username.length < USER_VALIDATION.USERNAME.MIN_LENGTH) {
            return { isValid: false, error: `Username must be at least ${USER_VALIDATION.USERNAME.MIN_LENGTH} characters` };
        }

        if (username.length > USER_VALIDATION.USERNAME.MAX_LENGTH) {
            return { isValid: false, error: `Username must not exceed ${USER_VALIDATION.USERNAME.MAX_LENGTH} characters` };
        }

        if (!USER_VALIDATION.USERNAME.PATTERN.test(username)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
        }

        return { isValid: true };
    }

    /**
     * Validate email
     */
    static validateEmail(email: string): { isValid: boolean; error?: string } {
        if (!email) {
            return { isValid: false, error: 'Email is required' };
        }

        if (!USER_VALIDATION.EMAIL.PATTERN.test(email)) {
            return { isValid: false, error: 'Invalid email format' };
        }

        return { isValid: true };
    }

    /**
     * Validate full name
     */
    static validateFullName(fullName: string): { isValid: boolean; error?: string } {
        if (!fullName) {
            return { isValid: false, error: 'Full name is required' };
        }

        if (fullName.trim().length < USER_VALIDATION.FULL_NAME.MIN_LENGTH) {
            return { isValid: false, error: `Full name must be at least ${USER_VALIDATION.FULL_NAME.MIN_LENGTH} characters` };
        }

        if (fullName.length > USER_VALIDATION.FULL_NAME.MAX_LENGTH) {
            return { isValid: false, error: `Full name must not exceed ${USER_VALIDATION.FULL_NAME.MAX_LENGTH} characters` };
        }

        return { isValid: true };
    }

    /**
     * Validate avatar file
     */
    static validateAvatarFile(file: File): { isValid: boolean; error?: string } {
        if (!file) {
            return { isValid: false, error: 'File is required' };
        }

        if (file.size > AVATAR_CONFIG.MAX_FILE_SIZE) {
            const maxSizeMB = AVATAR_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
            return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
        }

        if (!AVATAR_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
            return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
        }

        return { isValid: true };
    }

    /**
     * Lấy role display name
     */
    static getRoleDisplayName(role: Role): string {
        switch (role) {
            case USER_ROLES.ADMIN:
                return 'Quản trị viên';
            case USER_ROLES.USER:
                return 'Người dùng';
            default:
                return 'Không xác định';
        }
    }

    /**
     * Lấy role color (để hiển thị badge)
     */
    static getRoleColor(role: Role): string {
        switch (role) {
            case USER_ROLES.ADMIN:
                return 'red';
            case USER_ROLES.USER:
                return 'blue';
            default:
                return 'gray';
        }
    }

    /**
     * Lấy status display name
     */
    static getStatusDisplayName(isActive: boolean): string {
        return isActive ? 'Hoạt động' : 'Không hoạt động';
    }

    /**
     * Lấy status color
     */
    static getStatusColor(isActive: boolean): string {
        return isActive ? 'green' : 'gray';
    }

    /**
     * Sort users by different criteria
     */
    static sortUsers(users: UserResponse[], sortBy: keyof UserResponse, ascending: boolean = true): UserResponse[] {
        return [...users].sort((a, b) => {
            const aValue: any = a[sortBy];
            const bValue: any = b[sortBy];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const result = aValue.localeCompare(bValue);
                return ascending ? result : -result;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                const result = aValue - bValue;
                return ascending ? result : -result;
            }

            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                const result = Number(aValue) - Number(bValue);
                return ascending ? result : -result;
            }

            // For dates
            if (aValue instanceof Date && bValue instanceof Date) {
                const result = aValue.getTime() - bValue.getTime();
                return ascending ? result : -result;
            }

            // For date strings
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    const result = dateA.getTime() - dateB.getTime();
                    return ascending ? result : -result;
                }
            }

            return 0;
        });
    }

    /**
     * Filter users by search term
     */
    static filterUsers(users: UserResponse[], searchTerm: string): UserResponse[] {
        if (!searchTerm.trim()) {
            return users;
        }

        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.fullName && user.fullName.toLowerCase().includes(term))
        );
    }

    /**
     * Group users by role
     */
    static groupUsersByRole(users: UserResponse[]): Record<Role, UserResponse[]> {
        return users.reduce((groups, user) => {
            const role = user.role;
            if (!groups[role]) {
                groups[role] = [];
            }
            groups[role].push(user);
            return groups;
        }, {} as Record<Role, UserResponse[]>);
    }

    /**
     * Calculate user statistics từ profile
     */
    static calculateUserStats(profile: UserProfileResponse) {
        const averageScore = profile.totalScore || 0;
        const totalQuizzes = profile.quizzesCreated || 0;
        const totalQuizPlays = profile.totalQuizPlays || 0;

        return {
            averageScore: Math.round(averageScore * 100) / 100,
            totalQuizzes,
            totalQuizPlays,
            averageQuizPlaysPerQuiz: totalQuizzes > 0 ? Math.round((totalQuizPlays / totalQuizzes) * 100) / 100 : 0
        };
    }
}
