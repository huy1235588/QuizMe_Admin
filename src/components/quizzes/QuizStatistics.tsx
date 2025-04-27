// File: Thống kê bài kiểm tra (Quiz Statistics)
import React, { useMemo } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { FiHelpCircle, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { BsCalendarDate, BsGraphUp } from 'react-icons/bs';
import ReactECharts from 'echarts-for-react';
import { HiOutlineChartPie } from 'react-icons/hi';
import { Category } from '@/types/database';

const { Text } = Typography;

// Định nghĩa interface cho props của component
interface QuizStatisticsProps {
    isDarkMode: boolean; // Chế độ tối
    totalQuizzes: number; // Tổng số bài kiểm tra
    publishedQuizzes: number; // Số bài kiểm tra đã xuất bản
    recentQuizzes: number; // Số bài kiểm tra gần đây
    totalPlays: number; // Tổng số lượt chơi
    categories: Category[]; // Danh sách các danh mục
    difficultyDistribution: { // Phân bố độ khó
        easy: number; // Dễ
        medium: number; // Trung bình
        hard: number; // Khó
    };
}

// Các hàm tiện ích để tạo class name
const getCardClass = (color: string, isDarkMode: boolean) => {
    return `stat-card bg-gradient-to-br ${
        isDarkMode 
            ? `from-${color}-900/40 to-${color}-800/20 border-${color}-700/50` 
            : `from-${color}-50 to-${color}-100 border-${color}-200`
    } border overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300`;
};

const getIconClass = (color: string, isDarkMode: boolean) => {
    return `flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
        isDarkMode 
            ? `text-${color}-300` 
            : `text-${color}-600`
    }`;
};

// Component thẻ thống kê để tái sử dụng
interface StatCardProps {
    icon: React.ReactNode; // Biểu tượng
    value: number; // Giá trị
    label: string; // Nhãn
    color: string; // Màu sắc
    isDarkMode: boolean; // Chế độ tối
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, isDarkMode }) => {
    const IconComponent = React.cloneElement(icon as React.ReactElement<{className?: string}>, { className: "text-xl" });
    const BigIconComponent = React.cloneElement(icon as React.ReactElement<{className?: string}>, { className: "text-7xl" });
    
    return (
        <Card className={getCardClass(color, isDarkMode)}>
            <div className="flex items-center gap-4">
                <div className={getIconClass(color, isDarkMode)}>
                    {IconComponent}
                </div>
                <div>
                    <div className="text-3xl font-bold">{value}</div>
                    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{label}</Text>
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
                {BigIconComponent}
            </div>
        </Card>
    );
};

const QuizStatistics: React.FC<QuizStatisticsProps> = ({
    isDarkMode,
    totalQuizzes,
    publishedQuizzes,
    recentQuizzes,
    totalPlays,
    categories,
    difficultyDistribution,
}) => {
    // Cấu hình biểu đồ được ghi nhớ (memoized) để tối ưu hiệu suất
    // Biểu đồ phân bố danh mục
    const quizCategoryDistributionOptions = useMemo(() => ({
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} quizzes ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: {
                color: isDarkMode ? '#cccccc' : '#333333'
            }
        },
        series: [
            {
                name: 'Quiz Categories',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: isDarkMode ? '#374151' : '#ffffff',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: categories.map(category => ({
                    value: category.quizCount,
                    name: category.name
                })),
                color: [
                    '#3b82f6', '#ec4899', '#22c55e', '#eab308', '#8b5cf6', '#f97316'
                ]
            }
        ],
        backgroundColor: 'transparent'
    }), [categories, isDarkMode]);

    // Biểu đồ phân bố độ khó
    const quizDifficultyDistributionOptions = useMemo(() => ({
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} quizzes ({d}%)'
        },
        legend: {
            bottom: '0',
            left: 'center',
            textStyle: {
                color: isDarkMode ? '#cccccc' : '#333333'
            }
        },
        series: [
            {
                name: 'Quiz Difficulty',
                type: 'pie',
                radius: '70%',
                itemStyle: {
                    borderRadius: 5,
                    borderColor: isDarkMode ? '#374151' : '#ffffff',
                    borderWidth: 2
                },
                data: [
                    { value: difficultyDistribution.easy, name: 'Easy', itemStyle: { color: isDarkMode ? '#86efac' : '#22c55e' } },
                    { value: difficultyDistribution.medium, name: 'Medium', itemStyle: { color: isDarkMode ? '#93c5fd' : '#3b82f6' } },
                    { value: difficultyDistribution.hard, name: 'Hard', itemStyle: { color: isDarkMode ? '#fda4af' : '#ef4444' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    color: isDarkMode ? '#cccccc' : '#333333'
                }
            }
        ],
        backgroundColor: 'transparent'
    }), [difficultyDistribution, isDarkMode]);

    // Dữ liệu cho các thẻ thống kê
    const statCards = [
        {
            icon: <FiHelpCircle />,
            value: totalQuizzes,
            label: 'Total Quizzes',
            color: 'blue'
        },
        {
            icon: <FiCheckCircle />,
            value: publishedQuizzes,
            label: 'Published Quizzes',
            color: 'green'
        },
        {
            icon: <BsCalendarDate />,
            value: recentQuizzes,
            label: 'Created in 30 Days',
            color: 'orange'
        },
        {
            icon: <BsGraphUp />,
            value: totalPlays,
            label: 'Total Plays',
            color: 'purple'
        }
    ];

    return (
        <>
            {/* Thống kê nhanh */}
            <Row gutter={[16, 16]}>
                {statCards.map((card, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <StatCard
                            icon={card.icon}
                            value={card.value}
                            label={card.label}
                            color={card.color}
                            isDarkMode={isDarkMode}
                        />
                    </Col>
                ))}
            </Row>

            {/* Biểu đồ */}
            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <Card
                        title={<span className="font-bold flex items-center gap-2"><HiOutlineChartPie /> Quiz Categories</span>}
                        variant='outlined'
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                    >
                        <ReactECharts
                            option={quizCategoryDistributionOptions}
                            style={{ height: 300 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title={<span className="font-bold flex items-center gap-2"><FiBarChart2 className="mr-2" /> Quiz Difficulty</span>}
                        variant='outlined'
                        className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                    >
                        <ReactECharts
                            option={quizDifficultyDistributionOptions}
                            style={{ height: 300 }}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default QuizStatistics;