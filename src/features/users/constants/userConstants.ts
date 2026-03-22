/**
 * User-related constants and configurations
 */

// User roles
export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN'
} as const;

// Avatar configurations
export const AVATAR_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DEFAULT_AVATAR: '/default-avatar.png',
    AVATAR_SIZES: {
        SMALL: 32,
        MEDIUM: 64,
        LARGE: 128,
        EXTRA_LARGE: 256
    }
} as const;

// User status
export const USER_STATUS = {
    ACTIVE: true,
    INACTIVE: false
} as const;

// Sort options for users
export const USER_SORT_OPTIONS = {
    CREATED_DATE: 'createdAt',
    USERNAME: 'username',
    EMAIL: 'email',
    FULL_NAME: 'fullName',
    QUIZ_PLAYS: 'totalQuizPlays',
    ROLE: 'role'
} as const;

// User validation rules
export const USER_VALIDATION = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    FULL_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 100,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    }
} as const;

// Default values
export const USER_DEFAULTS = {
    ROLE: USER_ROLES.USER,
    IS_ACTIVE: USER_STATUS.ACTIVE,
    AVATAR_URL: AVATAR_CONFIG.DEFAULT_AVATAR
} as const;
