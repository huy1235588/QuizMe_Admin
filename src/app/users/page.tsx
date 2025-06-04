"use client";

import React, { useState } from 'react';
import { Typography, Button, Card, Space, Select, Checkbox, Modal, message } from 'antd';
import {
    FiPlus,
    FiGrid,
    FiList,
    FiDownload,
    FiTrash2,
    FiLock,
    FiUnlock
} from 'react-icons/fi';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

// Import components
import UserStatistics from '@/components/users/UserStatistics';
import TopUsers from '@/components/users/TopUsers';
import UserFilters from '@/components/users/UserFilters';
import UserList from '@/components/users/UserList';
import UserGrid from '@/components/users/UserGrid';
import DeleteUserModal from '@/components/users/DeleteUserModal';

// Import hooks
import { useUsers } from '@/hooks/useUsers';
import { UserResponse } from '@/types/database';

const { Title } = Typography;
const { Option } = Select;

export default function UsersPage() {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    // State cho modal và actions
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Sử dụng hook để quản lý tất cả dữ liệu và chức năng liên quan đến users
    const {
        // Dữ liệu
        users,
        allUsers,
        topUsers,
        totalUsers,
        loading,
        isDarkMode,

        // UI State
        viewMode,
        currentPage,
        pageSize,
        selectedUsers,

        // Filters
        searchQuery,
        roleFilter,
        statusFilter,
        sortBy,
        sortOrder,

        // Actions
        handleSearch,
        handleRoleFilter,
        handleStatusFilter,
        handleSort,
        handlePageChange,
        handlePageSizeChange,
        handleSelectUser,
        handleSelectAllUsers,
        handleBulkAction,
        toggleViewMode,
        fetchUsers
    } = useUsers();

    // Tính toán thống kê
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const newUsers = allUsers.filter(user => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return new Date(user.createdAt) > oneMonthAgo;
    }).length;
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN').length;

    // Handler functions
    const handleCreateUser = () => {
        router.push('/users/new');
    };

    const handleEditUser = (user: UserResponse) => {
        router.push(`/users/${user.id}`);
    };

    const handleViewUser = (user: UserResponse) => {
        router.push(`/users/${user.id}`);
    };

    const handleDeleteUser = (user: UserResponse) => {
        setUserToDelete(user);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setBulkActionLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            enqueueSnackbar(`Đã xóa người dùng ${userToDelete.fullName}`, { variant: 'success' });
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
            await fetchUsers();
        } catch (error) {
            enqueueSnackbar('Có lỗi xảy ra khi xóa người dùng', { variant: 'error' });
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleToggleUserStatus = async (user: UserResponse) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const action = user.isActive ? 'khóa' : 'mở khóa';
            enqueueSnackbar(`Đã ${action} tài khoản ${user.fullName}`, { variant: 'success' });
            await fetchUsers();
        } catch (error) {
            enqueueSnackbar('Có lỗi xảy ra khi thay đổi trạng thái người dùng', { variant: 'error' });
        }
    };

    const handleBulkActions = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedUsers.length === 0) {
            message.warning('Vui lòng chọn ít nhất một người dùng');
            return;
        }

        Modal.confirm({
            title: `Xác nhận ${action === 'activate' ? 'kích hoạt' : action === 'deactivate' ? 'vô hiệu hóa' : 'xóa'}`,
            content: `Bạn có chắc chắn muốn ${action === 'activate' ? 'kích hoạt' : action === 'deactivate' ? 'vô hiệu hóa' : 'xóa'} ${selectedUsers.length} người dùng đã chọn?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                await handleBulkAction(action);
            }
        });
    };

    const handleExportUsers = () => {
        // Simulate export functionality
        enqueueSnackbar('Đang xuất dữ liệu người dùng...', { variant: 'info' });

        setTimeout(() => {
            enqueueSnackbar('Đã xuất dữ liệu thành công', { variant: 'success' });
        }, 2000);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header với tiêu đề và các nút action */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <Title level={4} className="m-0">Quản lý người dùng</Title>
                    <p className={`m-0 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quản lý và theo dõi tất cả người dùng trong hệ thống
                    </p>
                </div>

                <Space size="middle" wrap>
                    <Button
                        icon={<FiDownload />}
                        onClick={handleExportUsers}
                        className={isDarkMode ? 'border-gray-600' : ''}
                    >
                        Xuất dữ liệu
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<FiPlus />}
                        onClick={handleCreateUser}
                        className={isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    >
                        Thêm người dùng
                    </Button>
                </Space>
            </div>

            {/* Component hiển thị thống kê */}
            <UserStatistics
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                newUsers={newUsers}
                adminUsers={adminUsers}
                users={allUsers}
                isDarkMode={isDarkMode}
            />

            {/* Component hiển thị người dùng nổi bật */}
            <TopUsers
                users={topUsers}
                isDarkMode={isDarkMode}
                loading={loading}
            />

            {/* Component bộ lọc */}
            <UserFilters
                totalUsers={totalUsers}
                isDarkMode={isDarkMode}
                activeTab="all"
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                sortOrder={sortOrder}
                onSearch={handleSearch}
                onRoleChange={handleRoleFilter}
                onStatusChange={handleStatusFilter}
                onSortChange={handleSort}
                onTabChange={() => { }} // Implement if needed
                onRefresh={fetchUsers}
            />

            {/* Bulk Actions và View Mode Controls */}
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} bordered={false}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        {selectedUsers.length > 0 && (
                            <Space size="middle">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Đã chọn {selectedUsers.length} người dùng
                                </span>
                                <Button
                                    size="small"
                                    icon={<FiUnlock />}
                                    onClick={() => handleBulkActions('activate')}
                                >
                                    Kích hoạt
                                </Button>
                                <Button
                                    size="small"
                                    icon={<FiLock />}
                                    onClick={() => handleBulkActions('deactivate')}
                                >
                                    Vô hiệu hóa
                                </Button>
                                <Button
                                    size="small"
                                    danger
                                    icon={<FiTrash2 />}
                                    onClick={() => handleBulkActions('delete')}
                                >
                                    Xóa
                                </Button>
                            </Space>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Hiển thị:
                        </span>
                        <Select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            size="small"
                            className="w-20"
                        >
                            <Option value={10}>10</Option>
                            <Option value={20}>20</Option>
                            <Option value={50}>50</Option>
                            <Option value={100}>100</Option>
                        </Select>

                        <div className="flex items-center space-x-1">
                            <Button
                                size="small"
                                type={viewMode === 'list' ? 'primary' : 'default'}
                                icon={<FiList />}
                                onClick={() => viewMode !== 'list' && toggleViewMode()}
                            />
                            <Button
                                size="small"
                                type={viewMode === 'grid' ? 'primary' : 'default'}
                                icon={<FiGrid />}
                                onClick={() => viewMode !== 'grid' && toggleViewMode()}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Component hiển thị danh sách/grid người dùng */}
            {viewMode === 'list' ? (
                <UserList
                    users={users}
                    loading={loading}
                    isDarkMode={isDarkMode}
                    selectedUsers={selectedUsers}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onToggleStatus={handleToggleUserStatus}
                    onView={handleViewUser}
                    onSelectUser={handleSelectUser}
                    onSelectAll={handleSelectAllUsers}
                />
            ) : (
                <UserGrid
                    users={users}
                    loading={loading}
                    isDarkMode={isDarkMode}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onToggleStatus={handleToggleUserStatus}
                    onView={handleViewUser}
                />
            )}

            {/* Pagination */}
            {!loading && users.length > 0 && (
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} bordered={false}>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalUsers)}
                            trong tổng số {totalUsers} người dùng
                        </span>

                        <Space>
                            <Button
                                disabled={currentPage === 0}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Trước
                            </Button>
                            <span className={`px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Trang {currentPage + 1}
                            </span>
                            <Button
                                disabled={(currentPage + 1) * pageSize >= totalUsers}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Sau
                            </Button>
                        </Space>
                    </div>
                </Card>
            )}

            {/* Modal xác nhận xóa */}
            <DeleteUserModal
                visible={isDeleteModalVisible}
                user={userToDelete}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDeleteUser}
                loading={bulkActionLoading}
            />
        </div>
    );
}