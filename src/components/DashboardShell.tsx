"use client";

import React, { useState } from 'react';
import { Layout, Menu, Button, theme, ConfigProvider, Dropdown, Avatar } from 'antd';
import {
    FiMenu,
    FiChevronLeft,
    FiLogOut,
    FiUser
} from 'react-icons/fi';
import {
    FiHome,
    FiFileText,
    FiUsers,
    FiSettings,
    FiHelpCircle,
    FiFolder
} from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function DashboardShell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const { theme: currentTheme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const isDarkMode = currentTheme === 'dark';

    // Tuỳ chỉnh theme cho Ant Design
    const antTheme = {
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
        },
    };

    // Always call hooks at the top level, before any conditional returns
    const { token } = theme.useToken();

    // Lấy chữ cái đầu của người dùng cho avatar
    const getUserInitials = () => {
        if (!user) return "?";
        
        if (user.username) {
            return user.username.charAt(0).toUpperCase();
        }
        
        if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        
        return "?";
    };

    // Bỏ qua việc hiển thị shell cho trang đăng nhập
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Nếu chưa xác thực và không ở trang đăng nhập, hiển thị màn hình loading
    // Context xác thực sẽ tự chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <FiUser />,
            label: 'Profile',
        },
        {
            key: 'settings',
            icon: <FiSettings />,
            label: 'Settings',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <FiLogOut />,
            label: 'Logout',
            danger: true,
            onClick: logout,
        },
    ];

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
                        defaultSelectedKeys={['dashboard']}
                        selectedKeys={[pathname?.split('/')[1] || 'dashboard']}
                        items={[
                            {
                                key: 'dashboard',
                                icon: <FiHome />,
                                label: <Link href="/dashboard">Dashboard</Link>,
                            },
                            {
                                key: 'quizzes',
                                icon: <FiHelpCircle />,
                                label: <Link href="/quizzes">Quizzes</Link>,
                            },
                            {
                                key: 'categories',
                                icon: <FiFolder />,
                                label: <Link href="/categories">Categories</Link>,
                            },
                            {
                                key: 'questions',
                                icon: <FiFileText />,
                                label: <Link href="/questions">Questions</Link>,
                            },
                            {
                                key: 'users',
                                icon: <FiUsers />,
                                label: <Link href="/users">Users</Link>,
                            },
                            {
                                key: 'settings',
                                icon: <FiSettings />,
                                label: <Link href="/settings">Settings</Link>,
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
                                    onClick: logout,
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
                                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <Avatar 
                                            className="bg-blue-500 flex items-center justify-center text-white font-bold"
                                            size="default"
                                        >
                                            {getUserInitials()}
                                        </Avatar>
                                        <span className="hidden md:inline">
                                            {user?.username || user?.email || 'User'}
                                        </span>
                                    </div>
                                </Dropdown>
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