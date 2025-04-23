"use client";

import React from 'react';
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
import { StatItem, Category, Quiz, Activity } from '@/types/database';

const { Title } = Typography;

export default function Dashboard() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Dữ liệu mẫu cho thống kê
    const stats: StatItem[] = [
        { title: 'Total Users', value: 1245, icon: <FiUsers />, color: 'blue' },
        { title: 'Total Quizzes', value: 86, icon: <FiHelpCircle />, color: 'green' },
        { title: 'Total Questions', value: 576, icon: <FiFileText />, color: 'purple' },
        { title: 'Active Categories', value: 12, icon: <FiFolder />, color: 'orange' },
    ];

    // Dữ liệu mẫu cho danh mục
    const topCategories: Category[] = [
        { id: 1, name: 'Programming', description: 'Programming related quizzes', quiz_count: 24, total_play_count: 1245, icon_url: '/code.svg' },
        { id: 2, name: 'Science', description: 'Science related quizzes', quiz_count: 18, total_play_count: 876, icon_url: '/science.svg' },
        { id: 3, name: 'Mathematics', description: 'Math related quizzes', quiz_count: 15, total_play_count: 643, icon_url: '/math.svg' },
        { id: 4, name: 'Language', description: 'Language related quizzes', quiz_count: 12, total_play_count: 589, icon_url: '/language.svg' },
        { id: 5, name: 'History', description: 'History related quizzes', quiz_count: 8, total_play_count: 421, icon_url: '/history.svg' },
    ];

    // Dữ liệu mẫu cho các bài quiz gần đây
    const recentQuizzes: Quiz[] = [
        { id: 1, title: 'JavaScript Fundamentals', category_name: 'Programming', category_id: 1, difficulty: 'medium', question_count: 20, play_count: 45, is_public: true },
        { id: 2, title: 'React Advanced', category_name: 'Programming', category_id: 1, difficulty: 'hard', question_count: 25, play_count: 32, is_public: true },
        { id: 3, title: 'Data Science Basics', category_name: 'Science', category_id: 2, difficulty: 'easy', question_count: 15, play_count: 56, is_public: true },
        { id: 4, title: 'English Grammar', category_name: 'Language', category_id: 4, difficulty: 'medium', question_count: 30, play_count: 78, is_public: true },
        { id: 5, title: 'World History', category_name: 'History', category_id: 5, difficulty: 'hard', question_count: 40, play_count: 23, is_public: false },
    ];

    // Dữ liệu mẫu cho hoạt động người dùng gần đây
    const recentActivities: Activity[] = [
        { id: 1, user: 'John Doe', action: 'Completed', quiz: 'JavaScript Fundamentals', score: '18/20', time: '2 hours ago', status: 'success' },
        { id: 2, user: 'Sarah Kim', action: 'Started', quiz: 'React Advanced', score: 'In progress', time: '3 hours ago', status: 'processing' },
        { id: 3, user: 'Mike Johnson', action: 'Failed', quiz: 'Data Science Basics', score: '8/15', time: '5 hours ago', status: 'error' },
        { id: 4, user: 'Emily Davis', action: 'Completed', quiz: 'English Grammar', score: '27/30', time: '1 day ago', status: 'success' },
        { id: 5, user: 'Alex Wilson', action: 'Abandoned', quiz: 'World History', score: '10/40', time: '2 days ago', status: 'warning' },
    ];

    // Phân phối độ khó của quiz cho biểu đồ tròn
    const difficultyData = [
        { name: 'Easy', value: 32 },
        { name: 'Medium', value: 43 },
        { name: 'Hard', value: 11 },
    ];

    // Cấu hình tùy chọn ECharts cho biểu đồ tròn
    const pieChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            top: 'top',
            data: ['Easy', 'Medium', 'Hard'],
            textStyle: {
                color: isDarkMode ? '#cccccc' : '#333333'
            }
        },
        series: [
            {
                name: 'Difficulty',
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
                data: difficultyData,
                color: [
                    isDarkMode ? '#6EE7B7' : '#3f8600', // Dễ - Xanh lá
                    isDarkMode ? '#93C5FD' : '#1890ff', // Trung bình - Xanh dương
                    isDarkMode ? '#FCA5A5' : '#cf1322'  // Khó - Đỏ
                ]
            }
        ],
        backgroundColor: 'transparent'
    };

    const getQuizDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'blue';
            case 'hard': return 'red';
            default: return 'default';
        }
    };

    const quizColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <a href="#">{text}</a>,
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Difficulty',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (difficulty: string) => (
                <Tag color={getQuizDifficultyColor(difficulty)}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Questions',
            dataIndex: 'question_count',
            key: 'question_count',
        },
        {
            title: 'Play Count',
            dataIndex: 'play_count',
            key: 'play_count',
        },
        {
            title: 'Status',
            dataIndex: 'is_public',
            key: 'is_public',
            render: (isPublic: boolean) => (
                <Tag color={isPublic ? 'success' : 'default'}>
                    {isPublic ? 'Public' : 'Private'}
                </Tag>
            ),
        },
    ];

    const categoryColumns = [
        {
            title: 'Category Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <a href="#">{text}</a>,
        },
        {
            title: 'Quiz Count',
            dataIndex: 'quiz_count',
            key: 'quiz_count',
        },
        {
            title: 'Total Plays',
            dataIndex: 'total_play_count',
            key: 'total_play_count',
        },
        {
            title: 'Popularity',
            key: 'popularity',
            render: (_: any, record: Category) => (
                <Progress
                    percent={Math.min(100, Math.round(record.total_play_count / 20))}
                    size="small"
                    status="active"
                    format={(percent) => `${percent}%`}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <Title level={4} className="m-0">Dashboard Overview</Title>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiClock className="mr-1 inline-block" />
                    Last updated: April 23, 2025
                </div>
            </div>

            {/* Thẻ thống kê */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            bordered={false}
                            className={`hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
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
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold">Quiz Distribution by Difficulty</span>}
                        bordered={false}
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
                                    title="Easy"
                                    value={difficultyData[0].value}
                                    valueStyle={{ color: isDarkMode ? '#6EE7B7' : '#3f8600' }}
                                />
                            </Card>
                            <Card className={`text-center ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                <Statistic
                                    title="Medium"
                                    value={difficultyData[1].value}
                                    valueStyle={{ color: isDarkMode ? '#93C5FD' : '#1890ff' }}
                                />
                            </Card>
                            <Card className={`text-center ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <Statistic
                                    title="Hard"
                                    value={difficultyData[2].value}
                                    valueStyle={{ color: isDarkMode ? '#FCA5A5' : '#cf1322' }}
                                />
                            </Card>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold">Top Categories</span>}
                        bordered={false}
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                    >
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

            {/* Quiz gần đây & Hoạt động */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<span className="font-bold">Recent Quizzes</span>}
                        bordered={false}
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                        extra={<a href="#">View All</a>}
                    >
                        <Table
                            dataSource={recentQuizzes}
                            columns={quizColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="middle"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        title={<span className="font-bold">Recent User Activities</span>}
                        bordered={false}
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                        extra={<a href="#">View All</a>}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={recentActivities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<FiUser />} />}
                                        title={<span>{item.user}</span>}
                                        description={
                                            <div>
                                                <Tag
                                                    color={
                                                        item.status === 'success' ? 'success' :
                                                            item.status === 'processing' ? 'processing' :
                                                                item.status === 'error' ? 'error' :
                                                                    'warning'
                                                    }
                                                >
                                                    {item.action}
                                                </Tag>
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} style={{ marginLeft: '4px' }}>{item.quiz}</span>
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                                    <span className="mr-3">{item.score}</span>
                                                    <span>{item.time}</span>
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Trạng thái hoàn thành Quiz */}
            <Card
                title={<span className="font-bold"><FiBarChart2 className="inline-block mr-2" />Quiz Engagement Overview</span>}
                bordered={false}
                className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card
                            bordered={false}
                            className={`text-center ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}
                        >
                            <Statistic
                                title="Completed Attempts"
                                value={1532}
                                valueStyle={{ color: isDarkMode ? '#6EE7B7' : '#3f8600' }}
                                prefix={<FiCheckCircle />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card
                            bordered={false}
                            className={`text-center ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                        >
                            <Statistic
                                title="Total Play Count"
                                value={1991}
                                valueStyle={{ color: isDarkMode ? '#93C5FD' : '#1890ff' }}
                                prefix={<FiTrendingUp />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card
                            bordered={false}
                            className={`text-center ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}
                        >
                            <Statistic
                                title="Average Questions Per Quiz"
                                value={15}
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