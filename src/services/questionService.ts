import axiosInstance from '@/utils/axios';
import { QUESTION_ENDPOINTS } from '@/constants/apiEndpoints';
import {
    ApiResponse,
    QuestionRequest,
    QuestionResponse,
    QuestionFilterParams,
    PageResponse,
    QuestionType
} from '@/types/database';

/**
 * Question Service - Xử lý các API calls liên quan đến câu hỏi
 */
class QuestionService {
    /**
     * Lấy danh sách tất cả các câu hỏi
     * GET /api/questions
     */
    async getAllQuestions(): Promise<ApiResponse<QuestionResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuestionResponse[]>>(
                QUESTION_ENDPOINTS.LIST
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching all questions:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách các câu hỏi với phân trang và lọc
     * GET /api/questions/search
     */
    async getQuestionsWithFilter(filters: QuestionFilterParams = {}): Promise<ApiResponse<PageResponse<QuestionResponse>>> {
        try {
            const params = new URLSearchParams();

            // Thêm các tham số phân trang
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) params.append('size', filters.pageSize.toString());

            // Thêm các tham số lọc
            if (filters.quizId) params.append('quizId', filters.quizId.toString());
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.minPoints !== undefined) params.append('minPoints', filters.minPoints.toString());
            if (filters.maxPoints !== undefined) params.append('maxPoints', filters.maxPoints.toString());
            if (filters.timeLimit !== undefined) params.append('timeLimit', filters.timeLimit.toString());

            const response = await axiosInstance.get<ApiResponse<PageResponse<QuestionResponse>>>(
                `${QUESTION_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered questions:', error);
            throw error;
        }
    }

    /**
     * Tìm kiếm câu hỏi theo từ khóa
     * GET /api/questions/search?q={keyword}
     */
    async searchQuestions(keyword: string, page = 0, pageSize = 10): Promise<ApiResponse<PageResponse<QuestionResponse>>> {
        try {
            const params = new URLSearchParams({
                q: keyword,
                page: page.toString(),
                size: pageSize.toString()
            });

            const response = await axiosInstance.get<ApiResponse<PageResponse<QuestionResponse>>>(
                `${QUESTION_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error searching questions:', error);
            throw error;
        }
    }

    /**
     * Lấy câu hỏi theo ID
     * GET /api/questions/{id}
     */
    async getQuestionById(id: number): Promise<ApiResponse<QuestionResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuestionResponse>>(
                QUESTION_ENDPOINTS.GET_BY_ID(id)
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching question with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Lấy danh sách các câu hỏi theo quiz ID
     * GET /api/questions/quiz/{quizId}
     */
    async getQuestionsByQuizId(quizId: number): Promise<ApiResponse<QuestionResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuestionResponse[]>>(
                QUESTION_ENDPOINTS.GET_BY_QUIZ_ID(quizId)
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching questions for quiz ID ${quizId}:`, error);
            throw error;
        }
    }

    /**
     * Tạo mới câu hỏi
     * POST /api/questions
     */
    async createQuestion(questionRequest: QuestionRequest): Promise<ApiResponse<QuestionResponse>> {
        try {
            // Xử lý FormData cho file upload
            const formData = new FormData();

            // Thêm các trường dữ liệu cơ bản
            formData.append('quizId', questionRequest.quizId.toString());
            formData.append('content', questionRequest.content);
            formData.append('timeLimit', questionRequest.timeLimit.toString());
            formData.append('points', questionRequest.points.toString());
            formData.append('orderNumber', questionRequest.orderNumber.toString());
            formData.append('type', questionRequest.type);

            // Thêm file hình ảnh nếu có
            if (questionRequest.imageFile) {
                formData.append('imageFile', questionRequest.imageFile);
            }

            // Thêm file audio nếu có
            if (questionRequest.audioFile) {
                formData.append('audioFile', questionRequest.audioFile);
            }

            // Thêm options (câu trả lời)
            questionRequest.options.forEach((option, index) => {
                formData.append(`options[${index}].content`, option.content);
                formData.append(`options[${index}].isCorrect`, option.isCorrect.toString());
            });

            const response = await axiosInstance.post<ApiResponse<QuestionResponse>>(
                QUESTION_ENDPOINTS.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    }

    /**
     * Tạo danh sách câu hỏi mới
     * POST /api/questions/batch
     */
    async createQuestions(questionRequests: QuestionRequest[]): Promise<ApiResponse<QuestionResponse[]>> {
        try {
            const formData = new FormData();

            // Thêm từng câu hỏi vào FormData
            questionRequests.forEach((questionRequest, questionIndex) => {
                formData.append(`questions[${questionIndex}].quizId`, questionRequest.quizId.toString());
                formData.append(`questions[${questionIndex}].content`, questionRequest.content);
                formData.append(`questions[${questionIndex}].timeLimit`, questionRequest.timeLimit.toString());
                formData.append(`questions[${questionIndex}].points`, questionRequest.points.toString());
                formData.append(`questions[${questionIndex}].orderNumber`, questionRequest.orderNumber.toString());
                formData.append(`questions[${questionIndex}].type`, questionRequest.type);

                // Thêm file hình ảnh nếu có
                if (questionRequest.imageFile) {
                    formData.append(`questions[${questionIndex}].imageFile`, questionRequest.imageFile);
                }

                // Thêm file audio nếu có
                if (questionRequest.audioFile) {
                    formData.append(`questions[${questionIndex}].audioFile`, questionRequest.audioFile);
                }

                // Thêm options cho từng câu hỏi
                questionRequest.options.forEach((option, optionIndex) => {
                    formData.append(`questions[${questionIndex}].options[${optionIndex}].content`, option.content);
                    formData.append(`questions[${questionIndex}].options[${optionIndex}].isCorrect`, option.isCorrect.toString());
                });
            });

            const response = await axiosInstance.post<ApiResponse<QuestionResponse[]>>(
                QUESTION_ENDPOINTS.CREATE_BATCH,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating questions batch:', error);
            throw error;
        }
    }

    /**
     * Cập nhật thông tin câu hỏi
     * PUT /api/questions/{id}
     */
    async updateQuestion(id: number, questionRequest: QuestionRequest): Promise<ApiResponse<QuestionResponse>> {
        try {
            // Xử lý FormData cho file upload
            const formData = new FormData();

            // Thêm các trường dữ liệu cơ bản
            formData.append('quizId', questionRequest.quizId.toString());
            formData.append('content', questionRequest.content);
            formData.append('timeLimit', questionRequest.timeLimit.toString());
            formData.append('points', questionRequest.points.toString());
            formData.append('orderNumber', questionRequest.orderNumber.toString());
            formData.append('type', questionRequest.type);

            // Thêm file hình ảnh nếu có
            if (questionRequest.imageFile) {
                formData.append('imageFile', questionRequest.imageFile);
            }

            // Thêm file audio nếu có
            if (questionRequest.audioFile) {
                formData.append('audioFile', questionRequest.audioFile);
            }

            // Thêm options (câu trả lời)
            questionRequest.options.forEach((option, index) => {
                formData.append(`options[${index}].content`, option.content);
                formData.append(`options[${index}].isCorrect`, option.isCorrect.toString());
            });

            const response = await axiosInstance.put<ApiResponse<QuestionResponse>>(
                QUESTION_ENDPOINTS.UPDATE(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating question with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Xóa câu hỏi
     * DELETE /api/questions/{id}
     */
    async deleteQuestion(id: number): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(
                QUESTION_ENDPOINTS.DELETE(id)
            );
            return response.data;
        } catch (error) {
            console.error(`Error deleting question with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Xóa nhiều câu hỏi cùng lúc
     * DELETE /api/questions/bulk-delete
     */
    async bulkDeleteQuestions(questionIds: number[]): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(
                QUESTION_ENDPOINTS.BULK_DELETE,
                {
                    data: { questionIds }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error bulk deleting questions:', error);
            throw error;
        }
    }

    /**
     * Cập nhật nhiều câu hỏi cùng lúc
     * PUT /api/questions/bulk-update
     */
    async bulkUpdateQuestions(updates: Array<{ id: number; data: Partial<QuestionRequest> }>): Promise<ApiResponse<QuestionResponse[]>> {
        try {
            const response = await axiosInstance.put<ApiResponse<QuestionResponse[]>>(
                QUESTION_ENDPOINTS.BULK_UPDATE,
                { updates }
            );
            return response.data;
        } catch (error) {
            console.error('Error bulk updating questions:', error);
            throw error;
        }
    }

    /**
     * Sao chép câu hỏi
     * POST /api/questions/{id}/copy
     */
    async copyQuestion(id: number, targetQuizId?: number): Promise<ApiResponse<QuestionResponse>> {
        try {
            const requestData = targetQuizId ? { targetQuizId } : {};
            const response = await axiosInstance.post<ApiResponse<QuestionResponse>>(
                QUESTION_ENDPOINTS.COPY(id),
                requestData
            );
            return response.data;
        } catch (error) {
            console.error(`Error copying question with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Sắp xếp lại thứ tự câu hỏi
     * PUT /api/questions/reorder
     */
    async reorderQuestions(questionOrders: Array<{ id: number; orderNumber: number }>): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.put<ApiResponse<void>>(
                QUESTION_ENDPOINTS.REORDER,
                { questionOrders }
            );
            return response.data;
        } catch (error) {
            console.error('Error reordering questions:', error);
            throw error;
        }
    }

    /**
     * Import câu hỏi từ file
     * POST /api/questions/import
     */
    async importQuestions(file: File, quizId: number): Promise<ApiResponse<{ success: number; failed: number; errors?: string[] }>> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('quizId', quizId.toString());

            const response = await axiosInstance.post<ApiResponse<{ success: number; failed: number; errors?: string[] }>>(
                QUESTION_ENDPOINTS.IMPORT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error importing questions:', error);
            throw error;
        }
    }

    /**
     * Export câu hỏi ra file
     * GET /api/questions/export
     */
    async exportQuestions(filters: QuestionFilterParams = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
        try {
            const params = new URLSearchParams();
            params.append('format', format);

            // Thêm các tham số lọc
            if (filters.quizId) params.append('quizId', filters.quizId.toString());
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
            if (filters.minPoints !== undefined) params.append('minPoints', filters.minPoints.toString());
            if (filters.maxPoints !== undefined) params.append('maxPoints', filters.maxPoints.toString());

            const response = await axiosInstance.get(
                `${QUESTION_ENDPOINTS.EXPORT}?${params.toString()}`,
                {
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error exporting questions:', error);
            throw error;
        }
    }

    // Utility methods for question management

    /**
     * Lấy thống kê tổng quan về câu hỏi
     */
    async getQuestionStats(filters: QuestionFilterParams = {}): Promise<ApiResponse<{
        totalQuestions: number;
        questionsByType: Record<QuestionType, number>;
        averagePoints: number;
        averageTimeLimit: number;
        totalPoints: number;
    }>> {
        try {
            const params = new URLSearchParams();
            if (filters.quizId) params.append('quizId', filters.quizId.toString());
            if (filters.type) params.append('type', filters.type);

            const response = await axiosInstance.get<ApiResponse<{
                totalQuestions: number;
                questionsByType: Record<QuestionType, number>;
                averagePoints: number;
                averageTimeLimit: number;
                totalPoints: number;
            }>>(
                `${QUESTION_ENDPOINTS.SEARCH}/stats?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching question stats:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra tính hợp lệ của file import
     */
    validateImportFile(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Kiểm tra loại file
        const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type)) {
            errors.push('Chỉ hỗ trợ file CSV và JSON');
        }

        // Kiểm tra kích thước file (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push('File quá lớn. Kích thước tối đa là 10MB');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Export singleton instance
export const questionService = new QuestionService();
export default questionService;
