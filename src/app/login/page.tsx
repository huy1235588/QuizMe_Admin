"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Form, Input, Button, Alert, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSnackbar } from 'notistack';

const { Title, Text } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { theme: currentTheme } = useTheme();
    const isDarkMode = currentTheme === 'dark';
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Lấy tham số 'from' nếu có để chuyển hướng sau khi đăng nhập
    const redirectPath = searchParams.get('from') || '/dashboard';

    useEffect(() => {
        // Hiển thị thông báo nếu người dùng bị redirect đến trang đăng nhập
        if (searchParams.get('from')) {
            enqueueSnackbar('Please login to continue', { variant: 'info' });
        }
    }, [searchParams, enqueueSnackbar]);

    const onFinish = async (values: { usernameOrEmail: string; password: string }) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await login(values.usernameOrEmail, values.password);

            if (result.success) {
                enqueueSnackbar('Login successful!', { variant: 'success' });
                // Redirect đến trang trước đó hoặc dashboard
                router.push(redirectPath);
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError('An error occurred during login');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Card
                className="w-full max-w-md shadow-lg"
                style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                bordered={false}
            >
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="QuizMe Admin Logo"
                            width={120}
                            height={120}
                            className="mx-auto"
                        />
                    </div>
                    <Title level={2} className="!mt-0">
                        QuizMe Admin Login
                    </Title>
                    <Text type="secondary">
                        Enter your login credentials to continue managing the system
                    </Text>
                </div>

                <Divider />

                {error && (
                    <Alert
                        message="Login Error"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        className="mb-4"
                    />
                )}

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                    size="large"
                >
                    <Form.Item
                        name="usernameOrEmail"
                        rules={[{ required: true, message: 'Please enter your username or email!' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon mr-2" />}
                            placeholder="Username or Email"
                            autoComplete="username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon mr-2" />}
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            style={{ height: 45 }}
                            className="mt-2"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}