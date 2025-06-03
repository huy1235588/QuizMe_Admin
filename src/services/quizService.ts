import axiosInstance from '@/utils/axios';
import { QUIZ_ENDPOINTS } from '@/constants/apiEndpoints';
import {
    ApiResponse,
    QuizResponse,
    QuizRequest,
    QuizFilterParams,
    PageResponse,
    Difficulty
} from '@/types/database';

class QuizService {
    /**
     * Lấy danh sách tất cả các quiz
     */
    async getAllQuizzes(): Promise<ApiResponse<QuizResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuizResponse[]>>(
                QUIZ_ENDPOINTS.LIST
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy quiz theo ID
     */
    async getQuizById(id: number): Promise<ApiResponse<QuizResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuizResponse>>(
                QUIZ_ENDPOINTS.GET_BY_ID(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy danh sách các quiz công khai
     */
    async getPublicQuizzes(): Promise<ApiResponse<QuizResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuizResponse[]>>(
                QUIZ_ENDPOINTS.PUBLIC
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy danh sách các quiz theo độ khó
     */
    async getQuizzesByDifficulty(difficulty: Difficulty): Promise<ApiResponse<QuizResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<QuizResponse[]>>(
                QUIZ_ENDPOINTS.BY_DIFFICULTY(difficulty)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy danh sách các quiz theo phân trang và lọc
     */
    async getPagedQuizzes(params: QuizFilterParams): Promise<ApiResponse<PageResponse<QuizResponse>>> {
        try {
            const queryParams = new URLSearchParams();

            // Thêm các tham số vào query string
            if (params.page !== undefined) queryParams.append('page', params.page.toString());
            if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
            if (params.category !== undefined) queryParams.append('category', params.category.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.difficulty) queryParams.append('difficulty', params.difficulty);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
            if (params.tab) queryParams.append('tab', params.tab);

            const response = await axiosInstance.get<ApiResponse<PageResponse<QuizResponse>>>(
                `${QUIZ_ENDPOINTS.PAGED}?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Tạo mới quiz
     */
    async createQuiz(quizRequest: QuizRequest): Promise<ApiResponse<QuizResponse>> {
        try {
            const formData = new FormData();

            // Thêm các trường dữ liệu vào FormData
            formData.append('title', quizRequest.title);
            formData.append('description', quizRequest.description || '');
            formData.append('difficulty', quizRequest.difficulty);
            formData.append('isPublic', quizRequest.isPublic.toString());

            // Thêm các câu hỏi vào FormData
            quizRequest.questions?.forEach((question, index) => {
                formData.append(`questions[${index}].content`, question.content);
                formData.append(`questions[${index}].timeLimit`, question.timeLimit.toString());
                formData.append(`questions[${index}].points`, question.points.toString());
                formData.append(`questions[${index}].orderNumber`, question.orderNumber?.toString() || '0');
                formData.append(`questions[${index}].type`, question.type);

                // Thêm file hình ảnh nếu có
                if (question.imageFile) {
                    formData.append(`questions[${index}].imageFile`, question.imageFile);
                }

                // Thêm các tùy chọn câu hỏi
                question.options.forEach((option, optionIndex) => {
                    formData.append(
                        `questions[${index}].options[${optionIndex}].content`,
                        option.content
                    );
                    formData.append(
                        `questions[${index}].options[${optionIndex}].isCorrect`,
                        option.isCorrect.toString()
                    );
                });
            });

            // Thêm categoryIds
            quizRequest.categoryIds.forEach(categoryId => {
                formData.append('categoryIds', categoryId.toString());
            });

            // Thêm file thumbnail nếu có
            if (quizRequest.thumbnailFile) {
                formData.append('thumbnailFile', quizRequest.thumbnailFile);
            }

            const response = await axiosInstance.post<ApiResponse<QuizResponse>>(
                QUIZ_ENDPOINTS.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cập nhật thông tin quiz
     */
    async updateQuiz(id: number, quizRequest: QuizRequest): Promise<ApiResponse<QuizResponse>> {
        try {
            const formData = new FormData();

            // Thêm các trường dữ liệu vào FormData
            formData.append('title', quizRequest.title);
            formData.append('description', quizRequest.description || ''); // Có thể để trống nếu không có mô tả
            formData.append('difficulty', quizRequest.difficulty);
            formData.append('isPublic', quizRequest.isPublic.toString());

            // Thêm categoryIds
            quizRequest.categoryIds.forEach(categoryId => {
                formData.append('categoryIds', categoryId.toString());
            });

            // Thêm file thumbnail nếu có
            if (quizRequest.thumbnailFile && quizRequest.thumbnailFile instanceof File) {
                formData.append('thumbnailFile', quizRequest.thumbnailFile);
            }

            const response = await axiosInstance.put<ApiResponse<QuizResponse>>(
                QUIZ_ENDPOINTS.UPDATE(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Xóa quiz
     */
    async deleteQuiz(id: number): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(
                QUIZ_ENDPOINTS.DELETE(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Publish quiz (nếu cần thêm endpoint này)
     */
    async publishQuiz(id: number): Promise<ApiResponse<QuizResponse>> {
        try {
            const response = await axiosInstance.patch<ApiResponse<QuizResponse>>(
                QUIZ_ENDPOINTS.PUBLISH(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Unpublish quiz (nếu cần thêm endpoint này)
     */
    async unpublishQuiz(id: number): Promise<ApiResponse<QuizResponse>> {
        try {
            const response = await axiosInstance.patch<ApiResponse<QuizResponse>>(
                QUIZ_ENDPOINTS.UNPUBLISH(id)
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Export instance
const quizService = new QuizService();
export default quizService;

// Export class for type checking
export { QuizService };
