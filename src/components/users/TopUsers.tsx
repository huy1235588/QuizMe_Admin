"use client";

import React from 'react';
import { Card, Row, Col, Avatar, Tag, Statistic, Progress } from 'antd';
import { UserOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { UserResponse } from '@/types/database';

interface TopUsersProps {
    users: UserResponse[];
    isDarkMode?: boolean;
    loading?: boolean;
}

const TopUsers: React.FC<TopUsersProps> = ({
    users,
    isDarkMode = false,
    loading = false
}) => {
    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    if (loading) {
        return (
            <Card title="Người dùng nổi bật" className={cardClass} bordered={false}>
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Col key={index} xs={24} sm={8}>
                            <div className={`h-32 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`} />
                        </Col>
                    ))}
                </Row>
            </Card>
        );
    }

    if (users.length === 0) {
        return (
            <Card title="Người dùng nổi bật" className={cardClass} bordered={false}>
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-4xl mb-2">🏆</div>
                    <p>Chưa có người dùng nổi bật</p>
                </div>
            </Card>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <TrophyOutlined className="text-yellow-500 text-lg" />;
            case 1: return <TrophyOutlined className="text-gray-400 text-lg" />;
            case 2: return <TrophyOutlined className="text-orange-600 text-lg" />;
            default: return <FireOutlined className="text-red-500" />;
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'gold';
            case 1: return 'default';
            case 2: return 'orange';
            default: return 'red';
        }
    };

    return (
        <Card
            title={
                <div className="flex items-center space-x-2">
                    <TrophyOutlined className="text-yellow-500" />
                    <span>Người dùng nổi bật</span>
                </div>
            }
            className={cardClass}
            bordered={false}
        >
            <Row gutter={[16, 16]}>
                {users.slice(0, 6).map((user, index) => (
                    <Col key={user.id} xs={24} sm={12} lg={8} xl={4}>
                        <Card
                            className={`${cardClass} text-center transition-all duration-200 hover:shadow-lg`}
                            bordered={false}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="space-y-3">
                                {/* Rank Badge */}
                                <div className="flex justify-center">
                                    <Tag
                                        color={getRankColor(index)}
                                        className="flex items-center space-x-1 px-3 py-1"
                                    >
                                        {getRankIcon(index)}
                                        <span className="ml-1">#{index + 1}</span>
                                    </Tag>
                                </div>

                                {/* Avatar */}
                                <div className="flex justify-center">
                                    <Avatar
                                        size={48}
                                        src={user.profileImage}
                                        icon={<UserOutlined />}
                                        className={`${index < 3 ? 'ring-2' : ''} ${index === 0 ? 'ring-yellow-400' :
                                                index === 1 ? 'ring-gray-400' :
                                                    index === 2 ? 'ring-orange-400' : ''
                                            }`}
                                    />
                                </div>

                                {/* User Info */}
                                <div className="space-y-1">
                                    <h4 className={`text-sm font-semibold m-0 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {user.fullName}
                                    </h4>
                                    <p className={`text-xs m-0 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        @{user.username}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="flex justify-center">
                                    <Tag
                                        color={user.role === 'ADMIN' ? 'purple' : 'blue'}
                                    >
                                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                    </Tag>
                                </div>

                                {/* Join Date */}
                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Tham gia: {formatDate(user.createdAt)}
                                </div>

                                {/* Activity Status */}
                                <Progress
                                    percent={user.isActive ? 100 : 0}
                                    size="small"
                                    showInfo={false}
                                    strokeColor={user.isActive ? '#52c41a' : '#ff4d4f'}
                                    trailColor={isDarkMode ? '#374151' : '#f5f5f5'}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Summary Stats */}
            {users.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Row gutter={16}>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Tổng người dùng nổi bật"
                                value={users.length}
                                valueStyle={{
                                    fontSize: '16px',
                                    color: isDarkMode ? '#fff' : '#1890ff'
                                }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Đang hoạt động"
                                value={users.filter(u => u.isActive).length}
                                valueStyle={{
                                    fontSize: '16px',
                                    color: '#52c41a'
                                }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Quản trị viên"
                                value={users.filter(u => u.role === 'ADMIN').length}
                                valueStyle={{
                                    fontSize: '16px',
                                    color: '#722ed1'
                                }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Tỷ lệ hoạt động"
                                value={Math.round((users.filter(u => u.isActive).length / users.length) * 100)}
                                suffix="%"
                                valueStyle={{
                                    fontSize: '16px',
                                    color: '#fa8c16'
                                }}
                            />
                        </Col>
                    </Row>
                </div>
            )}
        </Card>
    );
};

export default TopUsers;
