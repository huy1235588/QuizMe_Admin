import React from 'react';
import { Form, Input, Select, Switch, Upload, Button } from 'antd';
import { FiUpload } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';
import { useEffect, useState } from 'react';
import { QuizRequest, CategoryResponse, ApiResponse, CategoryListResponse } from '@/types/database';

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
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(
        typeof quizData.quizThumbnails === 'string' ? quizData.quizThumbnails : undefined
    );

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Call API to get categories list
                const response = await axiosInstance.get<ApiResponse<CategoryListResponse>>('/api/categories');
                
                if (response.data?.status === 'success' && response.data.data?.categories) {
                    setCategories(response.data.data.categories);
                } else {
                    // Fallback to mock data if API isn't available yet
                    setCategories([
                        { id: 1, name: 'Science', description: 'Science quizzes', icon_url: '/icons/science.png' },
                        { id: 2, name: 'History', description: 'History quizzes', icon_url: '/icons/history.png' },
                        { id: 3, name: 'Mathematics', description: 'Math quizzes', icon_url: '/icons/math.png' },
                        { id: 4, name: 'Literature', description: 'Literature quizzes', icon_url: '/icons/literature.png' },
                        { id: 5, name: 'Geography', description: 'Geography quizzes', icon_url: '/icons/geography.png' },
                        { id: 6, name: 'Programming', description: 'Programming quizzes', icon_url: '/icons/programming.png' },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Fallback to mock data if API call fails
                setCategories([
                    { id: 1, name: 'Science', description: 'Science quizzes', icon_url: '/icons/science.png' },
                    { id: 2, name: 'History', description: 'History quizzes', icon_url: '/icons/history.png' },
                    { id: 3, name: 'Mathematics', description: 'Math quizzes', icon_url: '/icons/math.png' },
                    { id: 4, name: 'Literature', description: 'Literature quizzes', icon_url: '/icons/literature.png' },
                    { id: 5, name: 'Geography', description: 'Geography quizzes', icon_url: '/icons/geography.png' },
                    { id: 6, name: 'Programming', description: 'Programming quizzes', icon_url: '/icons/programming.png' },
                ]);
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
                        value={quizData.categoryId}
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
                    {previewUrl && (
                        <div className="mb-2">
                            <img 
                                src={previewUrl} 
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