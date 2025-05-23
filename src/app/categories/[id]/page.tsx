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
import axiosInstance from '@/utils/axios';
import ImageCropper from '@/components/ImageCropper';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// Các điểm cuối API
const API_ENDPOINTS = {
    CATEGORIES: '/api/categories',
    CATEGORY: (id: number) => `/api/categories/${id}`
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

        // Trả về false để ngăn tải lên tự động, chúng ta sẽ xử lý thủ công
        return false;
    };

    // Xử lý sự kiện thay đổi biểu tượng
    const handleIconChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Tạo FormData cho category
    const createCategoryFormData = (values: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        
        if (values.description) {
            formData.append('description', values.description);
        }
        
        formData.append('isActive', values.isActive.toString());
        
        // Thêm tệp biểu tượng nếu có
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('iconFile', fileList[0].originFileObj as RcFile);
        }
        
        return formData;
    };

    // Xử lý gửi biểu mẫu
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let result;
            
            if (isNewCategory) {
                // Tạo danh mục mới
                const formData = createCategoryFormData(values);
                result = await axiosInstance.post(API_ENDPOINTS.CATEGORIES, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                enqueueSnackbar('Category created successfully!', { variant: 'success' });
            } else {
                // Cập nhật danh mục hiện có
                if (fileList.length > 0 && fileList[0].originFileObj) {
                    // Cập nhật với icon mới (sử dụng FormData)
                    const formData = createCategoryFormData(values);
                    result = await axiosInstance.put(API_ENDPOINTS.CATEGORY(id as number), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    // Cập nhật không có icon mới (sử dụng JSON)
                    const categoryData = {
                        name: values.name,
                        description: values.description,
                        iconUrl: iconPreview,
                        isActive: values.isActive,
                    };
                    
                    result = await axiosInstance.put(API_ENDPOINTS.CATEGORY(id as number), categoryData);
                }
                
                enqueueSnackbar('Category updated successfully!', { variant: 'success' });
            }

            // Quay lại danh sách danh mục sau khi gửi thành công
            router.push('/categories');
            
        } catch (error: any) {
            console.error('Error saving category:', error);
            
            // Xử lý thông báo lỗi cụ thể hơn
            const errorMessage = error.response?.data?.message || 'Failed to save category';
            enqueueSnackbar(errorMessage, { variant: 'error' });
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
                title={
                    <div className="flex items-center">
                        <Button
                            icon={<FiArrowLeft />}
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
                                    min: 2,
                                    message: 'Category name must be at least 2 characters'
                                },
                                {
                                    max: 100,
                                    message: 'Category name cannot exceed 100 characters'
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
                                    <FiInbox />
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
                                        icon={<FiSave />}
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