import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@/contexts/ThemeContext';
import { Quiz, Category } from '@/types/database';
import axiosInstance from '@/utils/axios';

// Hook quản lý danh sách và trạng thái các bài quiz
export const useQuizzes = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const { enqueueSnackbar } = useSnackbar();

    // Quản lý state
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);  // Danh sách các quiz
    const [categories, setCategories] = useState<Category[]>([]);  // Danh sách các danh mục
    const [loading, setLoading] = useState<boolean>(true);  // Trạng thái đang tải
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');  // Chế độ hiển thị: lưới hoặc danh sách
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);  // Danh mục được chọn
    const [searchQuery, setSearchQuery] = useState<string>('');  // Từ khóa tìm kiếm
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);  // Bộ lọc độ khó
    const [sortOrder, setSortOrder] = useState<string>('newest');  // Thứ tự sắp xếp
    const [activeTab, setActiveTab] = useState<string>('all');  // Tab đang hoạt động
    const [currentPage, setCurrentPage] = useState<number>(1);  // Trang hiện tại
    const [pageSize, setPageSize] = useState<number>(12);  // Số lượng item mỗi trang
    const [totalQuizzes, setTotalQuizzes] = useState<number>(0);  // Tổng số quiz
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);  // Hiển thị modal xóa
    const [quizToDelete, setQuizToDelete] = useState<number | null>(null);  // ID quiz cần xóa
    const [trendingQuizzes, setTrendingQuizzes] = useState<Quiz[]>([]);  // Các quiz thịnh hành
    const [showOnlyPublic, setShowOnlyPublic] = useState<boolean>(false);  // Chỉ hiển thị quiz công khai

    // Tạo dữ liệu mẫu cho phát triển
    const generateSampleQuizzes = useCallback((count: number): Quiz[] => {
        const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const categoryNames = ['Science', 'History', 'Mathematics', 'Literature', 'Geography', 'Programming'];

        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            title: `Sample Quiz ${i + 1}: ${['Introduction to', 'Advanced', 'Mastering', 'Exploring', 'Ultimate'][i % 5]} ${categoryNames[i % categoryNames.length]}`,
            description: `This is a ${difficulties[i % 3]} quiz about ${categoryNames[i % categoryNames.length].toLowerCase()}.`,
            quizThumbnails: `https://placehold.co/600x400/${['3b82f6', '8b5cf6', 'ec4899', '22c55e', 'eab308', '8b5cf6'][i % 6]}/ffffff?text=${categoryNames[i % categoryNames.length]}`,
            categoryId: (i % categoryNames.length) + 1,
            categoryName: categoryNames[i % categoryNames.length],
            createName: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Emma Davis'][i % 4],
            creatorId: (i % 4) + 1,
            difficulty: difficulties[i % 3],
            isPublic: i % 3 === 0,
            playCount: Math.floor(Math.random() * 500) + 10,
            questionCount: Math.floor(Math.random() * 30) + 5,
            createAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
        }));
    }, []);

    // Lấy danh sách quiz từ API
    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);

            // Trích xuất tham số truy vấn để dễ đọc
            const queryParams = {
                page: currentPage,
                pageSize,
                category: selectedCategory,
                search: searchQuery,
                difficulty: difficultyFilter,
                sort: sortOrder,
                isPublic: showOnlyPublic ? true : undefined,
                tab: activeTab !== 'all' ? activeTab : undefined
            };

            // Trong ứng dụng thực tế, gọi API với các tham số truy vấn
            const response = await axiosInstance.get('/api/quizzes', { params: queryParams });

            // Hiện tại, sử dụng dữ liệu mẫu
            const quizzesData: Quiz[] = response.data.data || generateSampleQuizzes(100); // Giả lập 100 quiz

            setQuizzes(quizzesData);
            setTotalQuizzes(quizzesData.length);

            // Thiết lập một số quiz thịnh hành
            setTrendingQuizzes(quizzesData
                .sort((a, b) => b.playCount - a.playCount)
                .slice(0, 5));

        } catch (err) {
            console.error('Error fetching quizzes:', err);
            enqueueSnackbar('Failed to load quizzes', { variant: 'error' });
            setQuizzes([]);
            setTotalQuizzes(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, selectedCategory, searchQuery, difficultyFilter, sortOrder, activeTab, showOnlyPublic, generateSampleQuizzes, enqueueSnackbar]);

    // Lấy danh sách danh mục từ API
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axiosInstance.get<{ data: Category[] }>('/api/categories');

            setCategories(response.data.data);

        } catch (err) {
            console.error('Error fetching categories:', err);
            enqueueSnackbar('Failed to load categories', { variant: 'error' });
            setCategories([]);
        }
    }, [enqueueSnackbar]);

    // Xử lý việc xóa quiz
    const handleDeleteQuiz = useCallback((quizId: number) => {
        setQuizToDelete(quizId);
        setIsDeleteModalVisible(true);
    }, []);

    // Xác nhận xóa quiz
    const confirmDeleteQuiz = useCallback(async () => {
        if (!quizToDelete) return;

        try {
            // Trong ứng dụng thực tế, gọi API để xóa quiz
            // await axiosInstance.delete(`/api/quizzes/${quizToDelete}`);

            // Hiện tại, chỉ lọc ra quiz khỏi state
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizToDelete));
            enqueueSnackbar('Quiz deleted successfully', { variant: 'success' });
        } catch (err) {
            console.error('Error deleting quiz:', err);
            enqueueSnackbar('Failed to delete quiz', { variant: 'error' });
        } finally {
            setIsDeleteModalVisible(false);
            setQuizToDelete(null);
        }
    }, [quizToDelete, enqueueSnackbar]);

    // Tính toán thống kê dựa trên dữ liệu quizzes
    const statistics = useMemo(() => {
        // Tính tổng số lượt chơi
        const totalPlays = quizzes.reduce((sum, quiz) => sum + quiz.playCount, 0);

        // Tính phân bố độ khó
        const difficultyDistribution = {
            easy: quizzes.filter(q => q.difficulty === 'easy').length,
            medium: quizzes.filter(q => q.difficulty === 'medium').length,
            hard: quizzes.filter(q => q.difficulty === 'hard').length
        };

        // Tính số quiz được tạo gần đây (30 ngày qua)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentQuizzes = quizzes.filter(quiz => {
            const createdAt = new Date(quiz.createAt || '');
            return createdAt > thirtyDaysAgo;
        }).length;

        // Tính số quiz đã công khai
        const publishedQuizzes = quizzes.filter(quiz => quiz.isPublic).length;

        return {
            totalPlays,
            difficultyDistribution,
            recentQuizzes,
            publishedQuizzes
        };
    }, [quizzes]);

    // Các hàm xử lý sự kiện
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Quay lại trang đầu tiên khi tìm kiếm mới
    }, []);

    const handleCategoryChange = useCallback((value: number | null) => {
        setSelectedCategory(value);
        setCurrentPage(1);
    }, []);

    const handleDifficultyChange = useCallback((value: string | null) => {
        setDifficultyFilter(value);
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((value: string) => {
        setSortOrder(value);
    }, []);

    const handleTabChange = useCallback((key: string) => {
        setActiveTab(key);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((current: number, size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    }, []);

    const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
    }, []);

    const handlePublicFilterChange = useCallback((checked: boolean) => {
        setShowOnlyPublic(checked);
        setCurrentPage(1);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalVisible(false);
        setQuizToDelete(null);
    }, []);

    // Lấy dữ liệu khi component được mount và khi bộ lọc thay đổi
    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
    }, [fetchQuizzes, fetchCategories]);

    return {
        // Dữ liệu
        quizzes,
        categories,
        trendingQuizzes,
        totalQuizzes,
        statistics,
        isDarkMode,

        // Trạng thái UI
        loading,
        viewMode,
        currentPage,
        pageSize,
        selectedCategory,
        searchQuery,
        difficultyFilter,
        sortOrder,
        activeTab,
        showOnlyPublic,
        isDeleteModalVisible,
        quizToDelete,

        // Các hàm xử lý
        handleSearch,
        handleCategoryChange,
        handleDifficultyChange,
        handleSortChange,
        handleTabChange,
        handlePageChange,
        handlePageSizeChange,
        handleViewModeChange,
        handlePublicFilterChange,
        handleDeleteQuiz,
        confirmDeleteQuiz,
        handleCancelDelete,
    };
};