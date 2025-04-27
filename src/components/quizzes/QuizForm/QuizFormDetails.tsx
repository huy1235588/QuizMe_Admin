import React from 'react';
import { Form, Input, Select, Switch, Upload, Button } from 'antd';
import { FiUpload } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface QuizFormDetailsProps {
    quizData: {
        title: string;
        description: string;
        categoryId: number | null;
        difficulty: string;
        isPublic: boolean;
        thumbnailUrl?: string;
    };
    onChange: (field: string, value: any) => void;
}

const QuizFormDetails: React.FC<QuizFormDetailsProps> = ({ quizData, onChange }) => {
    const [categories, setCategories] = useState<Array<{ id: number, name: string }>>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Trong thực tế sẽ gọi API để lấy danh sách danh mục
                // const response = await axiosInstance.get('/api/categories');
                // setCategories(response.data.data);

                // Dữ liệu giả lập cho demo
                setCategories([
                    { id: 1, name: 'Science' },
                    { id: 2, name: 'History' },
                    { id: 3, name: 'Mathematics' },
                    { id: 4, name: 'Literature' },
                    { id: 5, name: 'Geography' },
                    { id: 6, name: 'Programming' },
                ]);
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
                        <Option value="easy">Easy</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="hard">Hard</Option>
                    </Select>
                </Form.Item>
            </div>

            <Form.Item label="Thumbnail">
                <Upload
                    name="thumbnail"
                    listType="picture"
                    maxCount={1}
                    // Trong thực tế sẽ cấu hình action để upload lên server
                    beforeUpload={() => false}
                    onChange={(info) => {
                        if (info.file) {
                            // Trong thực tế sẽ xử lý upload file và lấy URL
                            // Giả lập thành công
                            onChange('thumbnailUrl', URL.createObjectURL(info.file as any));
                        }
                    }}
                >
                    <Button icon={<FiUpload />}>Upload Thumbnail</Button>
                </Upload>
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