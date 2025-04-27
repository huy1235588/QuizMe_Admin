import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axios';
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
    const router = useRouter();

    // State quản lý dữ liệu form
    const [quizData, setQuizData] = useState<QuizRequest>({
        title: '',
        description: '',
        categoryId: -1,
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
            quizThumbnails: file || undefined,
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
                imageUrl: file || undefined,
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
        }

        if (!quizData.categoryId || quizData.categoryId === -1) {
            setError('Category is required');
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
        setIsLoading(true);

        try {
            // Tạo FormData cho quiz
            const quizFormData = new FormData();
            quizFormData.append('title', quizData.title);
            quizFormData.append('description', quizData.description || '');
            quizFormData.append('categoryId', quizData.categoryId?.toString() || '');
            quizFormData.append('difficulty', quizData.difficulty);
            quizFormData.append('isPublic', quizData.isPublic.toString());

            if (quizData.quizThumbnails instanceof File) {
                quizFormData.append('thumbnailFile', quizData.quizThumbnails);
            }

            // Gọi API tạo quiz
            const response = await axiosInstance.post<ApiResponse<QuizResponse>>('/api/quizzes', quizFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const quizResponse = response.data.data;
            if (!quizResponse) {
                throw new Error('Failed to create quiz');
            }

            const quizId = quizResponse.id;

            // Tạo các câu hỏi
            for (const question of questions) {
                const questionFormData = new FormData();
                questionFormData.append('quizId', quizId.toString());
                questionFormData.append('content', question.content || '');
                questionFormData.append('timeLimit', question.timeLimit?.toString() || '30');
                questionFormData.append('points', question.points?.toString() || '10');
                questionFormData.append('orderNumber', (question.orderNumber || 0).toString());

                if (question.imageUrl instanceof File) {
                    questionFormData.append('imageFile', question.imageUrl);
                }

                // Thêm các options (answers)
                question.options?.forEach((option, index) => {
                    questionFormData.append(`options[${index}].content`, option.content);
                    questionFormData.append(`options[${index}].isCorrect`, option.isCorrect.toString());
                });

                // Gọi API tạo câu hỏi
                await axiosInstance.post<ApiResponse<QuestionResponse>>('/api/questions', questionFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

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