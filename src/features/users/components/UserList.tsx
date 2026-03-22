"use client";

import React from 'react';
import { Table, Avatar, Tag, Space, Button, Tooltip, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

interface UserListProps {
    users: UserResponse[];
    loading?: boolean;
    isDarkMode?: boolean;
    selectedUsers: number[];
    onEdit?: (user: UserResponse) => void;
    onDelete?: (user: UserResponse) => void;
    onToggleStatus?: (user: UserResponse) => void;
    onView?: (user: UserResponse) => void;
    onSelectUser?: (userId: number) => void;
    onSelectAll?: (checked: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    loading = false,
    isDarkMode = false,
    selectedUsers,
    onEdit,
    onDelete,
    onToggleStatus,
    onView,
    onSelectUser,
    onSelectAll
}) => {
    const router = useRouter();

    const handleView = (user: UserResponse) => {
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLastLoginText = (lastLogin?: string) => {
        if (!lastLogin) return 'Chưa đăng nhập';
        const now = new Date();
        const lastLoginDate = new Date(lastLogin);
        const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return formatDate(lastLogin);
    };

    const columns: ColumnsType<UserResponse> = [
        {
            title: (
                <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                />
            ),
            dataIndex: 'select',
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedUsers.includes(record.id)}
                    onChange={() => onSelectUser?.(record.id)}
                />
            ),
        },
        {
            title: 'Người dùng',
            dataIndex: 'user',
            key: 'user',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Avatar
                            size={40}
                            src={record.profileImage}
                            icon={<UserOutlined />}
                            className={record.isActive ? '' : 'opacity-50'}
                        />
                        {record.role === 'ADMIN' && (
                            <div className="absolute -top-1 -right-1">
                                <Tooltip title="Quản trị viên">
                                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                        <CrownOutlined className="text-white text-xs" />
                                    </div>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {record.fullName}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            @{record.username}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (email) => (
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {email}
                </span>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'purple' : 'blue'}>
                    {role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Bị khóa'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (createdAt) => (
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatDate(createdAt)}
                </span>
            ),
        },
        {
            title: 'Lần đăng nhập cuối',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 150,
            render: (lastLogin) => (
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {getLastLoginText(lastLogin)}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit?.(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                        <Button
                            type="text"
                            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                            size="small"
                            onClick={() => onToggleStatus?.(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDelete?.(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    if (users.length === 0 && !loading) {
        return (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            className={`${isDarkMode ? 'dark-table' : ''}`}
            rowClassName={(record) =>
                `${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} 
                 ${selectedUsers.includes(record.id) ? 'selected-row' : ''}`
            }
            onRow={(record) => ({
                onClick: () => handleView(record),
                className: 'cursor-pointer'
            })}
        />
    );
};

export default UserList;
