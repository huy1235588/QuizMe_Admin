"use client";

// Import các thư viện React và các components từ Ant Design và các thư viện khác
import React from 'react';
import { Typography, Button } from 'antd';
import { FiPlus } from 'react-icons/fi';
import { useSnackbar } from 'notistack';

// Import các component tùy chỉnh cho trang quiz
import QuizStatistics from '@/components/quizzes/QuizStatistics';
import TrendingQuizzes from '@/components/quizzes/TrendingQuizzes';
import QuizFilters from '@/components/quizzes/QuizFilters';
import QuizList from '@/components/quizzes/QuizList';
import DeleteQuizModal from '@/components/quizzes/DeleteQuizModal';

// Import hook tùy chỉnh để quản lý các quiz
import { useQuizzes } from '@/hooks/useQuizzes';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

// Component chính để quản lý trang Quizzes
export default function Quizzes() {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    // Sử dụng hook tùy chỉnh để quản lý tất cả dữ liệu và chức năng liên quan đến quiz
    const {
        // Dữ liệu
        quizzes,               // Danh sách các quiz
        categories,            // Danh sách các danh mục
        trendingQuizzes,       // Danh sách các quiz thịnh hành
        totalQuizzes,          // Tổng số quiz
        statistics,            // Thống kê về quiz
        isDarkMode,            // Chế độ tối hay sáng

        // Trạng thái UI
        loading,               // Đang tải dữ liệu
        viewMode,              // Chế độ xem (grid/list)
        currentPage,           // Trang hiện tại
        pageSize,              // Số lượng quiz mỗi trang
        selectedCategory,      // Danh mục được chọn
        searchQuery,           // Từ khóa tìm kiếm
        difficultyFilter,      // Bộ lọc độ khó
        sortOrder,             // Thứ tự sắp xếp
        activeTab,             // Tab đang active
        showOnlyPublic,        // Chỉ hiển thị quiz công khai
        isDeleteModalVisible,  // Hiển thị modal xóa

        // Các hàm xử lý sự kiện
        handleSearch,           // Xử lý tìm kiếm
        handleCategoryChange,   // Xử lý thay đổi danh mục
        handleDifficultyChange, // Xử lý thay đổi độ khó
        handleSortChange,       // Xử lý thay đổi sắp xếp
        handleTabChange,        // Xử lý thay đổi tab
        handlePageChange,       // Xử lý thay đổi trang
        handlePageSizeChange,   // Xử lý thay đổi số lượng mỗi trang
        handleViewModeChange,   // Xử lý thay đổi chế độ xem
        handlePublicFilterChange, // Xử lý thay đổi bộ lọc công khai
        handleDeleteQuiz,       // Xử lý xóa quiz
        confirmDeleteQuiz,      // Xác nhận xóa quiz
        handleCancelDelete,     // Hủy xóa quiz
    } = useQuizzes();

    return (
        <div className="space-y-6 pb-10">
            {/* Tiêu đề và nút tạo mới */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <Title level={4} className="m-0">Quiz Management</Title>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<FiPlus />}
                    onClick={() => router.push('/quizzes/new')}
                    className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}`}
                >
                    Create New Quiz
                </Button>
            </div>

            {/* Component hiển thị thống kê của quiz */}
            <QuizStatistics
                isDarkMode={isDarkMode}
                totalQuizzes={totalQuizzes}
                publishedQuizzes={statistics.publishedQuizzes}
                recentQuizzes={statistics.recentQuizzes}
                totalPlays={statistics.totalPlays}
                categories={categories}
                difficultyDistribution={statistics.difficultyDistribution}
            />

            {/* Component hiển thị các quiz thịnh hành */}
            <TrendingQuizzes
                quizzes={trendingQuizzes}
                isDarkMode={isDarkMode}
            />

            {/* Component bộ lọc quiz */}
            <QuizFilters
                categories={categories}
                totalQuizzes={totalQuizzes}
                isDarkMode={isDarkMode}
                activeTab={activeTab}
                showOnlyPublic={showOnlyPublic}
                selectedCategory={selectedCategory}
                difficultyFilter={difficultyFilter}
                sortOrder={sortOrder}
                onSearch={handleSearch}
                onCategoryChange={handleCategoryChange}
                onDifficultyChange={handleDifficultyChange}
                onSortChange={handleSortChange}
                onTabChange={handleTabChange}
                onPublicFilterChange={handlePublicFilterChange}
            />

            {/* Component hiển thị danh sách quiz */}
            <QuizList
                quizzes={quizzes}
                loading={loading}
                viewMode={viewMode}
                isDarkMode={isDarkMode}
                currentPage={currentPage}
                pageSize={pageSize}
                totalQuizzes={totalQuizzes}
                onDelete={handleDeleteQuiz}
                onViewModeChange={handleViewModeChange}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />

            {/* Component modal xác nhận xóa quiz */}
            <DeleteQuizModal
                visible={isDeleteModalVisible}
                onCancel={handleCancelDelete}
                onConfirm={confirmDeleteQuiz}
            />
        </div>
    );
}
