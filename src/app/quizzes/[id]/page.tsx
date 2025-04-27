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
import { 
  ApiResponse, 
  QuizResponse, 
  QuizRequest, 
  QuizDetailResponse,
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
    } = useQuizForm();

    // Fetch dữ liệu quiz khi chỉnh sửa
    useEffect(() => {
        if (!isNew) {
            const fetchQuizData = async () => {
                try {
                    // Trong ứng dụng thực tế, fetch từ API
                    const response = await axiosInstance.get<ApiResponse<QuizDetailResponse>>(`/api/quizzes/${id}`);
                    
                    if (response.data?.status === 'success' && response.data.data) {
                        const quizDetail = response.data.data;
                        
                        // Map API response data to form data
                        const formQuizData: QuizRequest = {
                            title: quizDetail.title,
                            description: quizDetail.description,
                            categoryId: quizDetail.category.id,
                            difficulty: quizDetail.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                            isPublic: quizDetail.is_public,
                        };
                        
                        // Map questions from API response to form questions
                        const formQuestions: FormQuestion[] = quizDetail.questions.map((q, index) => ({
                            id: q.id,
                            quizId: quizDetail.id,
                            content: q.content,
                            imageUrl: q.image_url || undefined,
                            timeLimit: q.time_limit,
                            points: q.points,
                            orderNumber: q.order_number,
                            // In a real implementation, you would also fetch question options
                            options: [] // This would be populated in a complete implementation
                        }));
                        
                        setQuizData(formQuizData);
                        setQuestions(formQuestions);
                    } else {
                        // If no real API data, use mock data for development
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Mock data for demo
                        const mockQuizData: QuizRequest = {
                            title: `Quiz #${id}`,
                            description: "Sample quiz description for editing",
                            categoryId: 2,
                            difficulty: "MEDIUM",
                            isPublic: true,
                        };
                        
                        const mockQuestions: FormQuestion[] = [
                            {
                                id: 1,
                                quizId: Number(id),
                                content: "What is the capital of France?",
                                timeLimit: 30,
                                points: 10,
                                orderNumber: 1,
                                options: [
                                    { content: "Paris", isCorrect: true },
                                    { content: "London", isCorrect: false },
                                    { content: "Berlin", isCorrect: false },
                                    { content: "Madrid", isCorrect: false }
                                ]
                            },
                            {
                                id: 2,
                                quizId: Number(id),
                                content: "What is 2+2?",
                                timeLimit: 15,
                                points: 5,
                                orderNumber: 2,
                                options: [
                                    { content: "3", isCorrect: false },
                                    { content: "4", isCorrect: true },
                                    { content: "5", isCorrect: false },
                                    { content: "6", isCorrect: false }
                                ]
                            }
                        ];
                        
                        setQuizData(mockQuizData);
                        setQuestions(mockQuestions);
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
    }, [id, isNew, setQuizData, setQuestions, enqueueSnackbar]);

    // Xử lý submit form (tùy thuộc vào tạo mới hoặc chỉnh sửa)
    const handleSubmit = async () => {
        try {
            if (isNew) {
                // Tạo quiz mới
                await handleQuizSubmit();
            } else {
                // Cập nhật quiz hiện có
                const formData = new FormData();
                formData.append('title', quizData.title);
                formData.append('description', quizData.description || '');
                formData.append('categoryId', quizData.categoryId?.toString() || '');
                formData.append('difficulty', quizData.difficulty);
                formData.append('isPublic', quizData.isPublic.toString());

                if (quizData.quizThumbnails instanceof File) {
                    formData.append('thumbnailFile', quizData.quizThumbnails);
                }

                // Gọi API cập nhật quiz
                const response = await axiosInstance.put<ApiResponse<QuizResponse>>(`/api/quizzes/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                // Xử lý kết quả
                if (response.data.status === 'success') {
                    enqueueSnackbar("Quiz updated successfully!", { variant: "success" });
                    router.push("/quizzes");
                } else {
                    throw new Error(response.data.error?.message || 'Failed to update quiz');
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