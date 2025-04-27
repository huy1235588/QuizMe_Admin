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
import {
    ArrowLeftOutlined,
    SaveOutlined,
    PlusOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { RcFile } from 'antd/es/upload';
import axiosInstance from '@/utils/axios';
import { Category } from '@/types/database';
import ImageCropper from '@/components/ImageCropper';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// Các điểm cuối API
const API_ENDPOINTS = {
    CATEGORIES: '/api/categories',
    CATEGORY: (id: number) => `/api/categories/${id}`,
    UPLOAD_IMAGE: '/api/upload/images'
};

export default function CategoryDetailPage() {
    // Khởi tạo hooks và states
    const router = useRouter();
    const params = useParams();
    const id = params.id === 'new' ? null : Number(params.id);
    const isNewCategory = id === null;
    const { enqueueSnackbar } = useSnackbar();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [iconPreview, setIconPreview] = useState<string>('');

    const [showCropper, setShowCropper] = useState(false);
    const [selectedFile, setSelectedFile] = useState<RcFile | null>(null);

    // Lấy dữ liệu danh mục khi chỉnh sửa danh mục hiện có
    useEffect(() => {
        if (!isNewCategory) {
            fetchCategoryDetails();
        }
    }, [id]);

    // Hàm để lấy chi tiết danh mục
    const fetchCategoryDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY(id as number));
            const category = response.data.data;

            // Thiết lập giá trị cho form
            form.setFieldsValue({
                name: category.name,
                description: category.description,
                isActive: category.isActive
            });

            // Thiết lập xem trước biểu tượng nếu có
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
        } catch (error) {
            console.error('Error fetching category details:', error);
            enqueueSnackbar('Failed to fetch category details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình tải lên tệp hình ảnh
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG/GIF file!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        else {
            setSelectedFile(file);
            setShowCropper(true);
        }

        // // Tạo URL xem trước
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //     setIconPreview(e.target?.result as string);
        // };
        // reader.readAsDataURL(file);

        // Trả về false để ngăn tải lên tự động, chúng ta sẽ xử lý thủ công
        return false;
    };

    // Xử lý sự kiện thay đổi biểu tượng
    const handleIconChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Xử lý tải tệp lên máy chủ
    const uploadIcon = async (file: RcFile): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        setUploadLoading(true);
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                return response.data.data.url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading icon:', error);
            throw error;
        } finally {
            setUploadLoading(false);
        }
    };

    // Xử lý gửi biểu mẫu
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let iconUrl = iconPreview;

            // Tải lên biểu tượng nếu một tệp mới được chọn
            if (fileList.length > 0 && fileList[0].originFileObj) {
                try {
                    iconUrl = await uploadIcon(fileList[0].originFileObj as RcFile);
                } catch (error) {
                    enqueueSnackbar('Failed to upload icon', { variant: 'error' });
                    setLoading(false);
                    return;
                }
            }

            const categoryData = {
                ...values,
                iconUrl: iconUrl,
            };

            if (isNewCategory) {
                // Tạo danh mục mới
                await axiosInstance.post(API_ENDPOINTS.CATEGORIES, categoryData);
                enqueueSnackbar('Category created successfully!', { variant: 'success' });
            } else {
                // Cập nhật danh mục hiện có
                await axiosInstance.put(API_ENDPOINTS.CATEGORY(id as number), categoryData);
                enqueueSnackbar('Category updated successfully!', { variant: 'success' });
            }

            // Quay lại danh sách danh mục
            router.push('/categories');
        } catch (error) {
            console.error('Error saving category:', error);
            enqueueSnackbar('Failed to save category', { variant: 'error' });
        } finally {
            setLoading(false);
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
                    onCancel={() => {
                        setShowCropper(false);
                        setSelectedFile(null);
                    }}
                    onCrop={(blob) => {
                        const file = new File([blob], selectedFile.name, {
                            type: blob.type,
                        });
                        setFileList([
                            {
                                uid: '0',
                                name: file.name,
                                status: 'done',
                                originFileObj: file,
                                url: URL.createObjectURL(blob),
                            },
                        ]);
                        setIconPreview(URL.createObjectURL(blob));
                        setShowCropper(false);
                        setSelectedFile(null);
                    }}
                />
            )}

            <Card
                title={
                    <div className="flex items-center">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleCancel}
                            style={{ marginRight: 16 }}
                        />
                        <Title level={4} style={{ margin: 0 }}>
                            {isNewCategory ? 'Add New Category' : 'Edit Category'}
                        </Title>
                    </div>
                }
                loading={loading}
            >
                <Spin spinning={loading || uploadLoading}>
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
                            label="Category Name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the category name'
                                },
                                {
                                    max: 50,
                                    message: 'Category name cannot exceed 50 characters'
                                }
                            ]}
                        >
                            <Input placeholder="Enter category name" />
                        </Form.Item>

                        {/* Trường mô tả */}
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter a description'
                                },
                                {
                                    max: 200,
                                    message: 'Description cannot exceed 200 characters'
                                }
                            ]}
                        >
                            <TextArea
                                placeholder="Enter category description"
                                rows={4}
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>

                        {/* Trường tải lên biểu tượng */}
                        <Form.Item
                            label="Category Icon"
                            required
                            tooltip="Upload an image to represent this category (JPG, PNG, GIF, max 2MB)"
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
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag icon file to this area to upload</p>
                                <p className="ant-upload-hint">
                                    Recommended size: 128x128 pixels. Supports JPG, PNG, GIF
                                </p>
                            </Dragger>

                            {iconPreview && (
                                <div className="mt-4">
                                    <p>Preview:</p>
                                    <div className="w-32 h-32 border border-gray-200 rounded overflow-hidden mt-2">
                                        <img
                                            src={iconPreview}
                                            alt="Category icon preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </Form.Item>

                        {/* Chuyển đổi trạng thái hoạt động */}
                        <Form.Item
                            name="isActive"
                            label="Status"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                defaultChecked
                            />
                        </Form.Item>

                        {/* Các hành động của biểu mẫu */}
                        <Form.Item>
                            <div className="flex justify-end pt-4">
                                <Space size="middle">
                                    <Button
                                        onClick={handleCancel}
                                        className="px-6 hover:bg-gray-50 border border-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        htmlType="submit"
                                        loading={loading}
                                        className="px-6 flex items-center gap-1 bg-blue-500 hover:bg-blue-600 shadow-sm"
                                    >
                                        {isNewCategory ? 'Create Category' : 'Update Category'}
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