import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { QuestionAPI } from '@/api/questionAPI';
import {
    QuestionResponse,
    QuestionRequest,
    QuestionType,
    FormQuestion
} from '@/types/database';

/**
 * Hook tùy chỉnh để quản lý câu hỏi
 */
export const useQuestions = (quizId?: number) => {
    const { enqueueSnackbar } = useSnackbar();

    // Quản lý state
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    /**
     * Lấy tất cả câu hỏi
     */
    const fetchAllQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.getAllQuestions();

            if (response.status === 'success' && response.data) {
                setQuestions(response.data);
            } else {
                setError(response.message || 'Failed to fetch questions');
            }
        } catch (err) {
            setError('Error fetching questions');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy câu hỏi theo ID của quiz
     */
    const fetchQuestionsByQuizId = useCallback(async (quizId: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.getQuestionsByQuizId(quizId);

            if (response.status === 'success' && response.data) {
                setQuestions(response.data);
            } else {
                setError(response.message || 'Failed to fetch questions');
            }
        } catch (err) {
            setError('Error fetching questions');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy câu hỏi theo ID
     */
    const getQuestionById = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.getQuestionById(id);

            if (response.status === 'success') {
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch question');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error fetching question');
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Tạo câu hỏi mới
     */
    const createQuestion = useCallback(async (questionRequest: QuestionRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.createQuestionFromRequest(questionRequest);

            if (response.status === 'success' && response.data) {
                // Làm mới danh sách câu hỏi nếu có quizId
                if (quizId) {
                    await fetchQuestionsByQuizId(quizId);
                } else {
                    await fetchAllQuestions();
                }
                enqueueSnackbar('Question created successfully!', { variant: 'success' });
                return response.data;
            } else {
                setError(response.message || 'Failed to create question');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error creating question');
            enqueueSnackbar('Failed to create question', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [quizId, fetchQuestionsByQuizId, fetchAllQuestions, enqueueSnackbar]);

    /**
     * Tạo nhiều câu hỏi
     */
    const createQuestions = useCallback(async (questionRequests: QuestionRequest[]) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.createQuestions(questionRequests);

            if (response.status === 'success' && response.data) {
                // Làm mới danh sách câu hỏi
                if (quizId) {
                    await fetchQuestionsByQuizId(quizId);
                } else {
                    await fetchAllQuestions();
                }
                enqueueSnackbar(`${questionRequests.length} questions created successfully!`, { variant: 'success' });
                return response.data;
            } else {
                setError(response.message || 'Failed to create questions');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error creating questions');
            enqueueSnackbar('Failed to create questions', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [quizId, fetchQuestionsByQuizId, fetchAllQuestions, enqueueSnackbar]);

    /**
     * Cập nhật câu hỏi
     */
    const updateQuestion = useCallback(async (id: number, questionRequest: QuestionRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.updateQuestionFromRequest(id, questionRequest);

            if (response.status === 'success' && response.data) {
                // Cập nhật state local
                setQuestions(prev =>
                    prev.map(q => q.id === id ? response.data! : q)
                );
                enqueueSnackbar('Question updated successfully!', { variant: 'success' });
                return response.data;
            } else {
                setError(response.message || 'Failed to update question');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error updating question');
            enqueueSnackbar('Failed to update question', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    /**
     * Xóa câu hỏi
     */
    const deleteQuestion = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.deleteQuestion(id);

            if (response.status === 'success') {
                // Xóa khỏi state local
                setQuestions(prev => prev.filter(q => q.id !== id));
                enqueueSnackbar('Question deleted successfully!', { variant: 'success' });
                return true;
            } else {
                setError(response.message || 'Failed to delete question');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error deleting question');
            enqueueSnackbar('Failed to delete question', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    /**
     * Sao chép câu hỏi
     */
    const duplicateQuestion = useCallback(async (questionId: number, newQuizId?: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.duplicateQuestion(questionId, newQuizId);

            if (response.status === 'success' && response.data) {
                // Làm mới danh sách câu hỏi
                if (quizId) {
                    await fetchQuestionsByQuizId(quizId);
                } else {
                    await fetchAllQuestions();
                }
                enqueueSnackbar('Question duplicated successfully!', { variant: 'success' });
                return response.data;
            } else {
                setError(response.message || 'Failed to duplicate question');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error duplicating question');
            enqueueSnackbar('Failed to duplicate question', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [quizId, fetchQuestionsByQuizId, fetchAllQuestions, enqueueSnackbar]);

    /**
     * Xóa hàng loạt các câu hỏi đã chọn
     */
    const bulkDeleteQuestions = useCallback(async (questionIds: number[]) => {
        try {
            setLoading(true);
            setError(null);
            const response = await QuestionAPI.bulkDeleteQuestions(questionIds);

            if (response.status === 'success') {
                // Xóa khỏi state local
                setQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
                setSelectedQuestions([]);
                enqueueSnackbar(`${questionIds.length} questions deleted successfully!`, { variant: 'success' });
                return true;
            } else {
                setError(response.message || 'Failed to delete questions');
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error deleting questions');
            enqueueSnackbar('Failed to delete questions', { variant: 'error' });
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    /**
     * Các hàm hỗ trợ cho loại câu hỏi
     */
    const createMultipleChoiceQuestion = useCallback(async (
        quizId: number,
        content: string,
        answers: { content: string; isCorrect: boolean }[],
        options?: Partial<QuestionRequest>
    ) => {
        const questionRequest: QuestionRequest = {
            quizId,
            content,
            timeLimit: 30,
            points: 10,
            orderNumber: questions.length + 1,
            type: 'QUIZ',
            options: answers,
            ...options
        };

        return await createQuestion(questionRequest);
    }, [questions.length, createQuestion]);

    const createTrueFalseQuestion = useCallback(async (
        quizId: number,
        content: string,
        isTrue: boolean,
        options?: Partial<QuestionRequest>
    ) => {
        const answers = [
            { content: 'True', isCorrect: isTrue },
            { content: 'False', isCorrect: !isTrue }
        ];

        const questionRequest: QuestionRequest = {
            quizId,
            content,
            timeLimit: 30,
            points: 10,
            orderNumber: questions.length + 1,
            type: 'TRUE_FALSE',
            options: answers,
            ...options
        };

        return await createQuestion(questionRequest);
    }, [questions.length, createQuestion]);

    /**
     * Quản lý lựa chọn
     */
    const toggleQuestionSelection = useCallback((questionId: number) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    }, []);

    const selectAllQuestions = useCallback(() => {
        setSelectedQuestions(questions.map(q => q.id));
    }, [questions]);

    const clearSelection = useCallback(() => {
        setSelectedQuestions([]);
    }, []);

    /**
     * Tự động lấy câu hỏi khi quizId thay đổi
     */
    useEffect(() => {
        if (quizId) {
            fetchQuestionsByQuizId(quizId);
        }
    }, [quizId, fetchQuestionsByQuizId]);

    return {
        // State
        questions,
        loading,
        error,
        selectedQuestions,

        // Hành động
        fetchAllQuestions,
        fetchQuestionsByQuizId,
        getQuestionById,
        createQuestion,
        createQuestions,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        bulkDeleteQuestions,

        // Phương thức hỗ trợ
        createMultipleChoiceQuestion,
        createTrueFalseQuestion,

        // Quản lý lựa chọn
        toggleQuestionSelection,
        selectAllQuestions,
        clearSelection,

        // Tiện ích
        setError,
        clearError: () => setError(null)
    };
};

export default useQuestions;
