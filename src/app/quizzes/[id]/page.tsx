"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Spin } from 'antd';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useQuizForm } from '@/hooks/useQuizForm';
import QuizFormDetails from '@/components/quizzes/QuizForm/QuizFormDetails';
import QuestionList from '@/components/quizzes/QuizForm/QuestionList';
import axiosInstance from '@/utils/axios';

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
        handleAddQuestion,
        handleQuestionChange,
        handleRemoveQuestion,
        handleQuizSubmit
    } = useQuizForm();

    // Fetch dữ liệu quiz khi chỉnh sửa
    useEffect(() => {
        if (!isNew) {
            const fetchQuizData = async () => {
                try {
                    // Trong ứng dụng thực tế, fetch từ API
                    // const response = await axiosInstance.get(`/api/quizzes/${id}`);
                    // const data = response.data.data;
                    
                    // Demo: Giả lập lấy dữ liệu từ API
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Mock data cho demo
                    const mockQuizData = {
                        title: `Quiz #${id}`,
                        description: "Sample quiz description for editing",
                        categoryId: 2,
                        difficulty: "medium",
                        isPublic: true,
                        thumbnailUrl: ""
                    };
                    
                    const mockQuestions = [
                        {
                            id: "q1",
                            content: "What is the capital of France?",
                            timeLimit: 30,
                            points: 10,
                            answers: [
                                { id: "a1", content: "Paris", isCorrect: true },
                                { id: "a2", content: "London", isCorrect: false },
                                { id: "a3", content: "Berlin", isCorrect: false },
                                { id: "a4", content: "Madrid", isCorrect: false }
                            ]
                        },
                        {
                            id: "q2",
                            content: "What is 2+2?",
                            timeLimit: 15,
                            points: 5,
                            answers: [
                                { id: "a5", content: "3", isCorrect: false },
                                { id: "a6", content: "4", isCorrect: true },
                                { id: "a7", content: "5", isCorrect: false },
                                { id: "a8", content: "6", isCorrect: false }
                            ]
                        }
                    ];
                    
                    setQuizData(mockQuizData);
                    setQuestions(mockQuestions);
                } catch (error) {
                    console.error("Error fetching quiz:", error);
                    enqueueSnackbar("Failed to load quiz data", { variant: "error" });
                } finally {
                    setLoading(false);
                }
            };
            
            fetchQuizData();
        }
    }, [id, isNew, setQuizData, setQuestions, enqueueSnackbar]);

    // Xử lý submit form (tùy thuộc vào tạo mới hoặc chỉnh sửa)
    const handleSubmit = async () => {
        try {
            if (isNew) {
                // Tạo quiz mới
                await handleQuizSubmit();
            } else {
                // Cập nhật quiz hiện có
                // Trong môi trường thực tế, gọi API update
                // await axiosInstance.put(`/api/quizzes/${id}`, {
                //     ...quizData,
                //     questions
                // });
                
                // Giả lập gọi API
                await new Promise(resolve => setTimeout(resolve, 1500));
                enqueueSnackbar("Quiz updated successfully!", { variant: "success" });
                router.push("/quizzes");
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
                <QuizFormDetails quizData={quizData} onChange={handleQuizChange} />
            </Card>

            <Card
                title="Questions"
                extra={
                    <Button type="primary" onClick={handleAddQuestion}>
                        Add Question
                    </Button>
                }
            >
                <QuestionList
                    questions={questions}
                    onChange={handleQuestionChange}
                    onRemove={handleRemoveQuestion}
                />
            </Card>
        </div>
    );
}