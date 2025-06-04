"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Spin } from 'antd';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useQuizForm } from '@/hooks/useQuizForm';
import { QuizAPI } from '@/api/quizAPI';
import QuizFormDetails from '@/components/quizzes/QuizForm/QuizFormDetails';
import QuestionList from '@/components/quizzes/QuizForm/QuestionList';
import {
    QuizRequest,
} from '@/types/database';
import { QuestionAPI } from '@/api/questionAPI';

const { Title } = Typography;

export default function QuizForm() {
    const router = useRouter();
    const params = useParams();
    const { enqueueSnackbar } = useSnackbar(); const t = useTranslations('quizzes');
    const commonT = useTranslations('common');
    const successT = useTranslations('success');
    const errorsT = useTranslations('errors');

    // Xác định xem đây là tạo mới hay chỉnh sửa quiz
    const id = params.id;
    const isNew = id === 'new';

    // State quản lý trạng thái loading khi fetch dữ liệu quiz
    const [loading, setLoading] = useState(!isNew); const {
        quizData,
        questions,
        isLoading,
        error,
        setQuizData,
        setNextQuestionId,
        handleQuizChange,
        handleThumbnailChange,
        handleAddQuestion,
        handleQuestionChange,
        handleQuestionImageChange,
        handleRemoveQuestion,
        handleQuizSubmit
    } = useQuizForm();// Fetch dữ liệu quiz khi chỉnh sửa

    useEffect(() => {
        if (!isNew) {
            const fetchQuizData = async () => {
                try {
                    // Sử dụng QuizAPI để lấy dữ liệu quiz
                    const response = await QuizAPI.getQuizById(Number(id));

                    // Lấy danh sách câu hỏi liên quan đến quiz
                    const questionResponse = await QuestionAPI.getQuestionsByQuizId(Number(id));

                    if (
                        response.status === 'success' &&
                        response.data &&
                        questionResponse.status === 'success' &&
                        questionResponse.data
                    ) {
                        // Lấy dữ liệu quiz từ response
                        const quiz = response.data;
                        const questionsData = questionResponse.data;                        // Map API response data to form data
                        const formQuizData: QuizRequest = {
                            title: quiz.title,
                            description: quiz.description,
                            categoryIds: quiz.categoryIds,
                            difficulty: quiz.difficulty,
                            isPublic: quiz.isPublic,
                            thumbnailFile: quiz.quizThumbnails,
                            questions: questionsData.map((q, index) => ({
                                id: index + 1, // Add temporary ID for form management
                                content: q.content,
                                timeLimit: q.timeLimit,
                                points: q.points,
                                orderNumber: q.orderNumber,
                                type: q.type,
                                options: q.options?.map((opt) => ({
                                    content: opt.content,
                                    isCorrect: opt.isCorrect
                                })) || []
                            } as any))
                        };

                        // Cập nhật state với dữ liệu đã lấy
                        setQuizData(formQuizData);
                        // Update next question ID based on loaded questions
                        setNextQuestionId(questionsData.length + 1);
                    }
                } catch (error) {
                    console.error("Error fetching quiz:", error);
                    enqueueSnackbar(errorsT('general'), { variant: "error" });
                } finally {
                    setLoading(false);
                }
            };

            fetchQuizData();
        }
    }, [id, isNew, setQuizData, setNextQuestionId, enqueueSnackbar]);

    // Xử lý submit form (tùy thuộc vào tạo mới hoặc chỉnh sửa)
    const handleSubmit = async () => {
        try {
            if (isNew) {
                // Tạo quiz mới - sử dụng hook function
                await handleQuizSubmit();
            } else {
                // Cập nhật quiz hiện có - sử dụng QuizAPI
                const response = await QuizAPI.updateQuizFromRequest(Number(id), quizData);                // Xử lý kết quả
                if (response.status === 'success') {
                    enqueueSnackbar(successT('updated'), { variant: "success" });
                    router.push("/quizzes");
                } else {
                    throw new Error(response.message || errorsT('general'));
                }
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
            enqueueSnackbar(errorsT('general'), { variant: "error" });
        }
    };

    // Hiển thị trạng thái loading khi đang tải dữ liệu quiz
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
                <div className="mt-4 text-gray-600">{t('loadingQuizData')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link href="/quizzes" className="mr-4">
                        <Button icon={<FiArrowLeft />}>{t('backToQuizzes')}</Button>
                    </Link>
                    <Title level={4} className="m-0">
                        {isNew ? t('createNew') : t('editQuiz', { title: quizData.title })}
                    </Title>
                </div>
                <Button
                    type="primary"
                    icon={<FiSave />}
                    size="large"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    {isNew ? t('saveQuiz') : t('updateQuiz')}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <Card title={t('quizDetails')} className="mb-6">
                <QuizFormDetails
                    quizData={quizData}
                    onChange={handleQuizChange}
                    onThumbnailChange={handleThumbnailChange}
                />
            </Card>
            <Card
                title={t('questions')}
                extra={
                    <Button
                        type="primary"
                        onClick={() => handleAddQuestion()}
                    >
                        {t('addQuestion')}
                    </Button>
                }
            >
                <QuestionList
                    questions={questions}
                    onChange={handleQuestionChange}
                    onImageChange={handleQuestionImageChange}
                    onRemove={handleRemoveQuestion}
                />
            </Card>
        </div>
    );
}