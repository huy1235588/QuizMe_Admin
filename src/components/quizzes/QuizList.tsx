import React from 'react';
import { Card, Button, Table, Empty, Spin, Tooltip } from 'antd';
import { FiGrid, FiList } from 'react-icons/fi';
import { Quiz } from '@/types/database';
import QuizCard from './QuizCard';

// Interface định nghĩa các props cần thiết cho component QuizList
interface QuizListProps {
    quizzes: Quiz[];            // Mảng chứa dữ liệu các bài quiz
    loading: boolean;           // Trạng thái đang tải dữ liệu
    viewMode: 'grid' | 'list';  // Chế độ hiển thị: dạng lưới hoặc dạng danh sách
    isDarkMode: boolean;        // Chế độ theme tối hay sáng
    currentPage: number;        // Trang hiện tại đang hiển thị
    pageSize: number;           // Số lượng quiz hiển thị trên một trang
    totalQuizzes: number;       // Tổng số quiz có trong hệ thống
    onDelete: (id: number) => void;  // Hàm xử lý xóa quiz
    onViewModeChange: (mode: 'grid' | 'list') => void;  // Hàm xử lý thay đổi chế độ hiển thị
    onPageChange: (page: number) => void;  // Hàm xử lý khi thay đổi trang
    onPageSizeChange: (current: number, size: number) => void;  // Hàm xử lý khi thay đổi số lượng item trên trang
}

const QuizList: React.FC<QuizListProps> = ({
    quizzes,
    loading,
    viewMode,
    isDarkMode,
    currentPage,
    pageSize,
    totalQuizzes,
    onDelete,
    onViewModeChange,
    onPageChange,
    onPageSizeChange,
}) => {
    // Cấu hình các cột cho chế độ hiển thị dạng bảng
    const quizColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Quiz) => (
                // Hiển thị tiêu đề quiz kèm hình ảnh và mô tả ngắn
                <div className="flex items-center">
                    <div className="w-10 h-10 mr-3 rounded overflow-hidden">
                        <img
                            src={record.quizThumbnails || `https://placehold.co/100x100/${['3b82f6', '8b5cf6', 'ec4899'][['easy', 'medium', 'hard'].indexOf(record.difficulty)]}/ffffff?text=${record.title.charAt(0)}`}
                            alt={text}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="font-medium">{text}</div>
                        <div className="text-xs text-gray-500">{record.description.length > 50 ? record.description.substring(0, 50) + '...' : record.description}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'categoryName',
            key: 'categoryName',
            // Hiển thị danh mục với màu nền xanh
            render: (text: string) => <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{text}</span>,
        },
        {
            title: 'Difficulty',
            dataIndex: 'difficulty',
            key: 'difficulty',
            // Hiển thị độ khó với màu khác nhau tùy theo mức độ
            render: (text: string) => {
                const colors = {
                    easy: 'bg-green-100 text-green-800',
                    medium: 'bg-blue-100 text-blue-800',
                    hard: 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`${colors[text as keyof typeof colors]} text-xs font-medium px-2.5 py-0.5 rounded`}>
                        {text.charAt(0).toUpperCase() + text.slice(1)}
                    </span>
                );
            },
        },
        {
            title: 'Questions',
            dataIndex: 'questionCount',
            key: 'questionCount',
        },
        {
            title: 'Play Count',
            dataIndex: 'playCount',
            key: 'playCount',
        },
        {
            title: 'Status',
            dataIndex: 'isPublic',
            key: 'isPublic',
            // Hiển thị trạng thái công khai hoặc riêng tư
            render: (isPublic: boolean) => (
                <span className={`${isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-0.5 rounded`}>
                    {isPublic ? 'Public' : 'Private'}
                </span>
            ),
        }
    ];

    return (
        <Card
            title={<span className="font-bold">Quiz List</span>}
            variant='outlined'
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
            extra={
                // Nút chuyển đổi giữa chế độ lưới và danh sách
                <div className="flex items-center space-x-2">
                    <Tooltip title="Grid View">
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<FiGrid />}
                            onClick={() => onViewModeChange('grid')}
                            className={viewMode === 'grid' && isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                        />
                    </Tooltip>
                    <Tooltip title="List View">
                        <Button
                            type={viewMode === 'list' ? 'primary' : 'default'}
                            icon={<FiList />}
                            onClick={() => onViewModeChange('list')}
                            className={viewMode === 'list' && isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                        />
                    </Tooltip>
                </div>
            }
        >
            {loading ? (
                // Hiển thị trạng thái đang tải
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                </div>
            ) : quizzes.length === 0 ? (
                // Hiển thị khi không có dữ liệu
                <Empty description="No quizzes found" />
            ) : viewMode === 'grid' ? (
                // Hiển thị dạng lưới với các card
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="h-full">
                            <QuizCard quiz={quiz} onDelete={onDelete} isDarkMode={isDarkMode} />
                        </div>
                    ))}
                </div>
            ) : (
                // Hiển thị dạng bảng
                <Table
                    dataSource={quizzes}
                    columns={quizColumns}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalQuizzes,
                        onChange: onPageChange,
                        showSizeChanger: true,
                        onShowSizeChange: onPageSizeChange,
                        pageSizeOptions: ['12', '24', '36', '48'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            )}
        </Card>
    );
};

export default QuizList;