"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, Switch, Avatar, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { UserRequest } from '@/types/database';

const { Option } = Select;

interface UserFormProps {
    isDarkMode?: boolean;
    onSave: (userData: UserRequest) => Promise<void>;
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
    const [avatarFile, setAvatarFile] = useState<File | undefined>();

    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    const handleSubmit = async (values: UserRequest) => {
        try {
            const userData: UserRequest = {
                username: values.username,
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                role: values.role,
                isActive: values.isActive,
                profileImage: avatarFile
            };
            await onSave(userData);
        } catch (error) {
            console.error('Lỗi khi lưu người dùng:', error);
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

            // Lưu file để gửi lên server
            setAvatarFile(file);

            // Tạo URL xem trước ảnh
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setAvatarUrl(result);
                }
            };
            reader.readAsDataURL(file);

            return false; // Ngăn tải lên tự động
        },
        onRemove: () => {
            setAvatarUrl('');
            setAvatarFile(undefined);
        }
    };

    return (
        <div className="space-y-8">
            <Form
                form={form}
                layout="vertical" onFinish={handleSubmit}
                initialValues={{
                    role: 'USER',
                    isActive: true
                }}
            >
                {/* Phần tải lên ảnh đại diện */}
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
                    variant='borderless'
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

                {/* Thông tin cơ bản */}
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
                >                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="username"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        👤 Tên đăng nhập
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!' }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập tên đăng nhập"
                                    className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="fullName"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        🏷️ Họ và tên
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

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password"
                                label={
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        🔒 Mật khẩu
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu"
                                    className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Cài đặt tài khoản */}
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
                            >                                <Select
                                placeholder="Chọn vai trò cho người dùng"
                                className={isDarkMode ? 'dark-select' : ''}
                                size="large"
                            >
                                    <Option value="USER">
                                        <div className="flex items-center space-x-2">
                                            <span>👤</span>
                                            <span>Người dùng</span>
                                        </div>
                                    </Option>
                                    <Option value="ADMIN">
                                        <div className="flex items-center space-x-2">
                                            <span>👑</span>
                                            <span>Quản trị viên</span>
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

                    {/* Hộp thông tin */}
                    <div className={`mt-6 p-4 rounded-lg border-l-4 ${isDarkMode
                        ? 'bg-blue-900/20 border-blue-400 text-blue-300'
                        : 'bg-blue-50 border-blue-400 text-blue-700'
                        }`}>
                        <div className="flex items-start space-x-3">
                            <div className="text-xl">💡</div>
                            <div>
                                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                                    Lưu ý khi tạo tài khoản
                                </h4>                                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                    <li>• Tên đăng nhập phải là duy nhất trong hệ thống</li>
                                    <li>• Email sẽ được sử dụng để thông báo và khôi phục mật khẩu</li>
                                    <li>• Mật khẩu nên có ít nhất 6 ký tự để đảm bảo bảo mật</li>
                                    <li>• Người dùng có thể đổi mật khẩu sau khi đăng nhập</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Các nút hành động */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        className={`h-12 px-8 font-medium ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
                        size="large"
                    >
                        Hủy bỏ
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
                        {loading ? '⏳ Đang tạo...' : 'Tạo người dùng'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default UserForm;
