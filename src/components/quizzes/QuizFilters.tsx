// Import các thư viện và component cần thiết
import React from 'react';
import { Input, Select, Tabs, Typography, Card, Switch } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { Category } from '@/types/database';

// Khởi tạo các component từ thư viện Ant Design
const { Search } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;

// Định nghĩa interface cho props của component QuizFilters
interface QuizFiltersProps {
    categories: Category[]; // Danh sách các danh mục
    totalQuizzes: number; // Tổng số lượng quiz
    isDarkMode: boolean; // Chế độ tối/sáng
    activeTab: string; // Tab đang được chọn
    showOnlyPublic: boolean; // Hiển thị chỉ các quiz công khai
    selectedCategory: number | null; // Danh mục được chọn
    difficultyFilter: string | null; // Bộ lọc độ khó
    sortOrder: string; // Thứ tự sắp xếp
    onSearch: (value: string) => void; // Hàm xử lý tìm kiếm
    onCategoryChange: (value: number | null) => void; // Hàm xử lý khi thay đổi danh mục
    onDifficultyChange: (value: string | null) => void; // Hàm xử lý khi thay đổi độ khó
    onSortChange: (value: string) => void; // Hàm xử lý khi thay đổi cách sắp xếp
    onTabChange: (key: string) => void; // Hàm xử lý khi chuyển tab
    onPublicFilterChange: (checked: boolean) => void; // Hàm xử lý khi thay đổi bộ lọc công khai
}

// Component QuizFilters chứa các bộ lọc cho danh sách quiz
const QuizFilters: React.FC<QuizFiltersProps> = ({
    categories,
    totalQuizzes,
    isDarkMode,
    activeTab,
    showOnlyPublic,
    selectedCategory,
    difficultyFilter,
    sortOrder,
    onSearch,
    onCategoryChange,
    onDifficultyChange,
    onSortChange,
    onTabChange,
    onPublicFilterChange,
}) => {
    return (
        <Card
            title={<span className="font-bold">All Quizzes</span>}
            variant='outlined'
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
        >
            {/* Phần tìm kiếm và bộ lọc */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Ô tìm kiếm */}
                <div className="flex-grow">
                    <Search
                        placeholder="Search quizzes..."
                        allowClear
                        enterButton={<FiSearch />}
                        size="large"
                        onSearch={onSearch}
                    />
                </div>
                {/* Các bộ lọc */}
                <div className="flex gap-2 flex-wrap">
                    {/* Bộ lọc theo danh mục */}
                    <Select
                        placeholder="Category"
                        className="min-w-[120px]"
                        allowClear
                        value={selectedCategory}
                        onChange={onCategoryChange}
                        options={[
                            { value: null, label: 'All Categories' },
                            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                        ]}
                    />
                    {/* Bộ lọc theo độ khó */}
                    <Select
                        placeholder="Difficulty"
                        className="min-w-[120px]"
                        allowClear
                        value={difficultyFilter}
                        onChange={onDifficultyChange}
                        options={[
                            { value: null, label: 'All Difficulties' },
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' }
                        ]}
                    />
                    {/* Bộ lọc sắp xếp */}
                    <Select
                        placeholder="Sort By"
                        className="min-w-[120px]"
                        value={sortOrder}
                        onChange={onSortChange}
                        options={[
                            { value: 'newest', label: 'Newest' },
                            { value: 'oldest', label: 'Oldest' },
                            { value: 'mostPlayed', label: 'Most Played' },
                            { value: 'alphAsc', label: 'A-Z' },
                            { value: 'alphDesc', label: 'Z-A' }
                        ]}
                    />
                </div>
            </div>

            {/* Phần tabs */}
            <div className="mb-4">
                <Tabs activeKey={activeTab} onChange={onTabChange}>
                    <TabPane tab="All Quizzes" key="all" /> {/* Tất cả các quiz */}
                    <TabPane tab="My Quizzes" key="my" /> {/* Quiz của tôi */}
                    <TabPane tab="Favorites" key="favorites" /> {/* Quiz yêu thích */}
                    <TabPane tab="Recently Viewed" key="recent" /> {/* Quiz đã xem gần đây */}
                </Tabs>
            </div>

            {/* Phần hiển thị thông tin tổng quan và bộ lọc công khai */}
            <div className="flex justify-between items-center mb-4">
                {/* Hiển thị số lượng quiz tìm thấy */}
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {totalQuizzes} quizzes found
                </Text>
                {/* Công tắc chỉ hiển thị quiz công khai */}
                <div className="flex items-center">
                    <span className="mr-2">Public Only</span>
                    <Switch
                        checked={showOnlyPublic}
                        onChange={onPublicFilterChange}
                        className={showOnlyPublic ? "bg-blue-500" : ""}
                    />
                </div>
            </div>
        </Card>
    );
};

export default QuizFilters;