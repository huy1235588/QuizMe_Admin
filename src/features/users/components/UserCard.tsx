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
import { UserResponse } from '@/shared/types/database';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

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
    const t = useTranslations('users');
    const locale = useLocale();

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
        return new Date(dateString).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getLastLoginText = () => {
        if (!user.lastLogin) return t('neverLoggedIn');
        const now = new Date();
        const lastLogin = new Date(user.lastLogin);
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('today');
        if (diffDays === 1) return t('yesterday');
        if (diffDays < 7) return t('daysAgo', { days: diffDays });
        return formatDate(user.lastLogin);
    };

    return (
        <Card
            className={`${cardClass} transition-all duration-200 cursor-pointer`}
            variant='borderless'
            hoverable
            onClick={handleView}
            actions={[
                <Tooltip title={t('viewDetails')} key="view">
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
                <Tooltip title={t('editUser')} key="edit">
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
                <Tooltip title={user.isActive ? t('lockAccount') : t('unlockAccount')} key="toggle">
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
                <Tooltip title={t('deleteUser')} key="delete">
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
                            <Tooltip title={t('admin')}>
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
                        {user.role === 'ADMIN' ? t('admin') : t('user')}
                    </Tag>
                    <Tag
                        color={user.isActive ? 'green' : 'red'}
                        className="text-xs"
                    >
                        {user.isActive ? t('active') : t('locked')}
                    </Tag>
                </Space>                {/* Dates */}
                <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div>{t('joinedDate')}: {formatDate(user.createdAt)}</div>
                    <div>{t('lastLogin')}: {getLastLoginText()}</div>
                </div>
            </div>
        </Card>
    );
};

export default UserCard;
