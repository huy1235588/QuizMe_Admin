/**
 * API Endpoints Constants
 * Định nghĩa tất cả các endpoint API được sử dụng trong ứng dụng
 */

// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Auth Endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
} as const;

// User Endpoints
export const USER_ENDPOINTS = {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    UPLOAD_AVATAR: '/api/users/avatar',
} as const;

// Quiz Endpoints
export const QUIZ_ENDPOINTS = {
    LIST: '/api/quizzes',
    CREATE: '/api/quizzes',
    GET_BY_ID: (id: number) => `/api/quizzes/${id}`,
    UPDATE: (id: number) => `/api/quizzes/${id}`,
    DELETE: (id: number) => `/api/quizzes/${id}`,
    PUBLIC: '/api/quizzes/public',
    BY_DIFFICULTY: (difficulty: string) => `/api/quizzes/difficulty/${difficulty}`,
    PAGED: '/api/quizzes/paged',
    PUBLISH: (id: number) => `/api/quizzes/${id}/publish`,
    UNPUBLISH: (id: number) => `/api/quizzes/${id}/unpublish`,
} as const;

// Category Endpoints
export const CATEGORY_ENDPOINTS = {
    LIST: '/api/categories',
    CREATE: '/api/categories',
    GET_BY_ID: (id: number) => `/api/categories/${id}`,
    UPDATE: (id: number) => `/api/categories/${id}`,
    DELETE: (id: number) => `/api/categories/${id}`,
    ACTIVE: '/api/categories/active',
} as const;

// Question Endpoints
export const QUESTION_ENDPOINTS = {
    LIST: '/api/questions', // GET all questions
    CREATE: '/api/questions', // POST create single question
    CREATE_BATCH: '/api/questions/batch', // POST create multiple questions
    GET_BY_ID: (id: number) => `/api/questions/${id}`, // GET question by ID
    GET_BY_QUIZ_ID: (quizId: number) => `/api/questions/quiz/${quizId}`, // GET questions by quiz ID
    UPDATE: (id: number) => `/api/questions/${id}`, // PUT update question
    DELETE: (id: number) => `/api/questions/${id}`, // DELETE question
    SEARCH: '/api/questions/search', // GET questions with filters and pagination
    IMPORT: '/api/questions/import', // POST import questions from file
    EXPORT: '/api/questions/export', // GET export questions to file
    BULK_DELETE: '/api/questions/bulk-delete', // DELETE multiple questions
    BULK_UPDATE: '/api/questions/bulk-update', // PUT update multiple questions
    COPY: (id: number) => `/api/questions/${id}/copy`, // POST copy question
    REORDER: '/api/questions/reorder', // PUT reorder questions
} as const;

// Answer Endpoints
export const ANSWER_ENDPOINTS = {
    LIST: (questionId: number) => `/api/questions/${questionId}/answers`,
    CREATE: (questionId: number) => `/api/questions/${questionId}/answers`,
    GET_BY_ID: (questionId: number, answerId: number) => `/api/questions/${questionId}/answers/${answerId}`,
    UPDATE: (questionId: number, answerId: number) => `/api/questions/${questionId}/answers/${answerId}`,
    DELETE: (questionId: number, answerId: number) => `/api/questions/${questionId}/answers/${answerId}`,
} as const;

// File Upload Endpoints
export const UPLOAD_ENDPOINTS = {
    IMAGE: '/api/upload/image',
    AUDIO: '/api/upload/audio',
    VIDEO: '/api/upload/video',
    DOCUMENT: '/api/upload/document',
} as const;

// Statistics Endpoints
export const STATS_ENDPOINTS = {
    DASHBOARD: '/api/stats/dashboard',
    QUIZ_STATS: (quizId: number) => `/api/stats/quiz/${quizId}`,
    USER_STATS: '/api/stats/user',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Status
export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

export default {
    API_BASE_URL,
    AUTH_ENDPOINTS,
    USER_ENDPOINTS,
    QUIZ_ENDPOINTS,
    CATEGORY_ENDPOINTS,
    QUESTION_ENDPOINTS,
    ANSWER_ENDPOINTS,
    UPLOAD_ENDPOINTS,
    STATS_ENDPOINTS,
    HTTP_STATUS,
    API_STATUS,
};
