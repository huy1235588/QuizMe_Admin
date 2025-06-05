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
    }; return (
        <div className="space-y-8">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    role: 'user',
                    isActive: true
                }}
            >
                {/* Avatar Upload Section */}
                <Card
                    className={`border-0 shadow-lg ${cardClass}`}
                    title={
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                🖼️ Ảnh đại diện
                            </span>
                        </div>
                    }
                    bordered={false}
                >
                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <div className={`p-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-500`}>
                                <Avatar
                                    size={120}
                                    icon={<UserOutlined />}
                                    src={avatarUrl}
                                    className="bg-white"
                                />
                            </div>
                            {!avatarUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <UserOutlined className="text-4xl mb-2" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Upload {...uploadProps}>
                                <Button
                                    icon={<UploadOutlined />}
                                    className={`h-10 px-6 font-medium ${isDarkMode
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600'
                                        }`}
                                >
                                    📷 Tải lên ảnh đại diện
                                </Button>
                            </Upload>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Định dạng: JPG, PNG. Kích thước tối đa: 2MB
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Basic Information */}
                <Card
                    className={`border-0 shadow-lg ${cardClass}`}
                    title={
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                📝 Thông tin cơ bản
                            </span>
                        </div>
                    }
                    bordered={false}
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="fullName"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        👤 Họ và tên
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập họ và tên đầy đủ"
                                    className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        📧 Địa chỉ email
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    placeholder="example@domain.com"
                                    className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Account Settings */}
                <Card
                    className={`border-0 shadow-lg ${cardClass}`}
                    title={
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ⚙️ Cài đặt tài khoản
                            </span>
                        </div>
                    }
                    bordered={false}
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        🔑 Vai trò
                                    </span>
                                }
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select
                                    placeholder="Chọn vai trò cho người dùng"
                                    className={isDarkMode ? 'dark-select' : ''}
                                    size="large"
                                >
                                    <Option value="user">
                                        <div className="flex items-center space-x-2">
                                            <span>👤</span>
                                            <span>Người dùng</span>
                                        </div>
                                    </Option>
                                    <Option value="admin">
                                        <div className="flex items-center space-x-2">
                                            <span>👑</span>
                                            <span>Quản trị viên</span>
                                        </div>
                                    </Option>
                                    <Option value="moderator">
                                        <div className="flex items-center space-x-2">
                                            <span>🛡️</span>
                                            <span>Điều hành viên</span>
                                        </div>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="isActive"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        🔓 Trạng thái tài khoản
                                    </span>
                                }
                                valuePropName="checked"
                            >
                                <div className="flex items-center space-x-3 mt-2">
                                    <Switch
                                        checkedChildren="✅ Kích hoạt"
                                        unCheckedChildren="🔒 Khóa"
                                        size="default"
                                        className="bg-gradient-to-r"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Tài khoản sẽ được kích hoạt ngay sau khi tạo
                                    </span>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Info Box */}
                    <div className={`mt-6 p-4 rounded-lg border-l-4 ${isDarkMode
                            ? 'bg-blue-900/20 border-blue-400 text-blue-300'
                            : 'bg-blue-50 border-blue-400 text-blue-700'
                        }`}>
                        <div className="flex items-start space-x-3">
                            <div className="text-xl">💡</div>
                            <div>
                                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                                    Lưu ý khi tạo tài khoản
                                </h4>
                                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                    <li>• Email sẽ được sử dụng làm tên đăng nhập</li>
                                    <li>• Mật khẩu tạm thời sẽ được gửi qua email</li>
                                    <li>• Người dùng nên đổi mật khẩu khi đăng nhập lần đầu</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        className={`h-12 px-8 font-medium ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
                        size="large"
                    >
                        ❌ Hủy bỏ
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        htmlType="submit"
                        loading={loading}
                        className={`h-12 px-8 font-medium bg-gradient-to-r from-green-500 to-emerald-500 border-0 hover:from-green-600 hover:to-emerald-600 ${loading ? 'opacity-70' : ''
                            }`}
                        size="large"
                    >
                        {loading ? '⏳ Đang tạo...' : '✅ Tạo người dùng'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default UserForm;
