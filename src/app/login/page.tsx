"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Form, Input, Button, Alert, Card, Typography, Spin } from 'antd';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useSnackbar } from 'notistack';
import { LoginRequest } from '@/shared/types/database';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

// Card styles for glassmorphism effect
const cardStyles = {
    light: 'bg-white/95 backdrop-blur-sm',
    dark: 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50',
};

function LoginPageContent() {
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');

    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();
    const { theme: currentTheme } = useTheme();
    const isDarkMode = currentTheme === 'dark';
    const searchParams = useSearchParams();
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [form] = Form.useForm();

    // Lấy redirect path từ URL params hoặc default dashboard
    const redirectPath = searchParams.get('from') || '/dashboard';

    // Redirect nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push(redirectPath);
        }
    }, []);

    useEffect(() => {
        // Clear errors khi component mount
        clearError();
        setLocalError('');
        // Hiển thị thông báo nếu người dùng bị redirect đến trang đăng nhập
        if (searchParams.get('from')) {
            enqueueSnackbar(t('loginContinue'), { variant: 'info' });
        }
    }, [searchParams, enqueueSnackbar, clearError]);

    // Clear error khi user bắt đầu nhập
    const handleInputChange = () => {
        if (localError) setLocalError('');
        if (authError) clearError();
    };

    const onFinish = async (values: { usernameOrEmail: string; password: string }) => {
        setIsSubmitting(true);
        setLocalError('');
        clearError();

        try {
            // Validate input
            if (!values.usernameOrEmail?.trim() || !values.password?.trim()) {
                setLocalError(t('fillAllFields'));
                return;
            }

            // Tạo đối tượng yêu cầu đăng nhập
            const loginRequest: LoginRequest = {
                usernameOrEmail: values.usernameOrEmail.trim(),
                password: values.password
            };

            // Gọi hàm đăng nhập từ context
            const result = await login(loginRequest);
            if (result.success) {
                enqueueSnackbar(t('loginSuccess'), { variant: 'success' });

                // Reset form
                form.resetFields();

                // Redirect với delay nhỏ để user thấy thông báo success
                router.push(redirectPath);

            } else {
                setLocalError(result.message || t('loginFailed'));
                enqueueSnackbar(t('loginFailed'), { variant: 'error' });
            }
        } catch (err: any) {
            const errorMessage = err?.message || t('unexpectedError');
            setLocalError(errorMessage);
            enqueueSnackbar(t('loginError'), { variant: 'error' });
            console.error('Login error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        enqueueSnackbar(t('checkInput'), { variant: 'warning' });
    };

    // Hiển thị loading khi đang check authentication
    if (authLoading) {
        return (
            <div className={"min-h-screen flex items-center justify-center"}>
                <div className={`p-8 rounded-3xl shadow-2xl ${isDarkMode ? cardStyles.dark : cardStyles.light}`}>
                    <div className="text-center">
                        <Spin size="large" />
                        <Title level={4} className={`mt-4 ${isDarkMode ? 'text-white' : ''}`}>
                            {tCommon('loading')}
                        </Title>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị error từ context hoặc local
    const displayError = authError || localError;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${isDarkMode ? 'bg-purple-500/10' : 'bg-white/10'} blur-3xl`} />
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${isDarkMode ? 'bg-pink-500/10' : 'bg-white/10'} blur-3xl`} />
            </div>

            <Card
                className={`w-full max-w-md shadow-2xl relative z-10 ${isDarkMode ? cardStyles.dark : cardStyles.light}`}
                style={{
                    borderRadius: 24,
                }}
                styles={{
                    body: {
                        padding: '40px 32px',
                    }
                }}
                variant='borderless'
            >
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo.png"
                            alt="QuizMe Admin Logo"
                            width={80}
                            height={80}
                            className="mx-auto"
                            priority
                        />
                    </div>
                    <Title level={2} className={`mb-2! mt-0! ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {t('loginTitle')}
                    </Title>
                    <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {t('loginSubtitle')}
                    </Text>
                </div>

                {/* Error Alert */}
                {displayError && (
                    <Alert
                        message={t('loginErrorTitle')}
                        description={displayError}
                        type="error"
                        showIcon
                        closable
                        className="mb-6 rounded-xl"
                        onClose={() => {
                            setLocalError('');
                            clearError();
                        }}
                    />
                )}

                {/* Login Form */}
                <Form
                    form={form}
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                    requiredMark={false}
                    size="large"
                    autoComplete="on"
                >
                    <Form.Item
                        name="usernameOrEmail"
                        rules={[
                            { required: true, message: t('enterUsername') },
                            { min: 2, message: t('usernameMinLength') }
                        ]}
                    >
                        <Input
                            prefix={<FiUser className="text-gray-400 mr-2" />}
                            placeholder={t('usernamePlaceholder')}
                            autoComplete="username"
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className={`h-12 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500' : ''}`}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: t('enterPassword') },
                            { min: 2, message: t('passwordMinLength') }
                        ]}
                    >
                        <Input.Password
                            prefix={<FiLock className="text-gray-400 mr-2" />}
                            placeholder={t('passwordPlaceholder')}
                            autoComplete="current-password"
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className={`h-12 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500' : ''}`}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0 mt-6">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting || authLoading}
                            block
                            icon={!isSubmitting && <FiLogIn className="mr-1" />}
                            className="h-12 rounded-xl font-semibold text-base bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isSubmitting ? t('loggingIn') : t('loginButton')}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('noAccount')}
                    </Text>
                </div>
            </Card>
        </div>
    );
}

// Loading component for Suspense fallback
function LoginPageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 rounded-3xl shadow-2xl bg-white/95 backdrop-blur-sm">
                <div className="text-center">
                    <Spin size="large" />
                    <Title level={4} className="mt-4">Loading...</Title>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageLoading />}>
            <LoginPageContent />
        </Suspense>
    );
}