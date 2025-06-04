"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, Switch, Avatar, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;

interface UserFormData {
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
    avatar?: string;
}

interface UserFormProps {
    isDarkMode?: boolean;
    onSave: (userData: UserFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    isDarkMode = false,
    onSave,
    onCancel,
    loading = false
}) => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    const handleSubmit = async (values: UserFormData) => {
        try {
            await onSave({
                ...values,
                avatar: avatarUrl
            });
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const uploadProps: UploadProps = {
        name: 'avatar',
        listType: 'picture',
        maxCount: 1,
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('Chỉ có thể tải lên file JPG/PNG!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
                return false;
            }

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            return false; // Prevent auto upload
        },
        onRemove: () => {
            setAvatarUrl('');
        }
    };

    return (
        <Card
            className={cardClass}
            title={
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    Thông tin người dùng mới
                </span>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    role: 'user',
                    isActive: true
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        {/* Avatar Upload */}
                        <div className="text-center mb-6">
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                src={avatarUrl}
                                className="mb-4"
                            />
                            <Upload {...uploadProps}>
                                <Button
                                    icon={<UploadOutlined />}
                                    className={isDarkMode ? 'border-gray-600' : ''}
                                >
                                    Tải lên ảnh đại diện
                                </Button>
                            </Upload>
                        </div>
                    </Col>

                    <Col xs={24} md={16}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="fullName"
                                    label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Họ và tên</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ và tên!' },
                                        { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập họ và tên"
                                        className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="email"
                                    label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập địa chỉ email"
                                        className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="role"
                                    label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Vai trò</span>}
                                    rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                                >
                                    <Select
                                        placeholder="Chọn vai trò"
                                        className={isDarkMode ? 'dark-select' : ''}
                                    >
                                        <Option value="user">Người dùng</Option>
                                        <Option value="admin">Quản trị viên</Option>
                                        <Option value="moderator">Điều hành viên</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="isActive"
                                    label={<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Trạng thái tài khoản</span>}
                                    valuePropName="checked"
                                >
                                    <Switch
                                        checkedChildren="Kích hoạt"
                                        unCheckedChildren="Khóa"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        className={isDarkMode ? 'border-gray-600' : ''}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        htmlType="submit"
                        loading={loading}
                        className={isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    >
                        Tạo người dùng
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default UserForm;
