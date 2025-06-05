// type cho phép định nghĩa các kiểu dữ liệu cho các đối tượng trong ứng dụng quiz

//-------------------------------------------------------------------------
// Enum Types - Kiểu dữ liệu enum từ backend
//-------------------------------------------------------------------------
export type Role = 'USER' | 'ADMIN';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'QUIZ' | 'TRUE_FALSE' | 'TYPE_ANSWER' | 'QUIZ_AUDIO' | 'QUIZ_VIDEO' | 'CHECKBOX' | 'POLL';

//-------------------------------------------------------------------------
// Request Types - Kiểu dữ liệu cho các yêu cầu từ client đến server
//-------------------------------------------------------------------------

export type LoginRequest = {
    usernameOrEmail: string;
    password: string;
}

export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

export type CategoryRequest = {
    name: string;
    description: string;
    iconFile?: File;
    isActive: boolean;
}

export type QuizRequest = {
    title: string;
    description?: string;
    thumbnailFile: File | string; // Có thể là File hoặc URL
    categoryIds: number[];
    difficulty: Difficulty;
    isPublic: boolean;
    questions?: QuizQuestionRequest[];
}

export type QuizQuestionRequest = {
    content: string;
    imageFile?: File;
    audioFile?: File;
    timeLimit: number;
    points: number;
    orderNumber?: number;
    type: QuestionType;
    options: QuizQuestionOptionRequest[];
}

export type QuizQuestionOptionRequest = {
    content: string;
    isCorrect: boolean;
}

export type QuestionRequest = {
    quizId: number;
    content: string;
    imageFile?: File;
    audioFile?: File;
    timeLimit: number;
    points: number;
    orderNumber: number;
    type: QuestionType;
    options: QuestionOptionRequest[];
}

export type QuestionOptionRequest = {
    content: string;
    isCorrect: boolean;
}

export type RoomRequest = {
    name: string;
    quizId: number;
    maxPlayers: number;
    password?: string;
    isPublic: boolean;
}

export type JoinRoomRequest = {
    roomCode: string;
    guestName?: string;
    password?: string;
}

export type JoinRoomByIdRequest = {
    guestName?: string;
    password?: string;
}

export type ChatMessageRequest = {
    roomId: number;
    message: string;
    guestName?: string;
}

export type UploadAvatarRequest = {
    avatarFile: File;
}

export type TokenRequest = {
    refreshToken: string;
}

export type QuizFilterParams = {
    page?: number;
    pageSize?: number;
    category?: number;
    difficulty?: Difficulty;
    search?: string;
    sort?: 'newest' | 'popular';
    isPublic?: boolean;
    tab?: 'newest' | 'popular';
}

export type QuestionFilterParams = {
    page?: number;
    pageSize?: number;
    quizId?: number;
    type?: QuestionType;
    search?: string;
    sort?: 'newest' | 'oldest' | 'points' | 'difficulty';
    minPoints?: number;
    maxPoints?: number;
    timeLimit?: number;
}

export type UserFilterParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: 'newest' | 'oldest' | 'name' | 'username';
}

//-------------------------------------------------------------------------
// Response Types - Kiểu dữ liệu cho các phản hồi từ server về client
//-------------------------------------------------------------------------

export type AuthResponse = {
    AccessToken: string;
    AccessTokenExpiry: string;
    RefreshToken: string;
    RefreshTokenExpiry: string;
    user: UserResponse;
}

export type UserResponse = {
    id: number;
    username: string;
    email: string;
    fullName: string;
    profileImage?: string;
    createdAt: string;
    updatedAt?: string;
    lastLogin?: string;
    role: Role;
    isActive: boolean;
}

export type CategoryResponse = {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    quizCount: number;
    totalPlayCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export type QuizResponse = {
    id: number;
    title: string;
    description: string;
    quizThumbnails: string;
    categoryIds: number[];
    categoryNames: string[];
    creatorId: number;
    creatorName: string;
    creatorAvatar?: string;
    difficulty: Difficulty;
    isPublic: boolean;
    playCount: number;
    questionCount: number;
    favoriteCount: number;
    createdAt: string;
    updatedAt?: string;
}

export type QuestionResponse = {
    id: number;
    quizId: number;
    quizTitle: string;
    content: string;
    imageUrl?: string;
    audioUrl?: string;
    timeLimit: number;
    points: number;
    orderNumber: number;
    type: QuestionType;
    createdAt: string;
    updatedAt?: string;
    options?: QuestionOptionResponse[];
}

export type QuestionOptionResponse = {
    id: number;
    content: string;
    isCorrect: boolean;
}

export type RoomResponse = {
    id: number;
    name: string;
    code: string;
    quiz: QuizResponse;
    host: UserResponse;
    hasPassword: boolean;
    isPublic: boolean;
    currentPlayerCount: number;
    maxPlayers: number;
    status: string; // RoomStatus as string
    startTime?: string;
    endTime?: string;
    createdAt: string;
    participants: ParticipantResponse[];
}

export type ParticipantResponse = {
    id: number;
    user?: UserResponse;
    score: number;
    isHost: boolean;
    joinedAt: string;
    isGuest: boolean;
    guestName?: string;
}

export type ChatMessageResponse = {
    id: number;
    roomId: number;
    user?: UserResponse;
    isGuest: boolean;
    guestName?: string;
    message: string;
    sentAt: string;
}

export type UserProfileResponse = {
    id: number;
    userId: number;
    username: string; 
    fullName: string;
    profileImage?: string;
    dateOfBirth?: string;
    city?: string;
    phoneNumber?: string;
    totalScore: number;
    quizzesPlayed: number;
    quizzesCreated: number;
    totalQuizPlays: number;
}

export type GameStatusResponse = {
    gameActive: boolean;
    currentQuestion?: any; // Detailed type could be specified later
    remainingTime?: number;
    leaderboard?: any; // Detailed type could be specified later
    questionNumber?: number;
    totalQuestions?: number;
}

export type AchievementResponse = {
    id: number;
    title: string;
    description: string;
    iconUrl: string;
    achievedAt: string;
}

//-------------------------------------------------------------------------
// Utility Types - Kiểu dữ liệu tiện ích cho các thao tác khác
//-------------------------------------------------------------------------

// API Common Response Types
export type ApiResponse<T> = {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export type PageResponse<T> = {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

//-------------------------------------------------------------------------
// Alias Types - Tên ngắn gọn cho các Response Types (recommended)
//-------------------------------------------------------------------------
export type User = UserResponse;
export type Category = CategoryResponse;
export type Quiz = QuizResponse;
export type Question = QuestionResponse;
export type QuestionOption = QuestionOptionResponse;
export type Room = RoomResponse;
export type Participant = ParticipantResponse;
export type ChatMessage = ChatMessageResponse;
export type UserProfile = UserProfileResponse;
export type GameStatus = GameStatusResponse;
export type Achievement = AchievementResponse;

// Legacy compatibility
export type PaginatedResponse<T> = PageResponse<T>;

// Form types (for local state management)
export type FormQuestion = Partial<QuestionRequest> & {
    id: number; // Temporary ID for form handling
    options?: QuestionOptionRequest[];
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
