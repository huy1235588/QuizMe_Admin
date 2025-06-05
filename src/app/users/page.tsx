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
import { usePagedUsers, useTopUsers, useUserCount } from '@/hooks/useUsers';
import { useTheme } from '@/contexts/ThemeContext';
import { UserResponse } from '@/types/database';
import { UserAPI } from '@/api/userAPI';

const { Title } = Typography;
const { Option } = Select;

export default function UsersPage() {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // State cho modal và actions
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Sử dụng hook để quản lý danh sách người dùng với phân trang
    const {
        users,
        loading,
        error,
        currentPage,
        pageSize,
        totalElements,
        totalPages,
        searchQuery,
        sortBy,
        hasUsers,
        startIndex,
        endIndex,
        handlePageChange,
        handlePageSizeChange,
        handleSearch,
        handleSortChange,
        handleRefresh,
        handleReset
    } = usePagedUsers();

    // Hook để lấy top users
    const { topUsers, loading: topUsersLoading } = useTopUsers();

    // Hook để lấy tổng số users cho thống kê
    const { count: totalUsers } = useUserCount();    // Tính toán thống kê (sử dụng totalUsers từ useUserCount)
    const activeUsers = Math.floor(totalUsers * 0.85); // Mock calculation
    const newUsers = Math.floor(totalUsers * 0.15); // Mock calculation  
    const adminUsers = Math.floor(totalUsers * 0.1); // Mock calculation

    // Handler functions
    const handleCreateUser = () => {
        router.push('/users/new');
    }; const handleEditUser = (user: UserResponse) => {
        router.push(`/users/${user.id}/edit`);
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
            await UserAPI.deleteUser(userToDelete.id);
            enqueueSnackbar(`Đã xóa người dùng ${userToDelete.fullName}`, { variant: 'success' });
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
            handleRefresh();
        } catch (error) {
            console.error('Error deleting user:', error);
            enqueueSnackbar('Có lỗi xảy ra khi xóa người dùng', { variant: 'error' });
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleToggleUserStatus = async (user: UserResponse) => {
        try {
            const newStatus = !user.isActive;
            await UserAPI.toggleUserStatus(user.id, newStatus); const action = user.isActive ? 'khóa' : 'mở khóa';
            enqueueSnackbar(`Đã ${action} tài khoản ${user.fullName}`, { variant: 'success' }); handleRefresh();
        } catch (error) {
            console.error('Error toggling user status:', error);
            enqueueSnackbar('Có lỗi xảy ra khi thay đổi trạng thái người dùng', { variant: 'error' });
        }
    };

    // Handle user selection
    const handleSelectUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAllUsers = (checked: boolean) => {
        setSelectedUsers(checked ? users.map(user => user.id) : []);
    };

    // Handle view mode toggle
    const toggleViewMode = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
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
            cancelText: 'Hủy', onOk: async () => {
                try {
                    setBulkActionLoading(true);
                    // TODO: Implement actual bulk action API call
                    // await UserAPI.bulkAction(selectedUsers, action);

                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    enqueueSnackbar(`Đã ${action === 'activate' ? 'kích hoạt' : action === 'deactivate' ? 'vô hiệu hóa' : 'xóa'} ${selectedUsers.length} người dùng`, { variant: 'success' });
                    setSelectedUsers([]);
                    handleRefresh();
                } catch (error) {
                    enqueueSnackbar('Có lỗi xảy ra khi thực hiện thao tác', { variant: 'error' });
                } finally {
                    setBulkActionLoading(false);
                }
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
            </div>            {/* Component hiển thị thống kê */}
            <UserStatistics
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                newUsers={newUsers}
                adminUsers={adminUsers}
                users={users} // Use current page users instead of allUsers
                isDarkMode={isDarkMode}
            />

            {/* Component hiển thị người dùng nổi bật */}
            <TopUsers
                users={topUsers}
                isDarkMode={isDarkMode}
                loading={topUsersLoading}
            />            {/* Component bộ lọc */}
            <UserFilters
                totalUsers={totalElements}
                isDarkMode={isDarkMode}
                activeTab="all"
                roleFilter={null}
                statusFilter={null}
                sortOrder={sortBy === 'username' ? 'lastLogin' : sortBy}
                onSearch={handleSearch}
                onRoleChange={() => { }}
                onStatusChange={() => { }}
                onSortChange={(sortType: 'newest' | 'oldest' | 'name' | 'lastLogin') => {
                    if (sortType === 'lastLogin') {
                        handleSortChange('username');
                    } else {
                        handleSortChange(sortType);
                    }
                }}
                onTabChange={() => { }}
                onRefresh={handleRefresh}
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
            )}            {/* Pagination */}
            {!loading && users.length > 0 && (
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} bordered={false}>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Hiển thị {startIndex} - {endIndex} trong tổng số {totalElements} người dùng
                        </span>

                        <Space>
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Trước
                            </Button>
                            <span className={`px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                disabled={currentPage === totalPages}
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