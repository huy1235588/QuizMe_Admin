import React from 'react';
import { Card, Collapse, Form, Input, Button, InputNumber, Radio, Space, Upload, Select } from 'antd';
import { FiTrash, FiPlusCircle, FiClock, FiAward, FiImage, FiUpload, FiType, FiMusic } from 'react-icons/fi';
import { QuizQuestionRequest, QuizQuestionOptionRequest, QuestionType } from '@/types/database';

const { TextArea } = Input;

// Extended type for form handling with temporary ID
type FormQuizQuestion = QuizQuestionRequest & {
    id: number; // Temporary ID for form management
};

interface QuestionListProps {
    questions: FormQuizQuestion[];
    onChange: (questionId: number, data: Partial<QuizQuestionRequest>) => void;
    onImageChange: (questionId: number, file: File | null) => void;
    onAudioChange?: (questionId: number, file: File | null) => void;
    onRemove: (questionId: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    onChange,
    onImageChange,
    onAudioChange,
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

        const newOption: QuizQuestionOptionRequest = {
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

    // Xử lý tải lên âm thanh
    const handleAudioUpload = (questionId: number, file: File) => {
        if (onAudioChange) {
            onAudioChange(questionId, file);
        }
    };

    // Tạo mảng items cho component Collapse
    const collapseItems = questions.map((question, index) => {
        // Đối với câu hỏi mới, khởi tạo mảng options dựa trên loại câu hỏi
        if (!question.options || question.options.length === 0) {
            if (question.type === 'TRUE_FALSE') {
                question.options = [
                    { content: 'True', isCorrect: true },
                    { content: 'False', isCorrect: false }
                ];
            } else if (question.type === 'TYPE_ANSWER') {
                question.options = [
                    { content: '', isCorrect: true }
                ];
            } else {
                // Default for QUIZ, CHECKBOX, POLL
                question.options = [
                    { content: '', isCorrect: true },
                    { content: '', isCorrect: false }
                ];
            }
        }

        // Set default question type if not specified
        if (!question.type) {
            onChange(question.id, { type: 'QUIZ' });
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <Form.Item label={<div className="flex items-center"><FiType className="mr-1" /> Question Type</div>}>
                            <Select
                                value={question.type}
                                onChange={(value) => onChange(question.id, { type: value as QuestionType })}
                                placeholder="Select question type"
                            >
                                <Select.Option value="QUIZ">Quiz</Select.Option>
                                <Select.Option value="TRUE_FALSE">True/False</Select.Option>
                                <Select.Option value="TYPE_ANSWER">Type Answer</Select.Option>
                                <Select.Option value="CHECKBOX">Checkbox</Select.Option>
                                <Select.Option value="POLL">Poll</Select.Option>
                            </Select>
                        </Form.Item>

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                    accept="image/*"
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

                        <Form.Item label={<div className="flex items-center"><FiMusic className="mr-1" /> Question Audio</div>}>
                            <div className="space-y-2">
                                {typeof question.audioFile === 'string' && question.audioFile && (
                                    <div className="mb-2">
                                        <audio controls className="w-full">
                                            <source src={question.audioFile} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                                <Upload
                                    name="questionAudio"
                                    accept="audio/*"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        handleAudioUpload(question.id, file);
                                        return false;
                                    }}
                                >
                                    <Button icon={<FiUpload />}>
                                        {question.audioFile ? 'Change Audio' : 'Upload Audio'}
                                    </Button>
                                </Upload>
                            </div>
                        </Form.Item>
                    </div>

                    {/* Answers section - only show for question types that need options */}
                    {(question.type === 'QUIZ' || question.type === 'TRUE_FALSE' || question.type === 'CHECKBOX' || question.type === 'POLL') && (
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-base font-medium m-0">
                                    {question.type === 'TRUE_FALSE' ? 'True/False Options' :
                                        question.type === 'POLL' ? 'Poll Options' : 'Answer Options'}
                                </h4>
                                {question.type !== 'TRUE_FALSE' && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<FiPlusCircle />}
                                        onClick={() => handleAddAnswer(question.id)}
                                    >
                                        Add Answer
                                    </Button>
                                )}
                            </div>

                            {question.type === 'CHECKBOX' ? (
                                // Checkbox questions can have multiple correct answers
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {question.options.map((option, ansIndex) => (
                                        <div key={ansIndex} className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => {
                                                    const updatedOptions = [...question.options];
                                                    updatedOptions[ansIndex] = {
                                                        ...updatedOptions[ansIndex],
                                                        isCorrect: e.target.checked
                                                    };
                                                    onChange(question.id, { options: updatedOptions });
                                                }}
                                                className="mt-2"
                                            />
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
                            ) : (
                                // Single answer questions (QUIZ, TRUE_FALSE, POLL)
                                <Radio.Group
                                    value={question.options.findIndex(a => a.isCorrect)}
                                    onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {question.options.map((option, ansIndex) => (
                                            <div key={ansIndex} className="flex items-start gap-2">
                                                <Radio value={ansIndex} className="mt-1" />
                                                <Input
                                                    placeholder={
                                                        question.type === 'TRUE_FALSE'
                                                            ? (ansIndex === 0 ? 'True' : 'False')
                                                            : `Answer option ${ansIndex + 1}`
                                                    }
                                                    value={option.content}
                                                    onChange={(e) => handleAnswerChange(question.id, ansIndex, e.target.value)}
                                                    className="flex-grow"
                                                    disabled={question.type === 'TRUE_FALSE'}
                                                />
                                                {question.options && question.options.length > 2 && question.type !== 'TRUE_FALSE' && (
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
                            )}
                        </div>
                    )}

                    {/* Type Answer questions show different UI */}
                    {question.type === 'TYPE_ANSWER' && (
                        <div className="mb-2">
                            <Form.Item label="Expected Answer(s)" help="Enter the correct answer(s) that participants should type">
                                <Input
                                    placeholder="Enter the expected answer"
                                    value={question.options?.[0]?.content || ''}
                                    onChange={(e) => {
                                        const newOptions = [{ content: e.target.value, isCorrect: true }];
                                        onChange(question.id, { options: newOptions });
                                    }}
                                />
                            </Form.Item>
                        </div>
                    )}
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