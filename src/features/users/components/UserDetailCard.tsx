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
    CrownOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { UserResponse } from '@/shared/types/database';

interface UserDetailCardProps {
    user: UserResponse;
    isDarkMode?: boolean;
    onEdit?: (user: UserResponse) => void;
    onToggleStatus?: (user: UserResponse) => void;
    onDelete?: () => void;
}

const UserDetailCard: React.FC<UserDetailCardProps> = ({
    user,
    isDarkMode = false,
    onEdit,
    onToggleStatus,
    onDelete
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
    }; return (
        <div className="space-y-8">
            {/* User Profile Header */}
            <div className={`relative overflow-hidden rounded-2xl p-8 ${isDarkMode
                ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
                : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200'
                }`}>
                <div className="relative z-10">
                    <Row gutter={[32, 32]} align="middle">
                        <Col xs={24} lg={8}>
                            <div className="text-center space-y-6">
                                {/* Enhanced Avatar */}
                                <div className="relative inline-block">
                                    <div className={`p-1 rounded-full ${user.isActive
                                        ? 'bg-gradient-to-r from-green-400 to-blue-500'
                                        : 'bg-gradient-to-r from-gray-400 to-gray-600'
                                        }`}>
                                        <Avatar
                                            size={140}
                                            src={user.profileImage}
                                            icon={<UserOutlined />}
                                            className={`${user.isActive ? '' : 'opacity-50'} bg-white`}
                                        />
                                    </div>
                                    {user.role === 'ADMIN' && (
                                        <div className="absolute -top-2 -right-2">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                <CrownOutlined className="text-white text-lg" />
                                            </div>
                                        </div>
                                    )}
                                    {/* Online Status Indicator */}
                                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-3 border-white ${user.isActive ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                </div>

                                {/* User Info */}
                                <div className="space-y-3">
                                    <h2 className={`text-2xl font-bold m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {user.fullName}
                                    </h2>
                                    <p className={`text-lg m-0 font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                        @{user.username}
                                    </p>
                                    <div className="flex justify-center items-center space-x-2">
                                        <MailOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {user.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Enhanced Tags */}
                                <div className="flex justify-center space-x-3">
                                    <div className={`px-4 py-2 rounded-full font-medium text-sm ${user.role === 'ADMIN'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                        }`}>
                                        {user.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Người dùng'}
                                    </div>
                                    <div className={`px-4 py-2 rounded-full font-medium text-sm ${user.isActive
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                        }`}>
                                        {user.isActive ? '✅ Hoạt động' : '🔒 Bị khóa'}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={16}>
                            <div className="space-y-8">
                                {/* Quick Stats */}
                                <Row gutter={[24, 24]}>
                                    <Col xs={12} sm={6}>
                                        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
                                            }`}>
                                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                #{user.id}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                User ID
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
                                            }`}>
                                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                {getAccountAge()}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Thời gian hoạt động
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
                                            }`}>
                                            <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                                {getLastLoginText()}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Đăng nhập cuối
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
                                            }`}>
                                            <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Ngày tham gia
                                            </div>
                                        </div>
                                    </Col>
                                </Row>                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => onEdit?.(user)}
                                        className="flex-1 min-w-[180px] h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-cyan-500 border-0 hover:from-blue-600 hover:to-cyan-600"
                                        size="large"
                                    >
                                        Chỉnh sửa thông tin
                                    </Button>
                                    <Button
                                        type={user.isActive ? "default" : "primary"}
                                        icon={user.isActive ? <LockOutlined /> : <UnlockOutlined />}
                                        onClick={() => onToggleStatus?.(user)}
                                        className={`flex-1 min-w-[180px] h-12 text-base font-medium border-0 ${user.isActive
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                            }`}
                                        size="large"
                                    >
                                        {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={onDelete}
                                        className="flex-1 min-w-[180px] h-12 text-base font-medium bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 text-white"
                                        size="large"
                                    >
                                        Xóa người dùng
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Detailed Information Cards */}
            <Row gutter={[24, 24]}>
                {/* Account Information */}
                <Col xs={24} lg={12}>
                    <Card
                        className={`h-full border-0 shadow-lg ${cardClass}`}
                        title={
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    🔐 Thông tin tài khoản
                                </span>
                            </div>
                        }
                        bordered={false}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Ngày tạo tài khoản:
                                </span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatDate(user.createdAt)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Cập nhật lần cuối:
                                </span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {user.updatedAt ? formatDate(user.updatedAt) : 'Chưa cập nhật'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Mã định danh:
                                </span>
                                <span className={`font-mono text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    user_{user.id}_{user.username}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Activity Information */}
                <Col xs={24} lg={12}>
                    <Card
                        className={`h-full border-0 shadow-lg ${cardClass}`}
                        title={
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    📊 Hoạt động gần đây
                                </span>
                            </div>
                        }
                        bordered={false}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <ClockCircleOutlined className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} />
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Đăng nhập cuối cùng
                                    </span>
                                </div>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {getLastLoginText()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <UserOutlined className={isDarkMode ? 'text-green-400' : 'text-green-500'} />
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Trạng thái hiện tại
                                    </span>
                                </div>
                                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${user.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                    {user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center space-x-3">
                                    <CalendarOutlined className={isDarkMode ? 'text-purple-400' : 'text-purple-500'} />
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Thời gian tham gia
                                    </span>
                                </div>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {getAccountAge()}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserDetailCard;
