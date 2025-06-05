"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Spin, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';

// Import components
import UserDetailCard from '@/components/users/UserDetailCard';
import UserForm from '@/components/users/UserForm';

// Import hooks
import { useUser } from '@/hooks/useUsers';
import { useTheme } from '@/contexts/ThemeContext';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [saveLoading, setSaveLoading] = React.useState(false); const userId = params?.id ? (params.id === 'new' ? null : parseInt(params.id as string)) : null;
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
    }; const handleSave = async (userData: any) => {
        setSaveLoading(true);
        try {
            // Simulate API call for creating new user
            await new Promise(resolve => setTimeout(resolve, 1000));

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
    };

    const handleToggleStatus = async () => {
        if (!user) return;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const action = user.isActive ? 'khóa' : 'mở khóa';
            enqueueSnackbar(`Đã ${action} tài khoản ${user.fullName}`, { variant: 'success' });
            refetch();
        } catch (error) {
            enqueueSnackbar('Có lỗi xảy ra khi thay đổi trạng thái người dùng', { variant: 'error' });
        }
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
                                    <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            <UserOutlined className="text-2xl" />
                                        </div>
                                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Thông tin người dùng mới
                                        </h2>
                                        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Vui lòng điền đầy đủ thông tin bên dưới
                                        </p>
                                    </div>
                                    <UserForm
                                        isDarkMode={isDarkMode}
                                        onSave={handleSave}
                                        onCancel={handleCancel}
                                        loading={saveLoading}
                                    />
                                </div>
                            ) : user && (
                                <UserDetailCard
                                    user={user}
                                    isDarkMode={isDarkMode}
                                    onEdit={handleEdit}
                                    onToggleStatus={handleToggleStatus}
                                />
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
