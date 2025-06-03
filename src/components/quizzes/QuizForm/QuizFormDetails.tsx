import React from 'react';
import { Form, Input, Select, Switch, Upload, Button } from 'antd';
import { FiUpload } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';
import { useEffect, useState } from 'react';
import { QuizRequest, ApiResponse, Category } from '@/types/database';

const { TextArea } = Input;
const { Option } = Select;

interface QuizFormDetailsProps {
    quizData: QuizRequest;
    onChange: (field: string, value: any) => void;
    onThumbnailChange: (file: File | null) => void;
}

const QuizFormDetails: React.FC<QuizFormDetailsProps> = ({
    quizData,
    onChange,
    onThumbnailChange
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(
        typeof quizData.thumbnailFile === 'string' ? quizData.thumbnailFile : undefined
    );

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Call API to get categories list
                const response = await axiosInstance.get<ApiResponse<Category[]>>('/api/categories');

                if (response.data?.status === 'success' && response.data.data) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <Form layout="vertical">
            <Form.Item label="Quiz Title" required>
                <Input
                    value={quizData.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="Enter quiz title"
                />
            </Form.Item>

            <Form.Item label="Description">
                <TextArea
                    value={quizData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Enter quiz description"
                    rows={4}
                />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Category" required>
                    <Select
                        value={quizData.categoryIds}
                        onChange={(value) => onChange('categoryId', value)}
                        placeholder="Select category"
                    >
                        {categories.map(category => (
                            <Option key={category.id} value={category.id}>{category.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Difficulty">
                    <Select
                        value={quizData.difficulty}
                        onChange={(value) => onChange('difficulty', value)}
                    >
                        <Option value="EASY">Easy</Option>
                        <Option value="MEDIUM">Medium</Option>
                        <Option value="HARD">Hard</Option>
                    </Select>
                </Form.Item>
            </div>

            <Form.Item label="Thumbnail">
                <div className="space-y-2">
                    {quizData.thumbnailFile && (
                        <div className="mb-2">
                            <img
                                src={quizData.thumbnailFile || previewUrl}
                                alt="Quiz thumbnail preview"
                                className="max-w-xs max-h-40 object-cover rounded"
                            />
                        </div>
                    )}
                    <Upload
                        name="thumbnail"
                        listType="picture"
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={(file) => {
                            // Handle file upload
                            onThumbnailChange(file);

                            // Create a preview URL
                            const url = URL.createObjectURL(file);
                            setPreviewUrl(url);

                            // Prevent default upload behavior
                            return false;
                        }}
                    >
                        <Button icon={<FiUpload />}>Upload Thumbnail</Button>
                    </Upload>
                </div>
            </Form.Item>

            <Form.Item label="Visibility">
                <div className="flex items-center">
                    <Switch
                        checked={quizData.isPublic}
                        onChange={(checked) => onChange('isPublic', checked)}
                    />
                    <span className="ml-2">
                        {quizData.isPublic ? 'Public (visible to everyone)' : 'Private (only visible to you)'}
                    </span>
                </div>
            </Form.Item>
        </Form>
    );
};

export default QuizFormDetails;