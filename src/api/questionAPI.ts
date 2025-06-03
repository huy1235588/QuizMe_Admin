import { questionService } from '@/services';
import { QuestionRequest, QuestionType } from '@/types/database';

/**
 * Question API Helper - Utility functions for question operations
 */
export class QuestionAPI {
    /**
     * Lấy danh sách tất cả các câu hỏi
     */
    static async getAllQuestions() {
        return await questionService.getAllQuestions();
    }

    /**
     * Lấy câu hỏi theo ID
     */
    static async getQuestionById(id: number) {
        return await questionService.getQuestionById(id);
    }

    /**
     * Lấy danh sách các câu hỏi theo quiz ID
     */
    static async getQuestionsByQuizId(quizId: number) {
        return await questionService.getQuestionsByQuizId(quizId);
    }

    /**
     * Tạo mới câu hỏi với các tham số riêng biệt
     */
    static async createQuestion(
        quizId: number,
        content: string,
        timeLimit: number,
        points: number,
        orderNumber: number,
        type: QuestionType,
        options: { content: string; isCorrect: boolean }[],
        imageFile?: File,
        audioFile?: File
    ) {
        const questionRequest: QuestionRequest = {
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            type,
            options,
            imageFile,
            audioFile
        };

        return await questionService.createQuestion(questionRequest);
    }

    /**
     * Tạo mới câu hỏi từ QuestionRequest object
     */
    static async createQuestionFromRequest(questionRequest: QuestionRequest) {
        return await questionService.createQuestion(questionRequest);
    }

    /**
     * Tạo danh sách câu hỏi mới
     */
    static async createQuestions(questionRequests: QuestionRequest[]) {
        return await questionService.createQuestions(questionRequests);
    }

    /**
     * Cập nhật thông tin câu hỏi với các tham số riêng biệt
     */
    static async updateQuestion(
        id: number,
        quizId: number,
        content: string,
        timeLimit: number,
        points: number,
        orderNumber: number,
        type: QuestionType,
        options: { content: string; isCorrect: boolean }[],
        imageFile?: File,
        audioFile?: File
    ) {
        const questionRequest: QuestionRequest = {
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            type,
            options,
            imageFile,
            audioFile
        };

        return await questionService.updateQuestion(id, questionRequest);
    }

    /**
     * Cập nhật câu hỏi từ QuestionRequest object
     */
    static async updateQuestionFromRequest(id: number, questionRequest: QuestionRequest) {
        return await questionService.updateQuestion(id, questionRequest);
    }

    /**
     * Xóa câu hỏi
     */
    static async deleteQuestion(id: number) {
        return await questionService.deleteQuestion(id);
    }

    /**
     * Tạo câu hỏi trắc nghiệm (multiple choice) với helper method
     */
    static async createMultipleChoiceQuestion(
        quizId: number,
        content: string,
        answers: { content: string; isCorrect: boolean }[],
        timeLimit: number = 30,
        points: number = 10,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'QUIZ',
            answers,
            imageFile
        );
    }

    /**
     * Tạo câu hỏi đúng/sai (true/false) với helper method
     */
    static async createTrueFalseQuestion(
        quizId: number,
        content: string,
        isTrue: boolean,
        timeLimit: number = 30,
        points: number = 10,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        const answers = [
            { content: 'True', isCorrect: isTrue },
            { content: 'False', isCorrect: !isTrue }
        ];

        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'TRUE_FALSE',
            answers,
            imageFile
        );
    }

    /**
     * Tạo câu hỏi tự luận (type answer)
     */
    static async createTypeAnswerQuestion(
        quizId: number,
        content: string,
        correctAnswer: string,
        timeLimit: number = 60,
        points: number = 15,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        const answers = [
            { content: correctAnswer, isCorrect: true }
        ];

        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'TYPE_ANSWER',
            answers,
            imageFile
        );
    }

    /**
     * Tạo câu hỏi có audio
     */
    static async createAudioQuestion(
        quizId: number,
        content: string,
        answers: { content: string; isCorrect: boolean }[],
        audioFile: File,
        timeLimit: number = 45,
        points: number = 15,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'QUIZ_AUDIO',
            answers,
            imageFile,
            audioFile
        );
    }

    /**
     * Tạo câu hỏi checkbox (multiple correct answers)
     */
    static async createCheckboxQuestion(
        quizId: number,
        content: string,
        answers: { content: string; isCorrect: boolean }[],
        timeLimit: number = 45,
        points: number = 15,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'CHECKBOX',
            answers,
            imageFile
        );
    }

    /**
     * Tạo câu hỏi poll (khảo sát)
     */
    static async createPollQuestion(
        quizId: number,
        content: string,
        answers: { content: string; isCorrect: boolean }[],
        timeLimit: number = 30,
        points: number = 5,
        orderNumber: number = 1,
        imageFile?: File
    ) {
        // Trong poll, tất cả câu trả lời đều được coi là "correct"
        const pollAnswers = answers.map(answer => ({ ...answer, isCorrect: true }));

        return await this.createQuestion(
            quizId,
            content,
            timeLimit,
            points,
            orderNumber,
            'POLL',
            pollAnswers,
            imageFile
        );
    }

    /**
     * Duplicate một câu hỏi (copy câu hỏi)
     */
    static async duplicateQuestion(questionId: number, newQuizId?: number) {
        try {
            // Lấy thông tin câu hỏi gốc
            const response = await this.getQuestionById(questionId);

            if (response.status === 'success' && response.data) {
                const originalQuestion = response.data;

                // Tạo request cho câu hỏi mới
                const questionRequest: QuestionRequest = {
                    quizId: newQuizId || originalQuestion.quizId,
                    content: `${originalQuestion.content} (Copy)`,
                    timeLimit: originalQuestion.timeLimit,
                    points: originalQuestion.points,
                    orderNumber: originalQuestion.orderNumber,
                    type: originalQuestion.type,
                    options: originalQuestion.options || []
                };

                return await this.createQuestionFromRequest(questionRequest);
            } else {
                throw new Error('Failed to fetch original question');
            }
        } catch (error) {
            console.error('Error duplicating question:', error);
            throw error;
        }
    }

    /**
     * Bulk update multiple questions
     */
    static async bulkUpdateQuestions(updates: { id: number; questionRequest: QuestionRequest }[]) {
        const updatePromises = updates.map(({ id, questionRequest }) =>
            this.updateQuestionFromRequest(id, questionRequest)
        );

        try {
            const results = await Promise.all(updatePromises);
            return {
                status: 'success' as const,
                data: results,
                message: 'Questions updated successfully'
            };
        } catch (error) {
            console.error('Error in bulk update:', error);
            throw error;
        }
    }

    /**
     * Bulk delete multiple questions
     */
    static async bulkDeleteQuestions(questionIds: number[]) {
        const deletePromises = questionIds.map(id => this.deleteQuestion(id));

        try {
            await Promise.all(deletePromises);
            return {
                status: 'success' as const,
                data: null,
                message: 'Questions deleted successfully'
            };
        } catch (error) {
            console.error('Error in bulk delete:', error);
            throw error;
        }
    }
}
