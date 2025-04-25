"use client";

import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, Divider } from 'antd';
import { FiUser, FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/useNotification';
import '@ant-design/v5-patch-for-react-19';

const { Title, Text } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { success, error } = useNotification();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { usernameOrEmail: string; password: string }) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/auth/login', values);

            if (response.data.status === 'success') {
                // Lưu trữ token và thông tin người dùng
                login(
                    response.data.data.access_token,
                    response.data.data.refresh_token,
                    response.data.data.user,
                    new Date(response.data.data.access_token_expires_at),
                    new Date(response.data.data.refresh_token_expires_at)
                );

                success('Login successful');
                router.push('/dashboard');
            } else {
                error(response.data.message || 'Login failed');
            }
        } catch (err: any) {
            error(err.response?.data?.message || 'Login failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md space-y-8">
                <Card
                    className="w-full shadow-2xl border-0 overflow-hidden dark:bg-gray-800"
                    variant='borderless'
                    style={{ borderRadius: '1rem' }}
                >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div className="flex flex-col items-center mt-6 mb-8">
                        <div className="mb-6 p-3 bg-blue-50 dark:bg-gray-700 rounded-full shadow-md">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={80}
                                height={80}
                                priority
                                className="animate-pulse"
                                style={{ animationDuration: '3s' }}
                            />
                        </div>
                        <Title level={2} className="text-center m-0 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text dark:from-blue-400 dark:to-indigo-400">
                            QuizMe Admin
                        </Title>
                        <Text className="text-center text-gray-500 dark:text-gray-400 mt-2">
                            Enter your credentials to access the admin panel
                        </Text>
                    </div>

                    <Divider className="my-4 opacity-30" />

                    <Form
                        name="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        className="px-2"
                    >
                        <Form.Item
                            name="usernameOrEmail"
                            rules={[{ required: true, message: 'Please enter your username or email' }]}
                        >
                            <Input
                                prefix={<FiUser className="mr-2 text-blue-500" />}
                                placeholder="Username or Email"
                                className="rounded-lg py-2"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                            className="mb-6"
                        >
                            <Input.Password
                                prefix={<FiLock className="mr-2 text-blue-500" />}
                                placeholder="Password"
                                className="rounded-lg py-2"
                            />
                        </Form.Item>

                        <Form.Item className="mb-1">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full h-12 rounded-lg font-medium text-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
                                loading={loading}
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4 mb-2">
                            <Text className="text-gray-500 dark:text-gray-400 text-xs">
                                © 2025 QuizMe. All rights reserved.
                            </Text>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}