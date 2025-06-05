"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    Upload,
    message,
    Space,
    Typography,
    Spin
} from 'antd';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { FiInbox } from 'react-icons/fi';
import { useSnackbar } from 'notistack';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { RcFile } from 'antd/es/upload';
import { useCategory, useCategories } from '@/hooks/useCategories';
import { CategoryRequest } from '@/types/database';
import ImageCropper from '@/components/ImageCropper';
import { useTranslations } from 'next-intl';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function CategoryDetailPage() {
    const t = useTranslations('categories');
    const tCommon = useTranslations('common');

    // Khởi tạo hooks và states
    const router = useRouter();
    const params = useParams();
    const id = params.id === 'new' ? null : Number(params.id);
    const isNewCategory = id === null;
    const { enqueueSnackbar } = useSnackbar();

    // Sử dụng custom hooks
    const { createCategory, updateCategory } = useCategories();
    const {
        category,
        isLoading: categoryLoading,
        error: categoryError
    } = useCategory(id);

    // Local states
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [iconPreview, setIconPreview] = useState<string>('');
    const [showCropper, setShowCropper] = useState(false);
    const [selectedFile, setSelectedFile] = useState<RcFile | null>(null);

    // Set form data when category is loaded
    useEffect(() => {
        if (category && !isNewCategory) {
            form.setFieldsValue({
                name: category.name,
                description: category.description,
                isActive: category.isActive
            });

            // Set icon preview if available
            if (category.iconUrl) {
                setIconPreview(category.iconUrl);
                setFileList([
                    {
                        uid: '-1',
                        name: 'category-icon.png',
                        status: 'done',
                        url: category.iconUrl,
                    },
                ]);
            }
        }
    }, [category, isNewCategory, form]);

    // Show error notification if any
    useEffect(() => {
        if (categoryError) {
            enqueueSnackbar(categoryError, { variant: 'error' });
        }
    }, [categoryError, enqueueSnackbar]);

    // Cấu hình tải lên tệp hình ảnh
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
            message.error(t('uploadFileTypeError'));
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error(t('uploadFileSizeError'));
            return false;
        }

        else {
            setSelectedFile(file);
            setShowCropper(true);
        }

        // Trả về false để ngăn tải lên tự động, chúng ta sẽ xử lý thủ công
        return false;
    };

    // Xử lý sự kiện thay đổi biểu tượng
    const handleIconChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Tạo CategoryRequest từ form values
    const createCategoryRequest = (values: any): CategoryRequest => {
        const categoryRequest: CategoryRequest = {
            name: values.name,
            description: values.description || '',
            isActive: values.isActive,
        };

        // Thêm file icon nếu có file mới
        if (fileList.length > 0 && fileList[0].originFileObj) {
            categoryRequest.iconFile = fileList[0].originFileObj as File;
        }

        return categoryRequest;
    };

    // Xử lý gửi biểu mẫu
    const handleSubmit = async (values: any) => {
        setSubmitLoading(true);
        try {
            const categoryRequest = createCategoryRequest(values); if (isNewCategory) {
                // Tạo danh mục mới
                await createCategory(categoryRequest);
                enqueueSnackbar(t('categoryCreatedSuccess'), { variant: 'success' });
            } else {
                // Cập nhật danh mục hiện có
                await updateCategory(id as number, categoryRequest);
                enqueueSnackbar(t('categoryUpdatedSuccess'), { variant: 'success' });
            }

            // Quay lại danh sách danh mục sau khi gửi thành công
            router.push('/categories');

        } catch (error: any) {
            console.error('Error saving category:', error);

            // Error message will be handled by hook, but we can show additional feedback
            const errorMessage = error.message || (isNewCategory ? t('categoryCreateFailed') : t('categoryUpdateFailed'));
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setSubmitLoading(false);
        }
    };

    // Xử lý hủy bỏ
    const handleCancel = () => {
        router.push('/categories');
    };

    // Hiển thị component
    return (
        <div className="category-detail-page">
            {/* Cropper Modal */}
            {showCropper && selectedFile && (
                <ImageCropper
                    visible={showCropper}
                    imageSrc={URL.createObjectURL(selectedFile)}
                    aspectRatio={1}
                    onCancel={() => {
                        setShowCropper(false);
                        setSelectedFile(null);
                    }}
                    onCrop={(blob) => {
                        // Create a new File object from the cropped blob with RcFile properties
                        const file = new File([blob], selectedFile.name, {
                            type: blob.type || 'image/png',
                            lastModified: Date.now()
                        }) as RcFile;

                        // Add the required RcFile properties
                        file.uid = `rc-upload-${Date.now()}`;

                        // Update the fileList with the cropped image
                        const objectUrl = URL.createObjectURL(blob);
                        setFileList([
                            {
                                uid: file.uid,
                                name: file.name,
                                status: 'done',
                                originFileObj: file,
                                url: objectUrl,
                            },
                        ]);

                        // Set the preview image
                        setIconPreview(objectUrl);

                        // Reset cropper state
                        setShowCropper(false);
                        setSelectedFile(null);
                    }}
                />
            )}
            <Card
                title={<div className="flex items-center">
                    <Button
                        icon={<FiArrowLeft />}
                        onClick={handleCancel}
                        style={{ marginRight: 16 }}
                    />                    <Title level={4} style={{ margin: 0 }}>
                        {isNewCategory ? t('addNewCategory') : t('editCategory')}
                    </Title>
                </div>}
                loading={categoryLoading}
            >
                <Spin spinning={categoryLoading || submitLoading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            name: '',
                            description: '',
                            isActive: true
                        }}
                    >
                        {/* Trường tên */}
                        <Form.Item
                            name="name"
                            label={t('categoryName')}
                            rules={[
                                {
                                    required: true,
                                    message: t('categoryNameRequired')
                                },
                                {
                                    min: 2,
                                    message: t('categoryNameMinLength')
                                },
                                {
                                    max: 100,
                                    message: t('categoryNameMaxLength')
                                }
                            ]}
                        >
                            <Input placeholder={t('enterCategoryName')} />
                        </Form.Item>

                        {/* Trường mô tả */}
                        <Form.Item
                            name="description"
                            label={t('description')}
                            rules={[
                                {
                                    max: 200,
                                    message: t('descriptionMaxLength')
                                }
                            ]}
                        >
                            <TextArea
                                placeholder={t('enterCategoryDescription')}
                                rows={4}
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>

                        {/* Trường tải lên biểu tượng */}
                        <Form.Item
                            label={t('categoryIcon')}
                            tooltip={t('uploadIconTooltip')}
                        >
                            <Dragger
                                name="iconFile"
                                fileList={fileList}
                                beforeUpload={beforeUpload}
                                onChange={handleIconChange}
                                maxCount={1}
                                listType="picture"
                                accept="image/png,image/jpeg,image/gif"
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                }}
                                style={{
                                    width: '100%',
                                    marginBottom: 24
                                }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <FiInbox />
                                </p>
                                <p className="ant-upload-text">{t('clickOrDragIcon')}</p>
                                <p className="ant-upload-hint">
                                    {t('recommendedSize')}
                                </p>
                            </Dragger>

                            {iconPreview && (
                                <div className="mt-4">
                                    <p>{t('preview')}:</p>
                                    <div className="w-32 h-32 border border-gray-200 rounded overflow-hidden mt-2">
                                        <img
                                            src={iconPreview}
                                            alt={t('categoryIconPreview')}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </Form.Item>

                        {/* Chuyển đổi trạng thái hoạt động */}
                        <Form.Item
                            name="isActive"
                            label={t('status')}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={t('active')}
                                unCheckedChildren={t('inactive')}
                                defaultChecked
                            />
                        </Form.Item>                        {/* Các hành động của biểu mẫu */}
                        <Form.Item>
                            <div className="flex justify-end pt-4">
                                <Space size="middle">
                                    <Button
                                        onClick={handleCancel}
                                        className="px-6 hover:bg-gray-50 border border-gray-200"
                                    >
                                        {tCommon('cancel')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<FiSave />}
                                        htmlType="submit"
                                        loading={submitLoading}
                                        className="px-6 flex items-center gap-1 bg-blue-500 hover:bg-blue-600 shadow-sm"
                                    >
                                        {isNewCategory ? t('createCategory') : t('updateCategory')}
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
}