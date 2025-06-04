import { quizService } from '@/services';
import { QuizRequest, QuizFilterParams, Difficulty } from '@/types/database';

/**
 * Quiz API Helper - Utility functions for quiz operations
 */
export class QuizAPI {
    /**
     * Lấy danh sách tất cả các quiz
     */
    static async getAllQuizzes() {
        return await quizService.getAllQuizzes();
    }

    /**
     * Lấy quiz theo ID
     */
    static async getQuizById(id: number) {
        return await quizService.getQuizById(id);
    }

    /**
     * Lấy danh sách các quiz công khai
     */
    static async getPublicQuizzes() {
        return await quizService.getPublicQuizzes();
    }

    /**
     * Lấy danh sách các quiz theo độ khó
     */
    static async getQuizzesByDifficulty(difficulty: Difficulty) {
        return await quizService.getQuizzesByDifficulty(difficulty);
    }

    /**
     * Lấy danh sách các quiz theo phân trang và lọc
     */
    static async getPagedQuizzes(params: QuizFilterParams = {}) {
        const defaultParams: QuizFilterParams = {
            page: 0,
            pageSize: 10,
            ...params
        };
        return await quizService.getPagedQuizzes(defaultParams);
    }

    /**
     * Lấy quiz theo phân trang với bộ lọc nâng cao
     */
    static async getFilteredQuizzes(
        page: number = 0,
        pageSize: number = 10,
        categoryId?: number,
        search?: string,
        difficulty?: Difficulty,
        sort?: "newest" | "popular" | undefined,
        isPublic?: boolean,
        tab?: 'newest' | 'popular'
    ) {
        const params: QuizFilterParams = {
            page,
            pageSize,
            category: categoryId,
            search,
            difficulty,
            sort,
            isPublic,
            tab
        };
        return await quizService.getPagedQuizzes(params);
    }

    /**
     * Tìm kiếm quiz theo từ khóa
     */
    static async searchQuizzes(
        searchTerm: string,
        page: number = 0,
        pageSize: number = 10
    ) {
        return await QuizAPI.getPagedQuizzes({
            search: searchTerm,
            page,
            pageSize
        });
    }

    /**
     * Lấy quiz theo category
     */
    static async getQuizzesByCategory(
        categoryId: number,
        page: number = 0,
        pageSize: number = 10
    ) {
        return await QuizAPI.getPagedQuizzes({
            category: categoryId,
            page,
            pageSize
        });
    }

    /**
     * Lấy quiz mới nhất
     */
    static async getNewestQuizzes(
        page: number = 0,
        pageSize: number = 10
    ) {
        return await QuizAPI.getPagedQuizzes({
            sort: 'newest',
            tab: 'newest',
            page,
            pageSize
        });
    }

    /**
     * Lấy quiz phổ biến nhất
     */
    static async getPopularQuizzes(
        page: number = 0,
        pageSize: number = 10
    ) {
        return await QuizAPI.getPagedQuizzes({
            sort: 'popular',
            tab: 'popular',
            page,
            pageSize
        });
    }

    /**
     * Tạo mới quiz
     */
    static async createQuiz(
        title: string,
        description: string,
        categoryIds: number[],
        difficulty: Difficulty,
        isPublic: boolean = true,
        thumbnailFile: File | string // Có thể là File hoặc URL
    ) {
        const quizRequest: QuizRequest = {
            title,
            description,
            categoryIds,
            difficulty,
            isPublic,
            thumbnailFile
        };

        return await quizService.createQuiz(quizRequest);
    }

    /**
     * Tạo quiz với đối tượng QuizRequest
     */
    static async createQuizFromRequest(quizRequest: QuizRequest) {
        return await quizService.createQuiz(quizRequest);
    }

    /**
     * Cập nhật thông tin quiz
     */
    static async updateQuiz(
        id: number,
        title: string,
        description: string,
        categoryIds: number[],
        difficulty: Difficulty,
        isPublic: boolean,
        thumbnailFile: File | string // Có thể là File hoặc URL
    ) {
        const quizRequest: QuizRequest = {
            title,
            description,
            categoryIds,
            difficulty,
            isPublic,
            thumbnailFile
        };

        return await quizService.updateQuiz(id, quizRequest);
    }

    /**
     * Cập nhật quiz với đối tượng QuizRequest
     */
    static async updateQuizFromRequest(id: number, quizRequest: QuizRequest) {
        return await quizService.updateQuiz(id, quizRequest);
    }

    /**
     * Cập nhật một phần thông tin quiz
     */
    static async partialUpdateQuiz(
        id: number,
        updates: Partial<QuizRequest>
    ) {
        // Lấy thông tin quiz hiện tại
        const currentQuizResponse = await quizService.getQuizById(id);
        if (currentQuizResponse.status !== 'success' || !currentQuizResponse.data) {
            throw new Error('Quiz not found');
        }

        const currentQuiz = currentQuizResponse.data;

        // Merge với thông tin mới
        const quizRequest: QuizRequest = {
            title: updates.title || currentQuiz.title,
            description: updates.description || currentQuiz.description,
            categoryIds: updates.categoryIds || currentQuiz.categoryIds,
            difficulty: updates.difficulty || currentQuiz.difficulty,
            isPublic: updates.isPublic !== undefined ? updates.isPublic : currentQuiz.isPublic,
            thumbnailFile: updates.thumbnailFile || currentQuiz.quizThumbnails
        };

        return await quizService.updateQuiz(id, quizRequest);
    }

    /**
     * Xóa quiz
     */
    static async deleteQuiz(id: number) {
        return await quizService.deleteQuiz(id);
    }

    /**
     * Xóa nhiều quiz cùng lúc
     */
    static async deleteMultipleQuizzes(ids: number[]) {
        const deletePromises = ids.map(id => quizService.deleteQuiz(id));
        return await Promise.all(deletePromises);
    }

    /**
     * Publish quiz (công khai quiz)
     */
    static async publishQuiz(id: number) {
        return await quizService.publishQuiz(id);
    }

    /**
     * Unpublish quiz (ẩn quiz)
     */
    static async unpublishQuiz(id: number) {
        return await quizService.unpublishQuiz(id);
    }

    /**
     * Toggle trạng thái public của quiz
     */
    static async toggleQuizPublicStatus(id: number) {
        // Lấy thông tin quiz hiện tại
        const quizResponse = await quizService.getQuizById(id);
        if (quizResponse.status !== 'success' || !quizResponse.data) {
            throw new Error('Quiz not found');
        }

        const isCurrentlyPublic = quizResponse.data.isPublic;

        if (isCurrentlyPublic) {
            return await quizService.unpublishQuiz(id);
        } else {
            return await quizService.publishQuiz(id);
        }
    }

    /**
     * Duplicate quiz (tạo bản sao)
     */
    static async duplicateQuiz(
        id: number,
        newTitle?: string,
        newDescription?: string
    ) {
        // Lấy thông tin quiz gốc
        const originalQuizResponse = await quizService.getQuizById(id);
        if (originalQuizResponse.status !== 'success' || !originalQuizResponse.data) {
            throw new Error('Original quiz not found');
        }

        const originalQuiz = originalQuizResponse.data;

        // Tạo quiz mới dựa trên quiz gốc
        const duplicateRequest: QuizRequest = {
            title: newTitle || `${originalQuiz.title} (Copy)`,
            description: newDescription || originalQuiz.description,
            categoryIds: originalQuiz.categoryIds,
            difficulty: originalQuiz.difficulty,
            isPublic: false, // Mặc định set là private cho bản sao
            thumbnailFile: originalQuiz.quizThumbnails // Giữ nguyên thumbnail
        };

        return await quizService.createQuiz(duplicateRequest);
    }

    /**
     * Bulk operation - cập nhật trạng thái public cho nhiều quiz
     */
    static async bulkUpdatePublicStatus(ids: number[], isPublic: boolean) {
        const updatePromises = ids.map(async (id) => {
            if (isPublic) {
                return await quizService.publishQuiz(id);
            } else {
                return await quizService.unpublishQuiz(id);
            }
        });

        return await Promise.all(updatePromises);
    }

    /**
     * Lấy quiz statistics (có thể mở rộng trong tương lai)
     */
    static async getQuizStatistics(id: number) {
        // Hiện tại chỉ lấy thông tin cơ bản của quiz
        // Có thể mở rộng để lấy thêm thống kê chi tiết
        return await quizService.getQuizById(id);
    }
}
