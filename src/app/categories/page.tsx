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
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    BarChartOutlined,
    PieChartOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useSnackbar } from 'notistack';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import axiosInstance from '@/utils/axios';
import { Category } from '@/types/database';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const { Title, Text } = Typography;
const { confirm } = Modal;

// Các endpoint API
const API_ENDPOINTS = {
    CATEGORIES: '/api/categories',
    CATEGORY: (id: number) => `/api/categories/${id}`
};

// Định nghĩa interface cho dữ liệu danh mục với các trường bổ sung cho UI
interface CategoryWithUIData extends Category {
    image?: string; // Hình ảnh đại diện cho danh mục trong các thẻ nổi bật
    questionCount?: number; // Số lượng câu hỏi (tính toán từ các quiz)
}

export default function CategoriesPage() {
    // Khởi tạo các state cho component
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryWithUIData[]>([]); // Danh sách các danh mục
    const [searchText, setSearchText] = useState(''); // Từ khóa tìm kiếm
    const { enqueueSnackbar } = useSnackbar(); // Hook hiển thị thông báo
    const [loading, setLoading] = useState(false); // Trạng thái đang tải
    const [chartView, setChartView] = useState<'bar' | 'pie'>('bar'); // Loại biểu đồ hiển thị

    // Lấy dữ liệu danh mục khi component được mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Hàm lấy dữ liệu danh mục từ API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
            // Xử lý dữ liệu để thêm các trường UI
            const processedCategories = response.data.data.map((cat: Category) => ({
                ...cat,
                status: cat.isActive ? 'active' : 'inactive', // Chuyển đổi isActive thành status
                questionCount: 0 // Giá trị mặc định, có thể tính toán nếu cần
            }));
            setCategories(processedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                text: 'Quiz Count by Category',
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
                    name: 'Quiz Count',
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
                text: 'Quiz Distribution by Category',
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
                    name: 'Quiz Count',
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
            title: 'Are you sure you want to delete this category?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteCategory(record.id);
            }
        });
    };

    // Hàm xóa danh mục
    const deleteCategory = async (id: number) => {
        setLoading(true);
        try {
            await axiosInstance.delete(API_ENDPOINTS.CATEGORY(id));
            setCategories(categories.filter(cat => cat.id !== id));
            enqueueSnackbar('Category deleted successfully!', { variant: 'success' });
        } catch (error) {
            console.error('Error deleting category:', error);
            enqueueSnackbar('Failed to delete category', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi từ khóa tìm kiếm
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Xử lý làm mới dữ liệu
    const handleRefresh = () => {
        fetchCategories();
    };

    // Cấu hình các cột trong bảng
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.id - b.id,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.name.localeCompare(b.name),
            render: (text: string) => (
                <Text strong>{text}</Text>
            )
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Quizzes',
            dataIndex: 'quizCount',
            key: 'quizCount',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.quizCount - b.quizCount,
        },
        {
            title: 'Total Plays',
            dataIndex: 'totalPlayCount',
            key: 'totalPlayCount',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) => a.totalPlayCount - b.totalPlayCount,
        },
        {
            title: 'Created At',
            dataIndex: 'createAt',
            key: 'createAt',
            sorter: (a: CategoryWithUIData, b: CategoryWithUIData) =>
                new Date(a.createAt || '').getTime() - new Date(b.createAt || '').getTime(),
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (value: any, record: CategoryWithUIData) => record.isActive === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: CategoryWithUIData) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditCategory(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
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
                <Title level={2} className="m-0">Categories Management</Title>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCategory}
                    >
                        Add Category
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Các thẻ thống kê */}
            <div className="mb-6">
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title="Total Categories"
                                value={categories.length}
                                prefix={<Tag color="blue" className="mr-2">All</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title="Active Categories"
                                value={categories.filter(cat => cat.isActive).length}
                                prefix={<Tag color="green" className="mr-2">Active</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title="Total Quizzes"
                                value={categories.reduce((sum, cat) => sum + cat.quizCount, 0)}
                                prefix={<Tag color="orange" className="mr-2">Quizzes</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="h-full">
                            <Statistic
                                title="Total Plays"
                                value={categories.reduce((sum, cat) => sum + cat.totalPlayCount, 0)}
                                prefix={<Tag color="purple" className="mr-2">Plays</Tag>}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Slider các danh mục nổi bật */}
            <Card className="mb-6" title="Featured Categories">
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
                                                <Tag color="blue">{category.quizCount} Quizzes</Tag>
                                                <Tag color="blue">{category.totalPlayCount} Plays</Tag>
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
                title="Category Analytics"
                extra={
                    <Space>
                        <Button
                            type={chartView === 'bar' ? 'primary' : 'default'}
                            icon={<BarChartOutlined />}
                            onClick={() => setChartView('bar')}
                        >
                            Bar Chart
                        </Button>
                        <Button
                            type={chartView === 'pie' ? 'primary' : 'default'}
                            icon={<PieChartOutlined />}
                            onClick={() => setChartView('pie')}
                        >
                            Pie Chart
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
                title="All Categories"
                className="mb-6"
                loading={loading}
                extra={
                    <Space>
                        <Input
                            placeholder="Search categories"
                            prefix={<SearchOutlined />}
                            onChange={handleSearchChange}
                            value={searchText}
                            allowClear
                            className="w-60"
                        />
                        <Tooltip title="Export to Excel">
                            <Button icon={<FileExcelOutlined />} />
                        </Tooltip>
                        <Tooltip title="Export to PDF">
                            <Button icon={<FilePdfOutlined />} />
                        </Tooltip>
                    </Space>
                }
            >
                <Table
                    dataSource={filteredCategories}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />
            </Card>
        </div>
    );
}