import React from 'react';
import { Card, Collapse, Form, Input, Button, InputNumber, Radio, Space, Upload } from 'antd';
import { FiTrash, FiPlusCircle, FiClock, FiAward, FiImage, FiUpload } from 'react-icons/fi';
import { FormQuestion, QuestionOptionRequest } from '@/types/database';

const { TextArea } = Input;

interface QuestionListProps {
    questions: FormQuestion[];
    onChange: (questionId: number, data: Partial<FormQuestion>) => void;
    onImageChange: (questionId: number, file: File | null) => void;
    onRemove: (questionId: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    onChange,
    onImageChange,
    onRemove
}) => {
    // Xử lý thay đổi đáp án
    const handleAnswerChange = (questionId: number, answerIndex: number, content: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options) return;

        const updatedOptions = [...question.options];
        updatedOptions[answerIndex] = {
            ...updatedOptions[answerIndex],
            content
        };

        onChange(questionId, { options: updatedOptions });
    };

    // Xử lý thay đổi đáp án đúng
    const handleCorrectAnswerChange = (questionId: number, answerIndex: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options) return;

        const updatedOptions = question.options.map((option, index) => ({
            ...option,
            isCorrect: index === answerIndex
        }));

        onChange(questionId, { options: updatedOptions });
    };

    // Thêm đáp án mới
    const handleAddAnswer = (questionId: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const newOption: QuestionOptionRequest = {
            content: '',
            isCorrect: false
        };

        const options = question.options || [];
        onChange(questionId, {
            options: [...options, newOption]
        });
    };

    // Xóa đáp án
    const handleRemoveAnswer = (questionId: number, answerIndex: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options) return;

        // Đảm bảo luôn có ít nhất 2 đáp án
        if (question.options.length <= 2) return;

        const updatedOptions = question.options.filter((_, index) => index !== answerIndex);

        // Nếu xóa đáp án đúng, thiết lập đáp án đầu tiên còn lại là đúng
        if (question.options[answerIndex].isCorrect) {
            updatedOptions[0].isCorrect = true;
        }

        onChange(questionId, { options: updatedOptions });
    };

    // Xử lý tải lên hình ảnh
    const handleImageUpload = (questionId: number, file: File) => {
        onImageChange(questionId, file);
    };

    // Tạo mảng items cho component Collapse
    const collapseItems = questions.map((question, index) => {
        // Đối với câu hỏi mới, khởi tạo mảng options nếu nó chưa tồn tại
        if (!question.options || question.options.length === 0) {
            question.options = [
                { content: '', isCorrect: true },
                { content: '', isCorrect: false }
            ];
        }

        return {
            key: String(question.id),
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

                        <Form.Item label={<div className="flex items-center"><FiImage className="mr-1" /> Question Image</div>}>
                            <div className="space-y-2">
                                {typeof question.imageFile === 'string' && question.imageFile && (
                                    <div className="mb-2">
                                        <img
                                            src={question.imageFile}
                                            alt="Question preview"
                                            className="max-w-xs max-h-40 object-cover rounded"
                                        />
                                    </div>
                                )}
                                <Upload
                                    name="questionImage"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        handleImageUpload(question.id, file);
                                        return false;
                                    }}
                                >
                                    <Button icon={<FiUpload />}>
                                        {question.imageFile ? 'Change Image' : 'Upload Image'}
                                    </Button>
                                </Upload>
                            </div>
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
                            value={question.options.findIndex(a => a.isCorrect)}
                            onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {question.options.map((option, ansIndex) => (
                                    <div key={ansIndex} className="flex items-start gap-2">
                                        <Radio value={ansIndex} className="mt-1" />
                                        <Input
                                            placeholder={`Answer option ${ansIndex + 1}`}
                                            value={option.content}
                                            onChange={(e) => handleAnswerChange(question.id, ansIndex, e.target.value)}
                                            className="flex-grow"
                                        />
                                        {question.options && question.options.length > 2 && (
                                            <Button
                                                danger
                                                icon={<FiTrash />}
                                                onClick={() => handleRemoveAnswer(question.id, ansIndex)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </Space>
                        </Radio.Group>
                    </div>
                </Form>
            )
        };
    });

    return (
        <div className="space-y-4">
            {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No questions added yet. Click "Add Question" to start creating your quiz.
                </div>
            ) : (
                <Collapse items={collapseItems} defaultActiveKey={[String(questions[0]?.id)]} />
            )}
        </div>
    );
};

export default QuestionList;