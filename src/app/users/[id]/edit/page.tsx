"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spin, Result } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';

// Import components
import UserForm from '@/components/users/UserForm';

// Import hooks
import { useUser } from '@/hooks/useUsers';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRequest } from '@/types/database';
import { UserAPI } from '@/api/userAPI';

export default function UserEditPage() {
    const params = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [saveLoading, setSaveLoading] = React.useState(false);

    const userId = params?.id ? parseInt(params.id as string) : null;

    // Fetch user data
    const {
        user,
        loading,
        error,
        refetch
    } = useUser(userId);

    const handleBack = () => {
        router.push(`/users/${userId}`);
    };

    const handleSave = async (userData: UserRequest) => {
        if (!userId) return;

        setSaveLoading(true);
        try {
            const updatedUser = await UserAPI.updateUser({
                ...userData,
                id: userId
            });

            if (!updatedUser) {
                enqueueSnackbar('Không thể cập nhật thông tin người dùng', { variant: 'error' });
                return;
            }

            enqueueSnackbar('Đã cập nhật thông tin người dùng thành công', { variant: 'success' });
            router.push(`/users/${userId}`);
        } catch (error) {
            console.error('Error updating user:', error);
            enqueueSnackbar('Có lỗi xảy ra khi cập nhật thông tin người dùng', { variant: 'error' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/users/${userId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <Result
                status="404"
                title="Không tìm thấy người dùng"
                subTitle="Người dùng bạn muốn chỉnh sửa không tồn tại hoặc đã bị xóa."
                extra={
                    <Button type="primary" onClick={() => router.push('/users')}>
                        Quay lại danh sách
                    </Button>
                }
            />
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header Section */}
            <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-700'}`}>
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
                            <span>{user.fullName}</span>
                            <span>/</span>
                            <span className="text-white">Chỉnh sửa</span>
                        </div>

                        {/* Title Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                                    ✏️ Chỉnh sửa thông tin người dùng
                                </h1>
                                <p className="text-lg text-white/80 max-w-2xl">
                                    Cập nhật thông tin chi tiết cho tài khoản của {user.fullName}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    form="user-edit-form"
                                    htmlType="submit"
                                    loading={saveLoading}
                                    className="bg-white text-orange-600 border-white hover:bg-gray-100 hover:text-orange-700 font-medium shadow-lg"
                                    size="large"
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
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
                            {/* User Edit Form */}
                            <div className="space-y-6">
                                <UserForm
                                    formId="user-edit-form"
                                    initialData={user}
                                    isDarkMode={isDarkMode}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    loading={saveLoading}
                                    isEditMode={true}
                                />
                            </div>
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
