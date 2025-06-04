// Import các thư viện và component cần thiết
import React from 'react';
import { Input, Select, Tabs, Typography, Card, Switch } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { Category } from '@/types/database';
import { useTranslations } from 'next-intl';

// Khởi tạo các component từ thư viện Ant Design
const { Search } = Input;
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
    sortOrder: 'newest' | 'popular'; // Thứ tự sắp xếp
    onSearch: (value: string) => void; // Hàm xử lý tìm kiếm
    onCategoryChange: (value: number | null) => void; // Hàm xử lý khi thay đổi danh mục
    onDifficultyChange: (value: 'EASY' | 'MEDIUM' | 'HARD' | null) => void; // Hàm xử lý khi thay đổi độ khó
    onSortChange: (value: 'newest' | 'popular') => void; // Hàm xử lý khi thay đổi cách sắp xếp
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
    const t = useTranslations('quizzes');

    return (
        <Card
            title={<span className="font-bold">{t('allQuizzes')}</span>}
            variant='outlined'
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
        >
            {/* Phần tìm kiếm và bộ lọc */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Ô tìm kiếm */}
                <div className="flex-grow">
                    <Search
                        placeholder={t('searchQuizzesPlaceholder')}
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
                        placeholder={t('categoryPlaceholder')}
                        className="min-w-[120px]"
                        allowClear
                        value={selectedCategory === null ? 'all' : selectedCategory}
                        onChange={(value) => onCategoryChange(value === 'all' ? null : value as number)}
                        options={[
                            { value: 'all', label: t('allCategories') },
                            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                        ]}
                    />

                    {/* Bộ lọc theo độ khó */}
                    <Select
                        placeholder={t('difficultyPlaceholder')}
                        className="min-w-[120px]"
                        allowClear
                        value={difficultyFilter === null ? 'all' : difficultyFilter}
                        onChange={(value) => onDifficultyChange(value === 'all' ? null : value as 'EASY' | 'MEDIUM' | 'HARD')}
                        options={[
                            { value: 'all', label: t('allDifficulties') },
                            { value: 'easy', label: t('easyDifficulty') },
                            { value: 'medium', label: t('mediumDifficulty') },
                            { value: 'hard', label: t('hardDifficulty') }
                        ]}
                    />

                    {/* Bộ lọc sắp xếp */}
                    <Select
                        placeholder={t('sortByPlaceholder')}
                        className="min-w-[120px]"
                        value={sortOrder}
                        onChange={onSortChange}
                        options={[
                            { value: 'newest', label: t('sortNewest') },
                            { value: 'oldest', label: t('sortOldest') },
                            { value: 'mostPlayed', label: t('sortMostPlayed') },
                            { value: 'alphAsc', label: t('sortAlphaAsc') },
                            { value: 'alphDesc', label: t('sortAlphaDesc') }
                        ]}
                    />
                </div>
            </div>

            {/* Phần tabs */}
            <div className="mb-4">
                <Tabs
                    activeKey={activeTab}
                    onChange={onTabChange}
                    items={[
                        { key: 'all', label: t('allQuizzes') }, // Tất cả các quiz
                        { key: 'my', label: t('myQuizzes') },   // Quiz của tôi
                        { key: 'favorites', label: t('favoriteQuizzes') }, // Quiz yêu thích
                        { key: 'recent', label: t('recentlyViewedQuizzes') } // Quiz đã xem gần đây
                    ]}
                />
            </div>

            {/* Phần hiển thị thông tin tổng quan và bộ lọc công khai */}
            <div className="flex justify-between items-center mb-4">
                {/* Hiển thị số lượng quiz tìm thấy */}
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {totalQuizzes} {t('quizzesFound')}
                </Text>
                {/* Công tắc chỉ hiển thị quiz công khai */}
                <div className="flex items-center">
                    <span className="mr-2">{t('publicOnly')}</span>
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