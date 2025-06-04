"use client";

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tag } from 'antd';
import { UserOutlined, TeamOutlined, CrownOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { UserResponse, Role } from '@/types/database';

interface UserStatisticsProps {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    adminUsers: number;
    users: UserResponse[];
    isDarkMode?: boolean;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({
    totalUsers,
    activeUsers,
    newUsers,
    adminUsers,
    users,
    isDarkMode = false
}) => {
    // Tính toán thống kê
    const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const adminRate = totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;

    // Phân tích theo role
    const roleDistribution = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<Role, number>);

    // Recent activity (mock data)
    const recentActivity = users
        .filter(user => user.lastLogin)
        .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
        .slice(0, 5);

    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    return (
        <div className="space-y-6">
            {/* Main Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cardClass} bordered={false}>
                        <Statistic
                            title="Tổng người dùng"
                            value={totalUsers}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cardClass} bordered={false}>
                        <Statistic
                            title="Người dùng hoạt động"
                            value={activeUsers}
                            prefix={<TeamOutlined className="text-green-500" />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={
                                <Progress
                                    percent={activeRate}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#52c41a"
                                    className="ml-2"
                                    style={{ width: 60 }}
                                />
                            }
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {activeRate}% tổng số
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cardClass} bordered={false}>
                        <Statistic
                            title="Người dùng mới"
                            value={newUsers}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Tháng này
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cardClass} bordered={false}>
                        <Statistic
                            title="Quản trị viên"
                            value={adminUsers}
                            prefix={<CrownOutlined className="text-purple-500" />}
                            valueStyle={{ color: '#722ed1' }}
                            suffix={
                                <Progress
                                    percent={adminRate}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#722ed1"
                                    className="ml-2"
                                    style={{ width: 60 }}
                                />
                            }
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {adminRate}% tổng số
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Role Distribution & Recent Activity */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Phân bố theo vai trò"
                        className={cardClass}
                        bordered={false}
                    >
                        <div className="space-y-4">
                            {Object.entries(roleDistribution).map(([role, count]) => (
                                <div key={role} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Tag
                                            color={role === 'ADMIN' ? 'purple' : 'blue'}
                                            className="min-w-[80px] text-center"
                                        >
                                            {role === 'ADMIN' ? 'Quản trị' : 'Người dùng'}
                                        </Tag>
                                        <span className="text-sm">{count} người</span>
                                    </div>
                                    <Progress
                                        percent={Math.round((count / totalUsers) * 100)}
                                        size="small"
                                        strokeColor={role === 'ADMIN' ? '#722ed1' : '#1890ff'}
                                        className="flex-1 ml-4"
                                        style={{ maxWidth: 100 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Hoạt động gần đây"
                        className={cardClass}
                        bordered={false}
                    >
                        <div className="space-y-3">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((user) => (
                                    <div key={user.id} className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <UserOutlined className="text-blue-600 text-xs" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{user.fullName}</div>
                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-4">
                                    Chưa có hoạt động gần đây
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserStatistics;
