// Interface cho phép định nghĩa các kiểu dữ liệu cho các đối tượng trong ứng dụng quiz

export interface StatItem {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    quiz_count: number;
    total_play_count: number;
    icon_url?: string;
}

export interface Quiz {
    id: number;
    title: string;
    category_name: string;
    category_id: number;
    difficulty: 'easy' | 'medium' | 'hard';
    question_count: number;
    play_count: number;
    is_public: boolean;
}

export interface Activity {
    id: number;
    user: string;
    action: string;
    quiz: string;
    score: string;
    time: string;
    status: 'success' | 'processing' | 'error' | 'warning';
}