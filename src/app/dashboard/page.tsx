"use client";

import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Statistic,
    Table,
    Tag,
    List,
    Avatar,
    Progress
} from 'antd';
import ReactECharts from 'echarts-for-react';
import {
    FiUsers,
    FiFileText,
    FiTrendingUp,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiFolder,
    FiHelpCircle,
    FiBarChart2
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, Quiz, Activity, Question } from '@/types/database';
import axiosInstance from '@/utils/axios';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

type StatItem = {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

export default function Dashboard() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const t = useTranslations('dashboard');
    const tc = useTranslations('common');

    const [topCategories, setTopCategories] = useState<Category[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [userCount, setUserCount] = useState<number>(0);

    // State để quản lý trạng thái loading và error
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dữ liệu mẫu cho thống kê
    const stats: StatItem[] = [
        {
            title: t('totalUsers'),
            value: userCount,
            icon: <FiUsers />,
            color: 'blue'
        },
        {
            title: t('totalQuizzes'),
            value: quizzes.length,
            icon: <FiHelpCircle />,
            color: 'green'
        },
        {
            title: t('totalQuestions'),
            value: quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0),
            icon: <FiFileText />,
            color: 'purple'
        },
        {
            title: t('totalCategories'),
            value: topCategories.length,
            icon: <FiFolder />,
            color: 'orange'
        },
    ];

    // Fetch danh sách danh mục hàng đầu từ API
    const fetchCategories = async () => {
        try {
            // Đặt trạng thái loading
            setLoading(true);

            // Gọi API để lấy danh sách danh mục
            const response = await axiosInstance.get<{ data: Category[] }>('/api/categories');

            // Cập nhật danh sách danh mục vào state
            setTopCategories(response.data.data);

            // Đặt trạng thái lỗi thành null nếu không có lỗi
            setError(null);

        } catch (err) {
            console.error('Error fetching categories:', err);

            setTopCategories([]);

        } finally {
            setLoading(false);
        }
    };

    // Fetch danh sách quiz từ API
    const fetchQuizzes = async () => {
        try {
            // Đặt trạng thái loading
            setLoading(true);

            // Gọi API để lấy danh sách quiz
            const response = await axiosInstance.get<{ data: Quiz[] }>('/api/quizzes');

            // Cập nhật danh sách quiz vào state
            setQuizzes(response.data.data);

            // Đặt trạng thái lỗi thành null nếu không có lỗi
            setError(null);

        } catch (err) {
            console.error('Error fetching quizzes:', err);

            setQuizzes([]);

        } finally {
            setLoading(false);
        }
    };

    // Fetch số lượng người dùng từ API
    const fetchUserCount = async () => {
        try {
            const response = await axiosInstance.get<{ data: { count: number } }>('/api/users/count');
            setUserCount(response.data.data.count);
        } catch (err) {
            console.error('Error fetching user count:', err);
        }
    };

    // Phân phối độ khó của quiz cho biểu đồ tròn
    const [difficultyData, setDifficultyData] = useState([
        { name: t('easy'), value: 0 },
        { name: t('medium'), value: 0 },
        { name: t('hard'), value: 0 },
    ]);

    // Fetch data độ khó
    const fetchDifficultyData = async () => {
        try {
            const levels = ['easy', 'medium', 'hard'];
            const responses = await Promise.all(
                levels.map(level =>
                    axiosInstance.get<{ data: Quiz[] }>(`/api/quizzes/difficulty/${level.toUpperCase()}`)
                )
            );
            setDifficultyData(responses.map((res, idx) => {
                const level = levels[idx];
                let translatedLevel;
                switch (level) {
                    case 'easy': translatedLevel = t('easy'); break;
                    case 'medium': translatedLevel = t('medium'); break;
                    case 'hard': translatedLevel = t('hard'); break;
                    default: translatedLevel = level.charAt(0).toUpperCase() + level.slice(1);
                }
                return {
                    name: translatedLevel,
                    value: res.data.data.length,
                };
            })
            );
        } catch (err) {
            console.error('Error fetching difficulty data:', err);
        }
    };

    // Cấu hình tùy chọn ECharts cho biểu đồ tròn
    const pieChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            top: 'top',
            data: [t('easy'), t('medium'), t('hard')],
            textStyle: {
                color: isDarkMode ? '#cccccc' : '#333333'
            }
        },
        series: [
            {
                name: t('difficulty'),
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: isDarkMode ? '#374151' : '#ffffff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '20',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { name: t('easy'), value: difficultyData[0].value },
                    { name: t('medium'), value: difficultyData[1].value },
                    { name: t('hard'), value: difficultyData[2].value }
                ],
                color: [
                    isDarkMode ? '#6EE7B7' : '#3f8600', // Dễ - Xanh lá
                    isDarkMode ? '#93C5FD' : '#1890ff', // Trung bình - Xanh dương
                    isDarkMode ? '#FCA5A5' : '#cf1322'  // Khó - Đỏ
                ]
            }
        ],
        backgroundColor: 'transparent'
    };

    // Hàm để lấy màu sắc cho độ khó của quiz
    const getQuizDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'blue';
            case 'hard': return 'red';
            default: return 'default';
        }
    };

    // Cấu hình cột cho bảng quiz và danh mục
    const quizColumns = [
        {
            title: t('quizTitle'),
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <a href="#">{text}</a>,
        },
        {
            title: t('category'),
            dataIndex: 'categoryName',
            key: 'category_name',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: t('difficulty'),
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (difficulty: string) => (
                <Tag color={getQuizDifficultyColor(difficulty)}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Tag>
            ),
        },
        {
            title: t('questions'),
            dataIndex: 'questionCount',
            key: 'question_count',
        },
        {
            title: t('playCount'),
            dataIndex: 'playCount',
            key: 'play_count',
        },
        {
            title: t('status'),
            dataIndex: 'is_public',
            key: 'is_public',
            render: (isPublic: boolean) => (
                <Tag color={isPublic ? 'success' : 'default'}>
                    {isPublic ? t('public') : t('private')}
                </Tag>
            ),
        },
    ];

    // Cấu hình cột cho bảng danh mục
    const categoryColumns = [
        {
            title: t('categoryName'),
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <a href="#">{text}</a>,
        },
        {
            title: t('quizCount'),
            dataIndex: 'quizCount',
            key: 'quiz_count',
        },
        {
            title: t('totalPlays'),
            dataIndex: 'totalPlayCount',
            key: 'total_play_count',
        },
        {
            title: t('popularity'),
            key: 'popularity',
            render: (_: any, record: Category) => (
                <Progress
                    percent={Math.min(100, Math.round(record.totalPlayCount / 20))}
                    size="small"
                    status="active"
                    format={(percent) => `${percent}%`}
                />
            ),
        },
    ];

    useEffect(() => {
        // Gọi hàm fetchCategories khi component được mount
        fetchCategories();

        // Gọi hàm fetchQuizzes khi component được mount
        fetchQuizzes();

        // Gọi hàm fetchDifficultyData khi component được mount
        fetchDifficultyData();

        // Gọi hàm fetchUserCount khi component được mount
        fetchUserCount();

    }, []);

    // Tính toán tổng số lượt chơi và số câu hỏi trung bình trên quiz
    const totalPlayCount = quizzes.reduce((sum, q) => sum + (q.playCount || 0), 0);
    // Tính toán số câu hỏi trung bình trên quiz
    const avgQuestionsPerQuiz = quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0) / quizzes.length)
        : 0;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2 py-3">
                <Title level={4} className="m-0">{t('title')}</Title>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiClock className="mr-1 inline-block" />
                    {t('lastUpdated')}: April 23, 2025
                </div>
            </div>

            {/* Thẻ thống kê */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            variant='borderless'
                            className={`h-full hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                        >
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 ${isDarkMode
                                    ? `bg-${stat.color}-900 text-${stat.color}-400`
                                    : `bg-${stat.color}-100 text-${stat.color}-500`
                                    } text-xl`}>
                                    {stat.icon}
                                </div>
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    valueStyle={{ fontWeight: 'bold' }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Phân phối Quiz & Danh mục hàng đầu */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>                    <Card
                    title={<span className="font-bold">{t('quizDistribution')}</span>}
                    variant='borderless'
                    className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                >
                    <div className="flex justify-center" style={{ height: 240 }}>
                        <ReactECharts
                            option={pieChartOption}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <Card className={`text-center ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <Statistic
                                title={t('easy')}
                                value={difficultyData[0].value}
                                valueStyle={{ color: isDarkMode ? '#6EE7B7' : '#3f8600' }}
                            />
                        </Card>
                        <Card className={`text-center ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                            <Statistic
                                title={t('medium')}
                                value={difficultyData[1].value}
                                valueStyle={{ color: isDarkMode ? '#93C5FD' : '#1890ff' }}
                            />
                        </Card>
                        <Card className={`text-center ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <Statistic
                                title={t('hard')}
                                value={difficultyData[2].value}
                                valueStyle={{ color: isDarkMode ? '#FCA5A5' : '#cf1322' }}
                            />
                        </Card>
                    </div>
                </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold">{t('topCategories')}</span>}
                        variant='borderless'
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                        loading={loading}
                    >
                        {error && <div className="text-red-500 mb-4">{tc('errors.general')}</div>}
                        {loading && <div className="text-center my-4">{tc('loading')}</div>}
                        <Table
                            dataSource={topCategories}
                            columns={categoryColumns}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quiz gần đây */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={24}>
                    <Card
                        title={<span className="font-bold">{t('recentQuizzes')}</span>}
                        variant='borderless'
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                        extra={<a href="#">{t('viewAll')}</a>}
                    >
                        <Table
                            dataSource={quizzes}
                            loading={loading}
                            columns={quizColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Trạng thái hoàn thành Quiz */}
            <Card
                title={<span className="font-bold"><FiBarChart2 className="inline-block mr-2" />{t('quizEngagement')}</span>}
                variant='borderless'
                className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card
                            variant='borderless'
                            className={`text-center ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}
                        >                                <Statistic
                                title={t('completedAttempts')}
                                value={1532}
                                valueStyle={{ color: isDarkMode ? '#6EE7B7' : '#3f8600' }}
                                prefix={<FiCheckCircle />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card
                            variant='borderless'
                            className={`text-center ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                        >                                <Statistic
                                title={t('totalPlayCount')}
                                value={totalPlayCount}
                                valueStyle={{ color: isDarkMode ? '#93C5FD' : '#1890ff' }}
                                prefix={<FiTrendingUp />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card
                            variant='borderless'
                            className={`text-center ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}
                        >                                <Statistic
                                title={t('averageQuestionsPerQuiz')}
                                value={avgQuestionsPerQuiz}
                                valueStyle={{ color: isDarkMode ? '#FCD34D' : '#d48806' }}
                                prefix={<FiFileText />}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}