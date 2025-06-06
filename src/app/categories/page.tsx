"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Button,
    Typography,
    Table,
    Space,
    Tag,
    Input,
    Modal,
    Tooltip,
    Divider,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiRefreshCw,
    FiX
} from 'react-icons/fi';
import {
    FaExclamationCircle,
    FaFileCsv,
    FaFilePdf,
    FaChartBar,
    FaChartPie
} from 'react-icons/fa';
import ReactECharts from 'echarts-for-react';
import { useSnackbar } from 'notistack';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useCategories } from '@/hooks/useCategories';
import { CategoryResponse } from '@/types/database';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { confirm } = Modal;

// Định nghĩa interface cho dữ liệu danh mục với các trường bổ sung cho UI
interface CategoryWithUIData extends CategoryResponse {
    image?: string; // Hình ảnh đại diện cho danh mục trong các thẻ nổi bật
    questionCount?: number; // Số lượng câu hỏi (tính toán từ các quiz)
}

export default function CategoriesPage() {
    const t = useTranslations('categories');
    const tCommon = useTranslations('common');

    // Khởi tạo các state cho component
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar(); // Hook hiển thị thông báo

    // Sử dụng custom hook để quản lý categories
    const {
        categories: categoriesData,
        isLoading,
        error,
        fetchAllCategories,
        deleteCategory
    } = useCategories();

    // Local states
    const [searchText, setSearchText] = useState(''); // Từ khóa tìm kiếm
    const [chartView, setChartView] = useState<'bar' | 'pie'>('bar'); // Loại biểu đồ hiển thị

    // Transform categories data to include UI fields
    const categories: CategoryWithUIData[] = categoriesData.map((cat) => ({
        ...cat,
        questionCount: 0 // Giá trị mặc định, có thể tính toán nếu cần
    }));

    // Lấy dữ liệu danh mục khi component được mount
    useEffect(() => {
        fetchAllCategories();
    }, []);

    // Show error notification if any
    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
        }
    }, [error, enqueueSnackbar]);

    // Tạo danh sách danh mục nổi bật với hình ảnh
    const featuredCategories = categories
        .filter(cat => cat.isActive)
        .slice(0, 4)
        .map(cat => ({
            ...cat,
            image: cat.iconUrl || `https://source.unsplash.com/random/300x200?${cat.name.toLowerCase()}`
        }));

    // Lọc danh mục dựa trên từ khóa tìm kiếm
    const filteredCategories = categories.filter(
        cat => cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchText.toLowerCase())
    );

    // Chart options
    const getBarChartOptions = () => {
        return {
            title: {
                text: t('quizCountByCategory'),
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: categories.map(cat => cat.name),
                axisLabel: {
                    rotate: 45,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: t('quizCount'),
                    type: 'bar',
                    data: categories.map(cat => cat.quizCount),
                    itemStyle: {
                        color: '#1890ff' // Using a standard blue color for all bars
                    }
                }
            ]
        };
    };

    // Pie chart options
    const getPieChartOptions = () => {
        return {
            title: {
                text: t('quizDistributionByCategory'),
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: categories.map(cat => cat.name)
            },
            series: [
                {
                    name: t('quizCount'),
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: categories.map(cat => ({
                        name: cat.name,
                        value: cat.quizCount
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    };

    // Navigation handlers for adding/editing categories
    const handleAddCategory = () => {
        router.push('/categories/new');
    };

    const handleEditCategory = (record: CategoryWithUIData) => {
        router.push(`/categories/${record.id}`);
    };

    // Xử lý xóa danh mục
    const handleDeleteCategory = (record: CategoryWithUIData) => {
        confirm({
            title: <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{t('deleteConfirmTitle', { name: record.name })}</span>
            </div>,
            className: 'delete-confirmation-modal',
            width: 480,
            content: (
                <div style={{ marginTop: '12px' }}>
                    <div style={{ padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', marginBottom: '16px' }}>
                        <p style={{ color: '#d48806', marginBottom: '0' }}>
                            <FaExclamationCircle style={{ marginRight: '8px' }} />
                            {t('deleteWarning')}
                        </p>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '4px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>{t('id')}:</strong> {record.id}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>{t('description')}:</strong> {record.description}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div>
                                <strong>{t('quizzes')}:</strong> {record.quizCount}
                            </div>
                            <div>
                                <strong>{t('totalPlays')}:</strong> {record.totalPlayCount}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            okText: tCommon('delete'),
            okType: 'danger',
            okButtonProps: {
                icon: <FiTrash2 />,
                danger: true,
            },
            cancelText: tCommon('cancel'),
            cancelButtonProps: {
                icon: <FiX />,
            },
            onOk() {
                return handleDeleteCategoryConfirm(record.id);
            }
        });
    };

    // Hàm xóa danh mục được confirm
    const handleDeleteCategoryConfirm = async (id: number) => {
        try {
            await deleteCategory(id);
            enqueueSnackbar(t('categoryDeletedSuccess'), { variant: 'success' });
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            enqueueSnackbar(t('categoryDeleteFailed'), { variant: 'error' });
            return Promise.reject(error);
        }
    };

    // Xử lý thay đổi từ khóa tìm kiếm
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Xử lý làm mới dữ liệu
    const handleRefresh = () => {
        fetchAllCategories();
    };

    // Cấu hình các cột trong bảng
    const columns = [
        {
            title: t('id'),
            dataIndex: 'id',
            key: 'id',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.id - b.id,
        },
        {
            title: t('name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.name.localeCompare(b.name),
            render: (text: string) => (
                <Text strong>{text}</Text>
            )
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: t('quizzes'),
            dataIndex: 'quizCount',
            key: 'quizCount',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.quizCount - b.quizCount,
        },
        {
            title: t('totalPlays'),
            dataIndex: 'totalPlayCount',
            key: 'totalPlayCount',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.totalPlayCount - b.totalPlayCount,
        },
        {
            title: t('createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) =>
                new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime(),
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: t('status'),
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? t('active') : t('inactive')}
                </Tag>
            ),
            filters: [
                { text: t('active'), value: true },
                { text: t('inactive'), value: false },
            ],
            onFilter: (value: any, record: CategoryWithUIData) => record.isActive === value,
        },
        {
            title: t('actions'),
            key: 'actions',
            render: (text: string, record: CategoryWithUIData) => (
                <Space size="small">
                    <Tooltip title={tCommon('edit')}>
                        <Button
                            icon={<FiEdit />}
                            size="small"
                            onClick={() => handleEditCategory(record)}
                        />
                    </Tooltip>
                    <Tooltip title={tCommon('delete')}>
                        <Button
                            icon={<FiTrash2 />}
                            size="small"
                            danger
                            onClick={() => handleDeleteCategory(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Render component
    return (
        <div className="categories-page">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="m-0">{t('management')}</Title>
                <Space>
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddCategory}
                    >
                        {t('addCategory')}
                    </Button>
                    <Button
                        icon={<FiRefreshCw />}
                        onClick={handleRefresh}
                        loading={isLoading}
                    >
                        {t('refresh')}
                    </Button>
                </Space>
            </div>

            {/* Các thẻ thống kê */}
            <div className="mb-6">
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title={t('totalCategories')}
                                value={categories.length}
                                prefix={<Tag color="blue" className="mr-2">{t('all')}</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title={t('activeCategories')}
                                value={categories.filter(cat => cat.isActive).length}
                                prefix={<Tag color="green" className="mr-2">{t('active')}</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title={t('totalQuizzes')}
                                value={categories.reduce((sum, cat) => sum + cat.quizCount, 0)}
                                prefix={<Tag color="orange" className="mr-2">{t('quizzes')}</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title={t('totalPlays')}
                                value={categories.reduce((sum, cat) => sum + cat.totalPlayCount, 0)}
                                prefix={<Tag color="purple" className="mr-2">{t('plays')}</Tag>}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Slider các danh mục nổi bật */}
            <Card className="mb-6" title={t('featuredCategories')}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    className="categories-swiper"
                >
                    {featuredCategories.map((category) => (
                        <SwiperSlide key={category.id}>
                            <Card
                                hoverable
                                cover={
                                    <div
                                        className="h-40 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${category.image})` }}
                                    />
                                }
                                className="h-full"
                            >
                                <Card.Meta
                                    title={<span className="text-lg">{category.name}</span>}
                                    description={
                                        <div>
                                            <p className="text-gray-500">{category.description}</p>
                                            <div className="flex justify-between mt-2">
                                                <Tag color="blue">{category.quizCount} {t('quizzes')}</Tag>
                                                <Tag color="blue">{category.totalPlayCount} {t('plays')}</Tag>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Card>

            {/* Charts Section */}
            <Card
                className="mb-6"
                title={t('categoryAnalytics')}
                extra={
                    <Space>
                        <Button
                            type={chartView === 'bar' ? 'primary' : 'default'}
                            icon={<FaChartBar />}
                            onClick={() => setChartView('bar')}
                        >
                            {t('barChart')}
                        </Button>
                        <Button
                            type={chartView === 'pie' ? 'primary' : 'default'}
                            icon={<FaChartPie />}
                            onClick={() => setChartView('pie')}
                        >
                            {t('pieChart')}
                        </Button>
                    </Space>
                }
            >
                <div className="h-80">
                    <ReactECharts
                        option={chartView === 'bar' ? getBarChartOptions() : getPieChartOptions()}
                        style={{ height: '100%', width: '100%' }}
                        className="chart-container"
                    />
                </div>
            </Card>

            {/* Main Table */}
            <Card
                title={t('allCategories')}
                className="mb-6"
                loading={isLoading}
                extra={
                    <Space>
                        <Input
                            placeholder={t('searchCategories')}
                            prefix={<FiSearch />}
                            onChange={handleSearchChange}
                            value={searchText}
                            allowClear
                            className="w-60"
                        />
                        <Tooltip title={t('exportToExcel')}>
                            <Button icon={<FaFileCsv />} />
                        </Tooltip>
                        <Tooltip title={t('exportToPdf')}>
                            <Button icon={<FaFilePdf />} />
                        </Tooltip>
                    </Space>
                }
            >
                <Table
                    dataSource={filteredCategories}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} ${t('ofItems', { total: total.toString() })}`
                    }}
                />
            </Card>
        </div>
    );
}