"use client";

import React from 'react';
import { Card, Input, Select, Radio, Space, Row, Col, Tag, Button } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { Role } from '@/types/database';

const { Option } = Select;

interface UserFiltersProps {
    totalUsers: number;
    isDarkMode?: boolean;
    activeTab: 'all' | 'active' | 'inactive';
    roleFilter: Role | null;
    statusFilter: boolean | null;
    sortOrder: 'newest' | 'oldest' | 'name' | 'lastLogin';
    onSearch: (query: string) => void;
    onRoleChange: (role: Role | null) => void;
    onStatusChange: (status: boolean | null) => void;
    onSortChange: (sort: 'newest' | 'oldest' | 'name' | 'lastLogin') => void;
    onTabChange: (tab: 'all' | 'active' | 'inactive') => void;
    onRefresh: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
    totalUsers,
    isDarkMode = false,
    activeTab,
    roleFilter,
    statusFilter,
    sortOrder,
    onSearch,
    onRoleChange,
    onStatusChange,
    onSortChange,
    onTabChange,
    onRefresh
}) => {
    const cardClass = isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    return (
        <Card className={cardClass} variant="borderless">
            <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Radio.Group
                            value={activeTab}
                            onChange={(e) => onTabChange(e.target.value)}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="all">
                                Tất cả ({totalUsers})
                            </Radio.Button>
                            <Radio.Button value="active">
                                Hoạt động
                            </Radio.Button>
                            <Radio.Button value="inactive">
                                Không hoạt động
                            </Radio.Button>
                        </Radio.Group>
                    </div>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={onRefresh}
                        className={isDarkMode ? 'border-gray-600' : ''}
                    >
                        Làm mới
                    </Button>
                </div>

                {/* Filters Row */}
                <Row gutter={[16, 16]} align="middle">
                    {/* Search */}
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Tìm kiếm người dùng..."
                            prefix={<SearchOutlined />}
                            onChange={(e) => onSearch(e.target.value)}
                            allowClear
                            className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                        />
                    </Col>

                    {/* Role Filter */}
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            placeholder="Vai trò"
                            value={roleFilter}
                            onChange={onRoleChange}
                            allowClear
                            className="w-full"
                            dropdownClassName={isDarkMode ? 'bg-gray-800' : ''}
                        >
                            <Option value="USER">
                                <Space>
                                    <Tag color="blue">Người dùng</Tag>
                                </Space>
                            </Option>
                            <Option value="ADMIN">
                                <Space>
                                    <Tag color="purple">Quản trị viên</Tag>
                                </Space>
                            </Option>
                        </Select>
                    </Col>

                    {/* Status Filter */}
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={onStatusChange}
                            allowClear
                            className="w-full"
                            dropdownClassName={isDarkMode ? 'bg-gray-800' : ''}
                        >
                            <Option value={true}>
                                <Space>
                                    <Tag color="green">Hoạt động</Tag>
                                </Space>
                            </Option>
                            <Option value={false}>
                                <Space>
                                    <Tag color="red">Không hoạt động</Tag>
                                </Space>
                            </Option>
                        </Select>
                    </Col>

                    {/* Sort */}
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            value={sortOrder}
                            onChange={onSortChange}
                            className="w-full"
                            dropdownClassName={isDarkMode ? 'bg-gray-800' : ''}
                        >
                            <Option value="newest">Mới nhất</Option>
                            <Option value="oldest">Cũ nhất</Option>
                            <Option value="name">Tên A-Z</Option>
                            <Option value="lastLogin">Đăng nhập gần đây</Option>
                        </Select>
                    </Col>

                    {/* Active Filters Display */}
                    <Col xs={24} lg={6}>
                        <div className="flex flex-wrap gap-2">
                            {roleFilter && (
                                <Tag
                                    closable
                                    onClose={() => onRoleChange(null)}
                                    color={roleFilter === 'ADMIN' ? 'purple' : 'blue'}
                                >
                                    {roleFilter === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                                </Tag>
                            )}
                            {statusFilter !== null && (
                                <Tag
                                    closable
                                    onClose={() => onStatusChange(null)}
                                    color={statusFilter ? 'green' : 'red'}
                                >
                                    {statusFilter ? 'Hoạt động' : 'Không hoạt động'}
                                </Tag>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Quick Filter Tags */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 mr-2">Bộ lọc nhanh:</span>
                    <Tag
                        className="cursor-pointer"
                        onClick={() => {
                            onRoleChange('ADMIN');
                            onStatusChange(true);
                        }}
                    >
                        <FilterOutlined className="mr-1" />
                        Quản trị viên hoạt động
                    </Tag>
                    <Tag
                        className="cursor-pointer"
                        onClick={() => {
                            onRoleChange('USER');
                            onStatusChange(false);
                        }}
                    >
                        <FilterOutlined className="mr-1" />
                        Người dùng bị khóa
                    </Tag>
                    <Tag
                        className="cursor-pointer"
                        onClick={() => {
                            onRoleChange(null);
                            onStatusChange(null);
                            onSearch('');
                            onTabChange('all');
                        }}
                    >
                        <ReloadOutlined className="mr-1" />
                        Xóa tất cả bộ lọc
                    </Tag>
                </div>
            </div>
        </Card>
    );
};

export default UserFilters;
