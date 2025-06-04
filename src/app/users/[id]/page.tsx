"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Spin, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
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
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        className={isDarkMode ? 'border-gray-600' : ''}
                    >
                        Quay lại
                    </Button>
                    <div>                        <h1 className={`text-2xl font-bold m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isNewUser ? 'Tạo người dùng mới' : 'Chi tiết người dùng'}
                    </h1>
                        <p className={`m-0 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isNewUser
                                ? 'Tạo tài khoản người dùng mới'
                                : `Thông tin chi tiết về người dùng ${user?.fullName || ''}`
                            }
                        </p>
                    </div>
                </div>                <Space>
                    {!isNewUser && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                            className={isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                </Space>
            </div>            {/* User Detail Card or User Form */}
            {isNewUser ? (
                <UserForm
                    isDarkMode={isDarkMode}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    loading={saveLoading}
                />
            ) : user && (
                <UserDetailCard
                    user={user}
                    isDarkMode={isDarkMode}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                />
            )}
        </div>
    );
}
