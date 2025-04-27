"use client";

import React from 'react';
import { Typography, Card, Button } from 'antd';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuizForm } from '@/hooks/useQuizForm';
import QuizFormDetails from '@/components/quizzes/QuizForm/QuizFormDetails';
import QuestionList from '@/components/quizzes/QuizForm/QuestionList';

const { Title } = Typography;

export default function CreateQuiz() {
    const router = useRouter();
    const {
        quizData,
        questions,
        isLoading,
        error,
        handleQuizChange,
        handleAddQuestion,
        handleQuestionChange,
        handleRemoveQuestion,
        handleQuizSubmit
    } = useQuizForm();

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link href="/quizzes" className="mr-4">
                        <Button icon={<FiArrowLeft />}>Back to Quizzes</Button>
                    </Link>
                    <Title level={4} className="m-0">Create New Quiz</Title>
                </div>
                <Button
                    type="primary"
                    icon={<FiSave />}
                    size="large"
                    loading={isLoading}
                    onClick={handleQuizSubmit}
                >
                    Save Quiz
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