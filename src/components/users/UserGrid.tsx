"use client";

import React from 'react';
import { Row, Col } from 'antd';
import UserCard from './UserCard';
import { UserResponse } from '@/types/database';

interface UserGridProps {
    users: UserResponse[];
    loading?: boolean;
    isDarkMode?: boolean;
    onEdit?: (user: UserResponse) => void;
    onDelete?: (user: UserResponse) => void;
    onToggleStatus?: (user: UserResponse) => void;
    onView?: (user: UserResponse) => void;
}

const UserGrid: React.FC<UserGridProps> = ({
    users,
    loading = false,
    isDarkMode = false,
    onEdit,
    onDelete,
    onToggleStatus,
    onView
}) => {
    if (loading) {
        return (
            <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, index) => (
                    <Col key={index} xs={4} sm={12} md={8} lg={6} xl={4}>
                        <div className={`h-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`} />
                    </Col>
                ))}
            </Row>
        );
    }

    if (users.length === 0) {
        return (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
        );
    }

    return (
        <Row gutter={[16, 16]}>
            {users.map((user) => (
                <Col key={user.id} xs={8} >
                    <UserCard
                        user={user}
                        isDarkMode={isDarkMode}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onView={onView}
                    />
                </Col>
            ))}
        </Row>
    );
};

export default UserGrid;
