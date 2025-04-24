// type cho phép định nghĩa các kiểu dữ liệu cho các đối tượng trong ứng dụng quiz
export type Category = {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    quizCount: number;
    totalPlayCount: number;
    createAt?: string;
    updatedAt?: string;
}

export type Quiz = {
    id: number;
    title: string;
    description: string;
    quizThumbUrls?: string;
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

export type Activity = {
    id: number;
    user: string;
    action: string;
    quiz: string;
    score: string;
    time: string;
    status: 'success' | 'processing' | 'error' | 'warning';
}