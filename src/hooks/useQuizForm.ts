import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { QuizAPI } from '@/api/quizAPI';
import {
    Quiz,
    Question,
    QuestionOption,
    QuizRequest,
    QuizResponse,
    QuestionRequest,
    QuestionResponse,
    QuestionOptionRequest,
    ApiResponse,
    FormQuestion
} from '@/types/database';

export const useQuizForm = () => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();    // State quản lý dữ liệu form
    const [quizData, setQuizData] = useState<QuizRequest>({
        title: '',
        description: '',
        categoryIds: [],
        difficulty: 'EASY',
        isPublic: false,
    });

    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [questionOptions, setQuestionOptions] = useState<QuestionOptionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextQuestionId, setNextQuestionId] = useState<number>(1);

    // Xử lý thay đổi thông tin cơ bản của quiz
    const handleQuizChange = useCallback((field: string, value: any) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);    
    
    // Xử lý thay đổi file thumbnail
    const handleThumbnailChange = useCallback((file: File | null) => {
        setQuizData(prev => ({
            ...prev,
            thumbnailFile: file || undefined,
        }));
    }, []);

    // Thêm câu hỏi mới
    const handleAddQuestion = useCallback((quizId: number) => {
        // Kiểm tra xem quizId có hợp lệ không
        if (!quizId) {
            setError('Invalid quiz ID');
            return;
        }

        // Tạo câu hỏi mới với các giá trị mặc định
        const newQuestion: FormQuestion = {
            id: nextQuestionId, // Sử dụng ID tạm cho quản lý form
            quizId: quizId,
            content: '',
            timeLimit: 30,
            points: 10,
            orderNumber: questions.length + 1,
            options: [],
        };

        setQuestions(prev => [...prev, newQuestion]);
        setNextQuestionId(prev => prev + 1);
    }, [questions.length, nextQuestionId]);

    // Xử lý thay đổi nội dung câu hỏi
    const handleQuestionChange = useCallback((questionId: number, data: Partial<FormQuestion>) => {
        setQuestions(prev =>
            prev.map(q => q.id === questionId ? { ...q, ...data } : q)
        );
    }, []);    
    
    // Xử lý thay đổi file hình ảnh cho câu hỏi
    const handleQuestionImageChange = useCallback((questionId: number, file: File | null) => {
        setQuestions(prev =>
            prev.map(q => q.id === questionId ? {
                ...q,
                imageFile: file || undefined,
            } : q)
        );
    }, []);

    // Xóa câu hỏi
    const handleRemoveQuestion = useCallback((questionId: number) => {
        setQuestions(prev => {
            const filteredQuestions = prev.filter(q => q.id !== questionId);
            // Cập nhật lại orderNumber cho các câu hỏi
            return filteredQuestions.map((q, index) => ({
                ...q,
                orderNumber: index + 1
            }));
        });
    }, []);

    // Xử lý submit form tạo quiz
    const handleQuizSubmit = useCallback(async () => {
        // Validate form trước khi submit
        if (!quizData.title.trim()) {
            setError('Quiz title is required');
            return;
        } if (!quizData.categoryIds || quizData.categoryIds.length === 0) {
            setError('At least one category is required');
            return;
        }

        if (questions.length === 0) {
            setError('Quiz must have at least one question');
            return;
        }

        // Kiểm tra các câu hỏi
        for (const question of questions) {
            if (!question.content?.trim()) {
                setError('All questions must have content');
                return;
            }

            if (!question.options || question.options.length === 0) {
                setError('Each question must have options');
                return;
            }

            const hasCorrectAnswer = question.options.some(a => a.isCorrect);
            if (!hasCorrectAnswer) {
                setError('Each question must have at least one correct answer');
                return;
            }

            const allAnswersHaveContent = question.options.every(a => a.content.trim());
            if (!allAnswersHaveContent) {
                setError('All answers must have content');
                return;
            }
        }

        setError(null);
        setIsLoading(true); try {
            // Sử dụng QuizAPI để tạo quiz
            const response = await QuizAPI.createQuizFromRequest(quizData);

            if (response.status !== 'success' || !response.data) {
                throw new Error(response.message || 'Failed to create quiz');
            } const quizId = response.data.id;

            // Note: In a real implementation, you would need to create a separate API
            // for handling questions. For now, we'll skip the question creation
            // and just show success message for the quiz creation.

            // TODO: Implement question creation API calls when backend is ready
            // This would involve calling something like:
            // await QuestionAPI.createQuestion(quizId, questionData)

            enqueueSnackbar('Quiz created successfully!', { variant: 'success' });
            router.push('/quizzes');
        } catch (err) {
            console.error('Error creating quiz:', err);
            setError('Failed to create quiz. Please try again.');
            enqueueSnackbar('Failed to create quiz', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [quizData, questions, questionOptions, enqueueSnackbar, router]);

    return {
        quizData,
        questions,
        isLoading,
        error,
        setQuizData,
        setQuestions,
        setQuestionOptions,
        handleQuizChange,
        handleThumbnailChange,
        handleAddQuestion,
        handleQuestionChange,
        handleQuestionImageChange,
        handleRemoveQuestion,
        handleQuizSubmit
    };
};