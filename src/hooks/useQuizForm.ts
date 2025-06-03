import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { QuizAPI } from '@/api/quizAPI';
import {
    QuizRequest,
    QuestionOptionRequest,
    QuizQuestionRequest,
    QuizQuestionOptionRequest
} from '@/types/database';

export const useQuizForm = () => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    // State quản lý dữ liệu form
    const [quizData, setQuizData] = useState<QuizRequest>({
        title: '',
        description: '',
        thumbnailFile: '', // Trường bắt buộc - mặc định là chuỗi rỗng
        categoryIds: [],
        difficulty: 'EASY',
        isPublic: false,
        questions: [], // Trường tùy chọn cho câu hỏi
    });

    const [questionOptions, setQuestionOptions] = useState<QuestionOptionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextQuestionId, setNextQuestionId] = useState<number>(1);

    // Thuộc tính tính toán cho câu hỏi từ quizData
    const questions = quizData.questions || [];

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
            thumbnailFile: file || '', // Sử dụng chuỗi rỗng nếu file là null
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
        const newQuestion: QuizQuestionRequest & { id: number } = {
            id: nextQuestionId, // Sử dụng ID tạm cho quản lý form
            content: '',
            timeLimit: 30,
            points: 10,
            orderNumber: questions.length + 1,
            type: 'QUIZ',
            options: [],
        };

        setQuizData(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQuestion]
        }));
        setNextQuestionId(prev => prev + 1);
    }, [questions.length, nextQuestionId]);

    // Xử lý thay đổi nội dung câu hỏi
    const handleQuestionChange = useCallback((questionId: number, data: Partial<QuizQuestionRequest>) => {
        setQuizData(prev => ({
            ...prev,
            questions: (prev.questions || []).map(q =>
                (q as any).id === questionId ? { ...q, ...data } : q
            )
        }));
    }, []);

    // Xử lý thay đổi file hình ảnh cho câu hỏi
    const handleQuestionImageChange = useCallback((questionId: number, file: File | null) => {
        setQuizData(prev => ({
            ...prev,
            questions: (prev.questions || []).map(q =>
                (q as any).id === questionId ? {
                    ...q,
                    imageFile: file || undefined,
                } : q
            )
        }));
    }, []);

    // Xóa câu hỏi
    const handleRemoveQuestion = useCallback((questionId: number) => {
        setQuizData(prev => {
            const filteredQuestions = (prev.questions || []).filter(q => (q as any).id !== questionId);
            // Cập nhật lại orderNumber cho các câu hỏi
            const reorderedQuestions = filteredQuestions.map((q, index) => ({
                ...q,
                orderNumber: index + 1
            }));

            return {
                ...prev,
                questions: reorderedQuestions
            };
        });
    }, []);

    // Xử lý submit form tạo quiz
    const handleQuizSubmit = useCallback(async () => {
        // Kiểm tra tính hợp lệ của form trước khi submit
        if (!quizData.title.trim()) {
            setError('Quiz title is required');
            return;
        }

        if (!quizData.thumbnailFile) {
            setError('Quiz thumbnail is required');
            return;
        }

        if (!quizData.categoryIds || quizData.categoryIds.length === 0) {
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

            const hasCorrectAnswer = question.options.some((a: QuizQuestionOptionRequest) => a.isCorrect);
            if (!hasCorrectAnswer) {
                setError('Each question must have at least one correct answer');
                return;
            }

            const allAnswersHaveContent = question.options.every((a: QuizQuestionOptionRequest) => a.content.trim());
            if (!allAnswersHaveContent) {
                setError('All answers must have content');
                return;
            }
        }

        setError(null);
        setIsLoading(true);

        try {
            // Làm sạch dữ liệu câu hỏi - xóa trường ID tạm thời
            const cleanQuestions = questions.map(q => {
                const { id, ...cleanQuestion } = q as any;
                return {
                    content: cleanQuestion.content || '',
                    imageFile: cleanQuestion.imageFile,
                    audioFile: cleanQuestion.audioFile,
                    timeLimit: cleanQuestion.timeLimit || 30,
                    points: cleanQuestion.points || 10,
                    orderNumber: cleanQuestion.orderNumber || 1,
                    type: cleanQuestion.type || 'QUIZ',
                    options: cleanQuestion.options || []
                } as QuizQuestionRequest;
            });

            const completeQuizData = {
                ...quizData,
                questions: cleanQuestions
            };

            // Sử dụng QuizAPI để tạo quiz
            const response = await QuizAPI.createQuizFromRequest(completeQuizData);

            if (response.status !== 'success' || !response.data) {
                throw new Error(response.message || 'Failed to create quiz');
            }

            const quizId = response.data.id;

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
        setQuestionOptions,
        setNextQuestionId,
        handleQuizChange,
        handleThumbnailChange,
        handleAddQuestion,
        handleQuestionChange,
        handleQuestionImageChange,
        handleRemoveQuestion,
        handleQuizSubmit
    };
};