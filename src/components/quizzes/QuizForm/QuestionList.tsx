import React from 'react';
import { Card, Collapse, Form, Input, Button, InputNumber, Radio, Space } from 'antd';
import { FiTrash, FiPlusCircle, FiClock, FiAward, FiImage } from 'react-icons/fi';

const { TextArea } = Input;

interface Answer {
    id: string;
    content: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    content: string;
    imageUrl?: string;
    timeLimit: number;
    points: number;
    answers: Answer[];
}

interface QuestionListProps {
    questions: Question[];
    onChange: (questionId: string, data: Partial<Question>) => void;
    onRemove: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, onChange, onRemove }) => {
    // Xử lý thay đổi đáp án
    const handleAnswerChange = (questionId: string, answerId: string, content: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const updatedAnswers = question.answers.map(a =>
            a.id === answerId ? { ...a, content } : a
        );

        onChange(questionId, { answers: updatedAnswers });
    };

    // Xử lý thay đổi đáp án đúng
    const handleCorrectAnswerChange = (questionId: string, answerId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const updatedAnswers = question.answers.map(a =>
            ({ ...a, isCorrect: a.id === answerId })
        );

        onChange(questionId, { answers: updatedAnswers });
    };

    // Thêm đáp án mới
    const handleAddAnswer = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const newAnswer: Answer = {
            id: `answer_${Date.now()}`,
            content: '',
            isCorrect: false
        };

        onChange(questionId, {
            answers: [...question.answers, newAnswer]
        });
    };

    // Xóa đáp án
    const handleRemoveAnswer = (questionId: string, answerId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        // Đảm bảo luôn có ít nhất 2 đáp án
        if (question.answers.length <= 2) return;

        const updatedAnswers = question.answers.filter(a => a.id !== answerId);

        // Nếu xóa đáp án đúng, thiết lập đáp án đầu tiên còn lại là đúng
        if (question.answers.find(a => a.id === answerId)?.isCorrect) {
            updatedAnswers[0].isCorrect = true;
        }

        onChange(questionId, { answers: updatedAnswers });
    };

    // Create items array for Collapse component
    const collapseItems = questions.map((question, index) => ({
        key: question.id,
        label: `Question ${index + 1}: ${question.content || 'New Question'}`,
        extra: (
            <Button
                danger
                icon={<FiTrash />}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(question.id);
                }}
            >
                Remove
            </Button>
        ),
        children: (
            <Form layout="vertical">
                <Form.Item label="Question Text" required>
                    <TextArea
                        value={question.content}
                        onChange={(e) => onChange(question.id, { content: e.target.value })}
                        placeholder="Enter question text"
                        rows={3}
                    />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Form.Item label={<div className="flex items-center"><FiClock className="mr-1" /> Time Limit (seconds)</div>}>
                        <InputNumber
                            min={5}
                            max={300}
                            value={question.timeLimit}
                            onChange={(value) => onChange(question.id, { timeLimit: value as number })}
                        />
                    </Form.Item>

                    <Form.Item label={<div className="flex items-center"><FiAward className="mr-1" /> Points</div>}>
                        <InputNumber
                            min={1}
                            max={100}
                            value={question.points}
                            onChange={(value) => onChange(question.id, { points: value as number })}
                        />
                    </Form.Item>

                    <Form.Item label={<div className="flex items-center"><FiImage className="mr-1" /> Image URL (optional)</div>}>
                        <Input
                            value={question.imageUrl}
                            onChange={(e) => onChange(question.id, { imageUrl: e.target.value })}
                            placeholder="Enter image URL"
                        />
                    </Form.Item>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium m-0">Answers</h4>
                        <Button
                            type="primary"
                            size="small"
                            icon={<FiPlusCircle />}
                            onClick={() => handleAddAnswer(question.id)}
                        >
                            Add Answer
                        </Button>
                    </div>

                    <Radio.Group
                        value={question.answers.find(a => a.isCorrect)?.id}
                        onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {question.answers.map((answer, ansIndex) => (
                                <div key={answer.id} className="flex items-start gap-2">
                                    <Radio value={answer.id} className="mt-1" />
                                    <Input
                                        placeholder={`Answer option ${ansIndex + 1}`}
                                        value={answer.content}
                                        onChange={(e) => handleAnswerChange(question.id, answer.id, e.target.value)}
                                        className="flex-grow"
                                    />
                                    {question.answers.length > 2 && (
                                        <Button
                                            danger
                                            icon={<FiTrash />}
                                            onClick={() => handleRemoveAnswer(question.id, answer.id)}
                                        />
                                    )}
                                </div>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>
            </Form>
        )
    }));

    return (
        <div className="space-y-4">
            {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No questions added yet. Click "Add Question" to start creating your quiz.
                </div>
            ) : (
                <Collapse items={collapseItems} defaultActiveKey={[questions[0]?.id]} />
            )}
        </div>
    );
};

export default QuestionList;