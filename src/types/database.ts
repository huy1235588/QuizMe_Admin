// type cho phép định nghĩa các kiểu dữ liệu cho các đối tượng trong ứng dụng quiz

//-------------------------------------------------------------------------
// Entity Types - Kiểu dữ liệu cho các thực thể trong ứng dụng
//-------------------------------------------------------------------------
export type User = {
    id: number;
    username: string;
    email: string;
    fullName: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
    role: string;
    active: boolean;
}

export type Achievement = {
    id: number;
    title: string;
    description: string;
    icon_url: string;
    achieved_at: string;
}

export type Category = {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    quizCount: number;
    totalPlayCount: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type Quiz = {
    id: number;
    title: string;
    description: string;
    quizThumbnails?: string;
    categoryId: number;
    categoryName: string;
    createName: string;
    creatorId: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isPublic: boolean;
    playCount: number;
    questionCount: number;
    createAt?: string;
    updatedAt?: string;
}

export type Question = {
    id: number;
    quizId: number;
    content: string;
    imageUrl?: string;
    timeLimit: number;
    points: number;
    orderNumber: number;
    createdAt: string;
    updatedAt: string;
}

export type QuestionOption = {
    id: number;
    questionId: number;
    content: string;
    isCorrect: boolean;
    createdAt: string;
    updatedAt: string;
}

export type Activity = {
    id: number;
    user: string;
    action: string;
    quiz: string;
    score: string;
    time: string;
    status: 'success' | 'processing' | 'error' | 'warning';
}

//-------------------------------------------------------------------------
// Request Types - Kiểu dữ liệu cho các yêu cầu từ client đến server
//-------------------------------------------------------------------------

export type CategoryRequest = {
    name: string;
    description: string;
    iconUrl?: string;
    isActive: boolean;
}

export type QuizRequest = {
    title: string;
    description: string;
    quizThumbnails?: string | File;
    categoryId: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isPublic: boolean;
}

export type QuizFilterParams = {
    page?: number;
    pageSize?: number;
    category?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    search?: string;
    sort?: 'newest' | 'popular';
    isPublic?: boolean;
    tab?: 'newest' | 'popular';
}

export type QuestionRequest = {
    quizId: number;
    content: string;
    imageUrl?: string | File;
    timeLimit: number;
    points: number;
    orderNumber: number;
    options: QuestionOptionRequest[];
}

export type QuestionOptionRequest = {
    content: string;
    isCorrect: boolean;
}

//-------------------------------------------------------------------------
// Response Types - Kiểu dữ liệu cho các phản hồi từ server về client
//-------------------------------------------------------------------------

export type CategoryResponse = {
    id: number;
    name: string;
    description: string;
    icon_url: string;
    quiz_count: number;
    total_play_count: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export type CategoryListResponse = {
    categories: CategoryResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    }
}

export type QuizResponse = {
    id: number;
    title: string;
    description: string;
    quizThumbnails?: string;
    categoryId: number;
    categoryName: string;
    creatorId: number;
    creatorName: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isPublic: boolean;
    playCount: number;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
}

export type QuizDetailResponse = {
    id: number;
    title: string;
    description: string;
    category: {
        id: number;
        name: string;
    };
    creator: {
        id: number;
        username: string;
    };
    difficulty: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    questions: {
        id: number;
        content: string;
        image_url: string | null;
        time_limit: number;
        points: number;
        order_number: number;
    }[];
}

export type QuizListResponse = {
    content: QuizResponse[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export type QuestionResponse = {
    id: number;
    quizId: number;
    quizTitle: string;
    content: string;
    imageUrl: string | null;
    timeLimit: number;
    points: number;
    orderNumber: number;
    createdAt: string;
    updatedAt: string;
    options: QuestionOptionResponse[];
}

export type QuestionOptionResponse = {
    id: number;
    content: string;
    isCorrect: boolean;
}

//-------------------------------------------------------------------------
// Utility Types - Kiểu dữ liệu tiện ích cho các thao tác khác
//-------------------------------------------------------------------------

// Form types (for local state management)
export type FormQuestion = Partial<QuestionRequest> & {
    id: number; // Temporary ID for form handling
    options?: QuestionOptionRequest[];
}

// API Common Response Types
export type ApiResponse<T> = {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
    };
}

export type PaginatedResponse<T> = {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
