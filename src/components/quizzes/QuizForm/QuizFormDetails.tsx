import React from 'react';
import { Form, Input, Select, Switch, Upload, Button } from 'antd';
import { FiUpload } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const t = useTranslations('quizzes');

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
            <Form.Item label={t('quizTitle')} required>
                <Input
                    value={quizData.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder={t('quizTitlePlaceholder')}
                />
            </Form.Item>

            <Form.Item label={t('description')}>
                <TextArea
                    value={quizData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    rows={4}
                />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={t('category')} required>
                    <Select
                        value={quizData.categoryIds}
                        onChange={(value) => onChange('categoryIds', value)}
                        mode="multiple"
                        placeholder={t('selectCategoryPlaceholder')}
                    >
                        {categories.map(category => (
                            <Option key={category.id} value={category.id}>{category.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label={t('difficulty')}>
                    <Select
                        value={quizData.difficulty}
                        onChange={(value) => onChange('difficulty', value)}
                    >
                        <Option value="EASY">{t('easy')}</Option>
                        <Option value="MEDIUM">{t('medium')}</Option>
                        <Option value="HARD">{t('hard')}</Option>
                    </Select>
                </Form.Item>
            </div>
            <Form.Item label={t('thumbnail')}>
                <div className="space-y-2">
                    {(quizData.thumbnailFile || previewUrl) && (
                        <div className="mb-2">
                            <img
                                src={previewUrl || (typeof quizData.thumbnailFile === 'string' ? quizData.thumbnailFile : undefined)}
                                alt={t('thumbnailPreviewAlt')}
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
                        <Button icon={<FiUpload />}>
                            {t('uploadThumbnail')}
                        </Button>
                    </Upload>
                </div>
            </Form.Item>

            <Form.Item label={t('visibility')}>
                <div className="flex items-center">
                    <Switch
                        checked={quizData.isPublic}
                        onChange={(checked) => onChange('isPublic', checked)}
                    />                    <span className="ml-2">
                        {quizData.isPublic ? t('publicVisibility') : t('privateVisibility')}
                    </span>
                </div>
            </Form.Item>
        </Form>
    );
};

export default QuizFormDetails;