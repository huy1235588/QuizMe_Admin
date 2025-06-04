"use client";

import React from 'react';
import { Card, Row, Col, Avatar, Tag, Button, Divider, Space, Statistic } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { UserResponse } from '@/types/database';

interface UserDetailCardProps {
    user: UserResponse;
    isDarkMode?: boolean;
    onEdit?: (user: UserResponse) => void;
    onToggleStatus?: (user: UserResponse) => void;
}

const UserDetailCard: React.FC<UserDetailCardProps> = ({
    user,
    isDarkMode = false,
    onEdit,
    onToggleStatus
}) => {
    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLastLoginText = () => {
        if (!user.lastLogin) return 'Chưa từng đăng nhập';
        const now = new Date();
        const lastLogin = new Date(user.lastLogin);
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return formatDate(user.lastLogin);
    };

    const getAccountAge = () => {
        const now = new Date();
        const created = new Date(user.createdAt);
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} ngày`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng`;
        return `${Math.floor(diffDays / 365)} năm`;
    };

    return (
        <Card className={cardClass} bordered={false}>
            <Row gutter={[24, 24]}>
                {/* Left Column - Avatar & Basic Info */}
                <Col xs={24} md={8}>
                    <div className="text-center space-y-4">
                        {/* Avatar với role badge */}
                        <div className="relative inline-block">
                            <Avatar
                                size={120}
                                src={user.profileImage}
                                icon={<UserOutlined />}
                                className={`${user.isActive ? '' : 'opacity-50'} shadow-lg`}
                            />
                            {user.role === 'ADMIN' && (
                                <div className="absolute -top-2 -right-2">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                        <CrownOutlined className="text-white text-sm" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2">
                            <h2 className={`text-xl font-bold m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.fullName}
                            </h2>
                            <p className={`text-base m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                @{user.username}
                            </p>
                        </div>

                        {/* Tags */}
                        <Space wrap className="justify-center">
                            <Tag
                                color={user.role === 'ADMIN' ? 'purple' : 'blue'}
                                className="px-3 py-1"
                            >
                                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                            </Tag>
                            <Tag
                                color={user.isActive ? 'green' : 'red'}
                                className="px-3 py-1"
                            >
                                {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                            </Tag>
                        </Space>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => onEdit?.(user)}
                                className="w-full"
                            >
                                Chỉnh sửa thông tin
                            </Button>
                            <Button
                                type={user.isActive ? "default" : "primary"}
                                icon={user.isActive ? <LockOutlined /> : <UnlockOutlined />}
                                onClick={() => onToggleStatus?.(user)}
                                className="w-full"
                                danger={user.isActive}
                            >
                                {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </Button>
                        </div>
                    </div>
                </Col>

                {/* Right Column - Detailed Info */}
                <Col xs={24} md={16}>
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <MailOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Divider className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                        {/* Account Information */}
                        <div>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Thông tin tài khoản
                            </h3>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Ngày tham gia"
                                        value={formatDate(user.createdAt)}
                                        prefix={<CalendarOutlined />}
                                        valueStyle={{
                                            fontSize: '14px',
                                            color: isDarkMode ? '#fff' : '#666'
                                        }}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Lần đăng nhập cuối"
                                        value={getLastLoginText()}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{
                                            fontSize: '14px',
                                            color: isDarkMode ? '#fff' : '#666'
                                        }}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Thời gian hoạt động"
                                        value={getAccountAge()}
                                        prefix={<UserOutlined />}
                                        valueStyle={{
                                            fontSize: '14px',
                                            color: isDarkMode ? '#fff' : '#666'
                                        }}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="ID người dùng"
                                        value={`#${user.id}`}
                                        valueStyle={{
                                            fontSize: '14px',
                                            color: isDarkMode ? '#fff' : '#666'
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <Divider className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                        {/* Additional Information */}
                        <div>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Thông tin bổ sung
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        Ngày cập nhật cuối:
                                    </span>
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        {user.updatedAt ? formatDate(user.updatedAt) : 'Chưa cập nhật'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        Định danh duy nhất:
                                    </span>
                                    <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        user_{user.id}_{user.username}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default UserDetailCard;
