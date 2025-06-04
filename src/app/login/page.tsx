"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Form, Input, Button, Alert, Card, Typography, Divider } from 'antd';
import { FiUser, FiLock } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { useSnackbar } from 'notistack';
import { LoginRequest } from '@/types/database';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

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
            const result = await login(loginRequest); if (result.success) {
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
    }; const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        enqueueSnackbar(t('checkInput'), { variant: 'warning' });
    };

    // Hiển thị loading khi đang check authentication
    if (authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <Card className="w-full max-w-md shadow-lg" style={{ borderRadius: 12 }}>
                    <div className="text-center py-8">
                        <Title level={4}>{tCommon('loading')}</Title>
                    </div>
                </Card>
            </div>
        );
    }

    // Hiển thị error từ context hoặc local
    const displayError = authError || localError;

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Card
                className="w-full max-w-md shadow-lg"
                style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                variant='borderless'
            >
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="QuizMe Admin Logo"
                            width={120}
                            height={120}
                            className="mx-auto"
                            priority
                        />
                    </div>
                    <Title level={2} className="!mt-0">
                        {t('loginTitle')}
                    </Title>
                    <Text type="secondary">
                        {t('loginSubtitle')}
                    </Text>
                </div>

                <Divider />
                {displayError && (
                    <Alert
                        message={t('loginErrorTitle')}
                        description={displayError}
                        type="error"
                        showIcon
                        closable
                        className="mb-4"
                        onClose={() => {
                            setLocalError('');
                            clearError();
                        }}
                    />
                )}

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
                            prefix={<FiUser className="site-form-item-icon mr-2" />}
                            placeholder={t('usernamePlaceholder')}
                            autoComplete="username"
                            onChange={handleInputChange}
                            disabled={isSubmitting}
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
                            prefix={<FiLock className="site-form-item-icon mr-2" />}
                            placeholder={t('passwordPlaceholder')}
                            autoComplete="current-password"
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting || authLoading}
                            block
                            style={{ height: 45 }}
                            className="mt-2"
                        >
                            {isSubmitting ? t('loggingIn') : t('loginButton')}
                        </Button>
                    </Form.Item>
                </Form>                <div className="text-center mt-4">
                    <Text type="secondary" className="text-sm">
                        {t('noAccount')}
                    </Text>
                </div></Card>
        </div>
    );
}

// Loading component for Suspense fallback
function LoginPageLoading() {
    const { theme: currentTheme } = useTheme();
    const isDarkMode = currentTheme === 'dark';
    const tCommon = useTranslations('common');

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Card className="w-full max-w-md shadow-lg" style={{ borderRadius: 12 }}>
                <div className="text-center py-8">
                    <Title level={4}>{tCommon('loading')}</Title>
                </div>
            </Card>
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