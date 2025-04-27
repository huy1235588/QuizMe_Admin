"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd';
import {
    FiMenu,
    FiChevronLeft,
    FiLogOut
} from 'react-icons/fi';
import {
    FiHome,
    FiFileText,
    FiUsers,
    FiSettings,
    FiHelpCircle,
    FiFolder,
    FiPlus,
    FiList
} from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export default function DashboardShell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const { theme: currentTheme, toggleTheme } = useTheme();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isDarkMode = currentTheme === 'dark';

    // Chuyển hướng đến trang đăng nhập nếu chưa xác thực và không phải đang ở trang đăng nhập
    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Tuỳ chỉnh theme cho Ant Design
    const antTheme = {
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
        },
    };

    const { token } = theme.useToken();

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
    };

    // Determine active menu and submenu keys
    const getSelectedKeys = () => {
        const path = pathname.split('/');
        const section = path[1] || 'dashboard';
        const action = path[2];
        
        if (action === 'new') {
            return [`${section}-add`];
        } else if (action && !isNaN(Number(action))) {
            return [`${section}-list`];
        }
        
        return [section === 'dashboard' ? 'dashboard' : `${section}-list`];
    };

    // Determine which submenu should be open
    const getOpenKeys = () => {
        const section = pathname.split('/')[1];
        if (section && section !== 'dashboard' && section !== 'settings') {
            return [section];
        }
        return [];
    };

    // Chỉ hiển thị shell khi đã xác thực hoặc đang ở trang đăng nhập
    if (!isAuthenticated && pathname !== '/login') {
        return null;
    }

    // Không hiển thị shell cho trang đăng nhập
    if (pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <ConfigProvider theme={antTheme}>
            <Layout className={`min-h-screen ${isDarkMode ? 'dark:bg-gray-900' : ''}`}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    className="shadow-md h-full"
                    width={256}
                    theme={isDarkMode ? 'dark' : 'light'}
                    style={{
                        borderRight: `1px solid ${token.colorBorderSecondary}`,
                        height: '100%',
                        overflow: 'auto',
                        position: 'fixed',
                        left: 0,
                        zIndex: 10,
                    }}
                >
                    <div className="flex justify-center items-center p-5 h-16">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="QuizMe Logo"
                                width={32}
                                height={32}
                                className="min-w-8"
                            />
                            {!collapsed && (
                                <span className="text-xl font-bold">QuizMe Admin</span>
                            )}
                        </Link>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={getSelectedKeys()}
                        defaultOpenKeys={collapsed ? [] : getOpenKeys()}
                        items={[
                            {
                                key: 'dashboard',
                                icon: <FiHome />,
                                label: 'Dashboard',
                                onClick: () => router.push('/dashboard')
                            },
                            {
                                key: 'quizzes',
                                icon: <FiHelpCircle />,
                                label: 'Quizzes',
                                children: [
                                    {
                                        key: 'quizzes-list',
                                        icon: <FiList />,
                                        label: 'All Quizzes',
                                        onClick: () => router.push('/quizzes')
                                    },
                                    {
                                        key: 'quizzes-add',
                                        icon: <FiPlus />,
                                        label: 'Add Quiz',
                                        onClick: () => router.push('/quizzes/new')
                                    }
                                ]
                            },
                            {
                                key: 'categories',
                                icon: <FiFolder />,
                                label: 'Categories',
                                children: [
                                    {
                                        key: 'categories-list',
                                        icon: <FiList />,
                                        label: 'All Categories',
                                        onClick: () => router.push('/categories')
                                    },
                                    {
                                        key: 'categories-add',
                                        icon: <FiPlus />,
                                        label: 'Add Category',
                                        onClick: () => router.push('/categories/new')
                                    }
                                ]
                            },
                            {
                                key: 'questions',
                                icon: <FiFileText />,
                                label: 'Questions',
                                children: [
                                    {
                                        key: 'questions-list',
                                        icon: <FiList />,
                                        label: 'All Questions',
                                        onClick: () => router.push('/questions')
                                    },
                                    {
                                        key: 'questions-add',
                                        icon: <FiPlus />,
                                        label: 'Add Question',
                                        onClick: () => router.push('/questions/new')
                                    }
                                ]
                            },
                            {
                                key: 'users',
                                icon: <FiUsers />,
                                label: 'Users',
                                onClick: () => router.push('/users')
                            },
                            {
                                key: 'settings',
                                icon: <FiSettings />,
                                label: 'Settings',
                                onClick: () => router.push('/settings')
                            },
                        ]}
                        className="border-none"
                    />
                    <div className="absolute bottom-0 w-full p-4">
                        <Menu
                            mode="inline"
                            className="border-t border-gray-200"
                            items={[
                                {
                                    key: 'logout',
                                    icon: <FiLogOut />,
                                    label: 'Logout',
                                    danger: true,
                                    onClick: handleLogout,
                                },
                            ]}
                        />
                    </div>
                </Sider>

                <Layout
                    style={{ marginLeft: collapsed ? 80 : 256 }}
                >
                    <Header
                        className="p-0 flex items-center fixed top-0 z-10"
                        style={{
                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                            paddingLeft: 10,
                            backgroundColor: isDarkMode ? '' : token.colorBgBase,
                            width: collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)',
                        }}
                    >
                        <Button
                            type="text"
                            icon={collapsed ? <FiMenu /> : <FiChevronLeft />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-16 h-16 flex items-center justify-center text-xl"
                        />
                        <div className="flex-grow flex justify-end items-center pr-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={isDarkMode ? <FiMoon /> : <FiSun />}
                                    onClick={toggleTheme}
                                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                    className="flex items-center justify-center"
                                />
                                <Button type="text" shape="circle" icon={<FiSettings />} />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:inline">{user?.fullName || user?.username}</span>
                                </div>
                            </div>
                        </div>
                    </Header>
                    <Content
                        className={`m-6 p-6 rounded-md shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        style={{
                            marginTop: 64,
                            minHeight: 'calc(100vh - 64px)',
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}