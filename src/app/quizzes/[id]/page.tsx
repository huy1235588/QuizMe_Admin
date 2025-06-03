"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Spin } from 'antd';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useQuizForm } from '@/hooks/useQuizForm';
import { QuizAPI } from '@/api/quizAPI';
import QuizFormDetails from '@/components/quizzes/QuizForm/QuizFormDetails';
import QuestionList from '@/components/quizzes/QuizForm/QuestionList';
import {
    QuizResponse,
    QuizRequest,
    FormQuestion,
    QuestionOptionRequest
} from '@/types/database';

const { Title } = Typography;

export default function QuizForm() {
    const router = useRouter();
    const params = useParams();
    const { enqueueSnackbar } = useSnackbar();

    // Xác định xem đây là tạo mới hay chỉnh sửa quiz
    const id = params.id;
    const isNew = id === 'new';

    // State quản lý trạng thái loading khi fetch dữ liệu quiz
    const [loading, setLoading] = useState(!isNew);

    const {
        quizData,
        questions,
        isLoading,
        error,
        setQuizData,
        setQuestions,
        handleQuizChange,
        handleThumbnailChange,
        handleAddQuestion,
        handleQuestionChange,
        handleQuestionImageChange,
        handleRemoveQuestion,
        handleQuizSubmit
    } = useQuizForm();    // Fetch dữ liệu quiz khi chỉnh sửa
    useEffect(() => {
        if (!isNew) {
            const fetchQuizData = async () => {
                try {
                    // Sử dụng QuizAPI để lấy dữ liệu quiz
                    const response = await QuizAPI.getQuizById(Number(id));

                    if (response.status === 'success' && response.data) {
                        const quiz = response.data;

                        // Map API response data to form data
                        const formQuizData: QuizRequest = {
                            title: quiz.title,
                            description: quiz.description,
                            categoryIds: quiz.categoryIds,
                            difficulty: quiz.difficulty,
                            isPublic: quiz.isPublic,
                        };

                        // Map questions từ API response (nếu có)
                        // Hiện tại chỉ set empty array vì chưa có API cho questions
                        const formQuestions: FormQuestion[] = [];

                        setQuizData(formQuizData);
                        setQuestions(formQuestions);
                    }
                } catch (error) {
                    console.error("Error fetching quiz:", error);
                    enqueueSnackbar("Failed to load quiz data", { variant: "error" });
                } finally {
                    setLoading(false);
                }
            };

            fetchQuizData();
        }
    }, [id, isNew, setQuizData, setQuestions, enqueueSnackbar]);    // Xử lý submit form (tùy thuộc vào tạo mới hoặc chỉnh sửa)
    const handleSubmit = async () => {
        try {
            if (isNew) {
                // Tạo quiz mới - sử dụng hook function
                await handleQuizSubmit();
            } else {
                // Cập nhật quiz hiện có - sử dụng QuizAPI
                const response = await QuizAPI.updateQuizFromRequest(Number(id), quizData);

                // Xử lý kết quả
                if (response.status === 'success') {
                    enqueueSnackbar("Quiz updated successfully!", { variant: "success" });
                    router.push("/quizzes");
                } else {
                    throw new Error(response.message || 'Failed to update quiz');
                }
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
            enqueueSnackbar("Failed to save quiz", { variant: "error" });
        }
    };

    // Hiển thị trạng thái loading khi đang tải dữ liệu quiz
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" tip="Loading quiz data..." />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link href="/quizzes" className="mr-4">
                        <Button icon={<FiArrowLeft />}>Back to Quizzes</Button>
                    </Link>
                    <Title level={4} className="m-0">
                        {isNew ? "Create New Quiz" : `Edit Quiz: ${quizData.title}`}
                    </Title>
                </div>
                <Button
                    type="primary"
                    icon={<FiSave />}
                    size="large"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    {isNew ? "Save Quiz" : "Update Quiz"}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Card title="Quiz Details" className="mb-6">
                <QuizFormDetails
                    quizData={quizData}
                    onChange={handleQuizChange}
                    onThumbnailChange={handleThumbnailChange}
                />
            </Card>

            <Card
                title="Questions"
                extra={
                    <Button
                        type="primary"
                        onClick={() => handleAddQuestion(Number(id) || 0)}
                    >
                        Add Question
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