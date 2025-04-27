import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axios';

// Định nghĩa kiểu dữ liệu cho câu hỏi và câu trả lời
interface Answer {
    id: string;
    content: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    content: string;
    imageUrl?: string;
    timeLimit: number;
    points: number;
    answers: Answer[];
}

// Định nghĩa kiểu dữ liệu cho quiz
interface QuizFormData {
    title: string;
    description: string;
    categoryId: number | null;
    difficulty: 'easy' | 'medium' | 'hard';
    isPublic: boolean;
    thumbnailUrl?: string;
}

export const useQuizForm = () => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    // State quản lý dữ liệu form
    const [quizData, setQuizData] = useState<QuizFormData>({
        title: '',
        description: '',
        categoryId: null,
        difficulty: 'medium',
        isPublic: false,
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Xử lý thay đổi thông tin cơ bản của quiz
    const handleQuizChange = useCallback((field: string, value: any) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Thêm câu hỏi mới
    const handleAddQuestion = useCallback(() => {
        const newQuestion: Question = {
            id: `question_${Date.now()}`,
            content: '',
            timeLimit: 30,
            points: 10,
            answers: [
                { id: `answer_${Date.now()}_1`, content: '', isCorrect: true },
                { id: `answer_${Date.now()}_2`, content: '', isCorrect: false },
                { id: `answer_${Date.now()}_3`, content: '', isCorrect: false },
                { id: `answer_${Date.now()}_4`, content: '', isCorrect: false },
            ]
        };

        setQuestions(prev => [...prev, newQuestion]);
    }, []);

    // Xử lý thay đổi nội dung câu hỏi
    const handleQuestionChange = useCallback((questionId: string, data: Partial<Question>) => {
        setQuestions(prev =>
            prev.map(q => q.id === questionId ? { ...q, ...data } : q)
        );
    }, []);

    // Xóa câu hỏi
    const handleRemoveQuestion = useCallback((questionId: string) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
    }, []);

    // Xử lý submit form tạo quiz
    const handleQuizSubmit = useCallback(async () => {
        // Validate form trước khi submit
        if (!quizData.title.trim()) {
            setError('Quiz title is required');
            return;
        }

        if (!quizData.categoryId) {
            setError('Category is required');
            return;
        }

        if (questions.length === 0) {
            setError('Quiz must have at least one question');
            return;
        }

        // Kiểm tra các câu hỏi
        for (const question of questions) {
            if (!question.content.trim()) {
                setError('All questions must have content');
                return;
            }

            const hasCorrectAnswer = question.answers.some(a => a.isCorrect);
            if (!hasCorrectAnswer) {
                setError('Each question must have at least one correct answer');
                return;
            }

            const allAnswersHaveContent = question.answers.every(a => a.content.trim());
            if (!allAnswersHaveContent) {
                setError('All answers must have content');
                return;
            }
        }

        setError(null);
        setIsLoading(true);

        try {
            // Trong môi trường thực tế, sẽ gọi API để tạo quiz
            // const response = await axiosInstance.post('/api/quizzes', {
            //   ...quizData,
            //   questions
            // });

            // Giả lập gọi API trong demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            enqueueSnackbar('Quiz created successfully!', { variant: 'success' });
            router.push('/quizzes');
        } catch (err) {
            console.error('Error creating quiz:', err);
            setError('Failed to create quiz. Please try again.');
            enqueueSnackbar('Failed to create quiz', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [quizData, questions, enqueueSnackbar, router]);

    return {
        quizData,
        questions,
        isLoading,
        error,
        setQuizData,
        setQuestions,
        handleQuizChange,
        handleAddQuestion,
        handleQuestionChange,
        handleRemoveQuestion,
        handleQuizSubmit
    };
};