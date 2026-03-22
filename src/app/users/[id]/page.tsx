"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Spin, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';

// Import components
import UserDetailCard from '@/features/users/components/UserDetailCard';
import UserForm from '@/features/users/components/UserForm';
import DeleteUserModal from '@/features/users/components/DeleteUserModal';

// Import hooks
import { useUser } from '@/features/users/hooks/useUsers';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { RegisterRequest, UserRequest } from '@/shared/types/database';
import { UserAPI } from '@/features/users/api/userAPI';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar(); const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [saveLoading, setSaveLoading] = React.useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const [deleteLoading, setDeleteLoading] = React.useState(false); const userId = params?.id ? (params.id === 'new' ? null : parseInt(params.id as string)) : null;
    const isNewUser = params?.id === 'new';

    // Only fetch user data if not creating new user
    const {
        user,
        loading,
        error,
        refetch
    } = useUser(isNewUser ? null : userId);

    const handleBack = () => {
        router.push('/users');
    }; const handleEdit = () => {
        if (user) {
            router.push(`/users/${user.id}/edit`);
        }
    };

    const handleSave = async (userData: UserRequest) => {
        setSaveLoading(true);
        try {
            const response = await UserAPI.createUser(userData);
            if (!response) {
                enqueueSnackbar('Không thể tạo người dùng mới', { variant: 'error' });
                return;
            }

            // Chuyển hướng về trang danh sách người dùng sau khi tạo thành công
            enqueueSnackbar('Đã tạo người dùng thành công', { variant: 'success' });
            router.push('/users');
        } catch (error) {
            enqueueSnackbar('Có lỗi xảy ra khi tạo người dùng', { variant: 'error' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/users');
    }; const handleToggleStatus = async () => {
        if (!user) return;

        try {
            const newStatus = !user.isActive;
            await UserAPI.toggleUserStatus(user.id, newStatus);

            const action = user.isActive ? 'khóa' : 'mở khóa';
            enqueueSnackbar(`Đã ${action} tài khoản ${user.fullName}`, { variant: 'success' });
            refetch();
        } catch (error) {
            console.error('Error toggling user status:', error);
            enqueueSnackbar('Có lỗi xảy ra khi thay đổi trạng thái người dùng', { variant: 'error' });
        }
    };

    const handleDelete = () => {
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!user) return;

        setDeleteLoading(true);
        try {
            await UserAPI.deleteUser(user.id);
            enqueueSnackbar(`Đã xóa người dùng ${user.fullName} thành công`, { variant: 'success' });
            router.push('/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            enqueueSnackbar('Có lỗi xảy ra khi xóa người dùng', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
            setDeleteModalVisible(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
    }; if (loading && !isNewUser) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    if ((error || !user) && !isNewUser) {
        return (
            <Result
                status="404"
                title="Không tìm thấy người dùng"
                subTitle="Người dùng bạn tìm kiếm không tồn tại hoặc đã bị xóa."
                extra={
                    <Button type="primary" onClick={handleBack}>
                        Quay lại danh sách
                    </Button>
                }
            />
        );
    } return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header Section */}
            <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700'}`}>
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative px-4 py-8 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-white/80 text-sm mb-6">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                                className="text-white border-white/30 hover:bg-white/10 hover:border-white/50"
                                size="small"
                            >
                                Quay lại
                            </Button>
                            <span>/</span>
                            <span>Người dùng</span>
                            <span>/</span>
                            <span className="text-white">{isNewUser ? 'Tạo mới' : 'Chi tiết'}</span>
                        </div>

                        {/* Title Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                                    {isNewUser ? '✨ Tạo người dùng mới' : '👤 Chi tiết người dùng'}
                                </h1>
                                <p className="text-lg text-white/80 max-w-2xl">
                                    {isNewUser
                                        ? 'Tạo tài khoản người dùng mới với thông tin đầy đủ và quyền hạn phù hợp'
                                        : `Xem và quản lý thông tin chi tiết của ${user?.fullName || 'người dùng'}`
                                    }
                                </p>
                            </div>

                            {/* Action Buttons */}
                            {!isNewUser && (
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={handleEdit}
                                        className="bg-white text-blue-600 border-white hover:bg-gray-100 hover:text-blue-700 font-medium shadow-lg"
                                        size="large"
                                    >
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="relative -mt-16">
                    {/* Content Card */}
                    <div className={`rounded-2xl shadow-2xl border backdrop-blur-sm ${isDarkMode
                        ? 'bg-gray-800/95 border-gray-700/50'
                        : 'bg-white/95 border-gray-200/50'
                        }`}>
                        <div className="p-6 sm:p-8">
                            {/* User Detail Card or User Form */}
                            {isNewUser ? (
                                <div className="space-y-6">
                                    <UserForm
                                        isDarkMode={isDarkMode}
                                        onSave={handleSave}
                                        onCancel={handleCancel}
                                        loading={saveLoading}
                                    />
                                </div>) : user && (
                                    <>
                                        <UserDetailCard
                                            user={user}
                                            isDarkMode={isDarkMode}
                                            onEdit={handleEdit}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={handleDelete}
                                        />
                                        <DeleteUserModal
                                            visible={deleteModalVisible}
                                            user={user}
                                            onCancel={handleDeleteCancel}
                                            onConfirm={handleDeleteConfirm}
                                            loading={deleteLoading}
                                        />
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Pattern */}
            {!isDarkMode && (
                <div className="fixed inset-0 -z-10 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
            )}
        </div>
    );
}
