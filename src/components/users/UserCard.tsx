"use client";

import React from 'react';
import { Card, Avatar, Tag, Space, Button, Tooltip } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    UnlockOutlined,
    EyeOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { UserResponse } from '@/types/database';
import { useRouter } from 'next/navigation';

interface UserCardProps {
    user: UserResponse;
    isDarkMode?: boolean;
    onEdit?: (user: UserResponse) => void;
    onDelete?: (user: UserResponse) => void;
    onToggleStatus?: (user: UserResponse) => void;
    onView?: (user: UserResponse) => void;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    isDarkMode = false,
    onEdit,
    onDelete,
    onToggleStatus,
    onView
}) => {
    const router = useRouter();

    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
        : 'bg-white border-gray-200 hover:bg-gray-50';

    const handleView = () => {
        if (onView) {
            onView(user);
        } else {
            router.push(`/users/${user.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getLastLoginText = () => {
        if (!user.lastLogin) return 'Chưa đăng nhập';
        const now = new Date();
        const lastLogin = new Date(user.lastLogin);
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return formatDate(user.lastLogin);
    };

    return (
        <Card
            className={`${cardClass} transition-all duration-200 cursor-pointer`}
            variant='borderless'
            hoverable
            onClick={handleView}
            actions={[
                <Tooltip title="Xem chi tiết" key="view">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleView();
                        }}
                    />
                </Tooltip>,
                <Tooltip title="Chỉnh sửa" key="edit">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(user);
                        }}
                    />
                </Tooltip>,
                <Tooltip title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"} key="toggle">
                    <Button
                        type="text"
                        icon={user.isActive ? <LockOutlined /> : <UnlockOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus?.(user);
                        }}
                    />
                </Tooltip>,
                <Tooltip title="Xóa" key="delete">
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(user);
                        }}
                    />
                </Tooltip>
            ]}
        >
            <div className="text-center space-y-3">
                {/* Avatar và Role Badge */}
                <div className="relative inline-block">
                    <Avatar
                        size={64}
                        src={user.profileImage}
                        icon={<UserOutlined />}
                        className={user.isActive ? '' : 'opacity-50'}
                    />
                    {user.role === 'ADMIN' && (
                        <div className="absolute -top-1 -right-1">
                            <Tooltip title="Quản trị viên">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <CrownOutlined className="text-white text-xs" />
                                </div>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="space-y-2">
                    <h4 className={`text-lg font-semibold m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.fullName}
                    </h4>
                    <p className={`text-sm m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        @{user.username}
                    </p>
                    <p className={`text-sm m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                    </p>
                </div>

                {/* Tags */}
                <Space wrap className="justify-center">
                    <Tag
                        color={user.role === 'ADMIN' ? 'purple' : 'blue'}
                        className="text-xs"
                    >
                        {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </Tag>
                    <Tag
                        color={user.isActive ? 'green' : 'red'}
                        className="text-xs"
                    >
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </Tag>
                </Space>

                {/* Dates */}
                <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div>Tham gia: {formatDate(user.createdAt)}</div>
                    <div>Lần cuối: {getLastLoginText()}</div>
                </div>
            </div>
        </Card>
    );
};

export default UserCard;
