// Re-export all services from features for backward compatibility
export { default as authService } from '@/features/auth/services/authService';
export { default as categoryService } from '@/features/categories/services/categoryService';
export { default as quizService } from '@/features/quizzes/services/quizService';
export { default as questionService } from '@/features/questions/services/questionService';
export { userService } from '@/features/users/services/userService';

// Re-export types for convenience
export type { ApiResponse } from '@/features/auth/services/authService';
