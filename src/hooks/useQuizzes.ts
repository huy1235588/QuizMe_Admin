import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Quiz,
    Category,
    QuizResponse,
    CategoryResponse,
    QuizFilterParams,
    QuizListResponse,
    ApiResponse,
    PaginatedResponse,
    CategoryListResponse
} from '@/types/database';
import axiosInstance from '@/utils/axios';

// Hook quản lý danh sách và trạng thái các bài quiz
export const useQuizzes = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const { enqueueSnackbar } = useSnackbar();

    // Quản lý state
    const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);  // Danh sách các quiz
    const [categories, setCategories] = useState<CategoryResponse[]>([]);  // Danh sách các danh mục
    const [loading, setLoading] = useState<boolean>(true);  // Trạng thái đang tải
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');  // Chế độ hiển thị: lưới hoặc danh sách
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);  // Danh mục được chọn
    const [searchQuery, setSearchQuery] = useState<string>('');  // Từ khóa tìm kiếm
    const [difficultyFilter, setDifficultyFilter] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);  // Bộ lọc độ khó
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');  // Thứ tự sắp xếp
    const [activeTab, setActiveTab] = useState<string>('all');  // Tab đang hoạt động
    const [currentPage, setCurrentPage] = useState<number>(0);  // Trang hiện tại (backend sử dụng 0-based indexing)
    const [pageSize, setPageSize] = useState<number>(12);  // Số lượng item mỗi trang
    const [totalQuizzes, setTotalQuizzes] = useState<number>(0);  // Tổng số quiz
    const [totalPages, setTotalPages] = useState<number>(1);  // Tổng số trang
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);  // Hiển thị modal xóa
    const [quizToDelete, setQuizToDelete] = useState<number | null>(null);  // ID quiz cần xóa
    const [trendingQuizzes, setTrendingQuizzes] = useState<QuizResponse[]>([]);  // Các quiz thịnh hành
    const [showOnlyPublic, setShowOnlyPublic] = useState<boolean>(false);  // Chỉ hiển thị quiz công khai

    // Tạo dữ liệu mẫu cho phát triển
    const generateSampleQuizzes = useCallback((count: number): QuizResponse[] => {
        const difficulties: ('EASY' | 'MEDIUM' | 'HARD')[] = ['EASY', 'MEDIUM', 'HARD'];
        const categoryNames = ['Science', 'History', 'Mathematics', 'Literature', 'Geography', 'Programming'];

        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            title: `Sample Quiz ${i + 1}: ${['Introduction to', 'Advanced', 'Mastering', 'Exploring', 'Ultimate'][i % 5]} ${categoryNames[i % categoryNames.length]}`,
            description: `This is a ${difficulties[i % 3].toLowerCase()} quiz about ${categoryNames[i % categoryNames.length].toLowerCase()}.`,
            quizThumbnails: `https://placehold.co/600x400/${['3b82f6', '8b5cf6', 'ec4899', '22c55e', 'eab308', '8b5cf6'][i % 6]}/ffffff?text=${categoryNames[i % categoryNames.length]}`,
            categoryId: (i % categoryNames.length) + 1,
            categoryName: categoryNames[i % categoryNames.length],
            creatorId: (i % 4) + 1,
            creatorName: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Emma Davis'][i % 4],
            difficulty: difficulties[i % 3],
            isPublic: i % 3 === 0,
            playCount: Math.floor(Math.random() * 500) + 10,
            questionCount: Math.floor(Math.random() * 30) + 5,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
        }));
    }, []);

    // Lấy danh sách quiz từ API
    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);

            // Trích xuất tham số truy vấn để dễ đọc
            const queryParams: QuizFilterParams = {
                page: currentPage,
                pageSize,
                category: selectedCategory || undefined,
                search: searchQuery || undefined,
                difficulty: difficultyFilter || undefined,
                sort: sortOrder,
                isPublic: showOnlyPublic || undefined,
                tab: activeTab !== 'all' ? (activeTab as 'newest' | 'popular') : undefined
            };

            // Trong ứng dụng thực tế, gọi API với các tham số truy vấn
            const response = await axiosInstance.get<ApiResponse<QuizListResponse>>('/api/quizzes', {
                params: queryParams
            });

            // Kiểm tra xem đã có dữ liệu thực tế chưa
            if (response.data?.data?.content) {
                const quizListResponse = response.data.data;
                setQuizzes(quizListResponse.content);
                setTotalQuizzes(quizListResponse.totalElements);
                setTotalPages(quizListResponse.totalPages);
            } else {
                // Sử dụng dữ liệu mẫu cho quá trình phát triển
                const sampleQuizzes = generateSampleQuizzes(100);

                // Mô phỏng phân trang
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedQuizzes = sampleQuizzes.slice(startIndex, endIndex);

                setQuizzes(paginatedQuizzes);
                setTotalQuizzes(sampleQuizzes.length);
                setTotalPages(Math.ceil(sampleQuizzes.length / pageSize));

                // Thiết lập một số quiz thịnh hành
                setTrendingQuizzes(sampleQuizzes
                    .sort((a, b) => b.playCount - a.playCount)
                    .slice(0, 5));
            }

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
            const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>('/api/categories');

            if (response.data?.data) {
                setCategories(response.data.data);
            }

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
            // Gọi API để xóa quiz
            await axiosInstance.delete<ApiResponse<null>>(`/api/quizzes/${quizToDelete}`);

            // Cập nhật state để loại bỏ quiz đã xóa
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
            easy: quizzes.filter(q => q.difficulty === 'EASY').length,
            medium: quizzes.filter(q => q.difficulty === 'MEDIUM').length,
            hard: quizzes.filter(q => q.difficulty === 'HARD').length
        };

        // Tính số quiz được tạo gần đây (30 ngày qua)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentQuizzes = quizzes.filter(quiz => {
            const createdAt = new Date(quiz.createdAt || '');
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
        setCurrentPage(0); // Quay lại trang đầu tiên khi tìm kiếm mới
    }, []);

    const handleCategoryChange = useCallback((value: number | null) => {
        setSelectedCategory(value);
        setCurrentPage(0);
    }, []);

    const handleDifficultyChange = useCallback((value: 'EASY' | 'MEDIUM' | 'HARD' | null) => {
        setDifficultyFilter(value);
        setCurrentPage(0);
    }, []);

    const handleSortChange = useCallback((value: 'newest' | 'popular') => {
        setSortOrder(value);
    }, []);

    const handleTabChange = useCallback((key: string) => {
        setActiveTab(key);
        setCurrentPage(0);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        // API sử dụng 0-based indexing cho trang
        setCurrentPage(page - 1);
    }, []);

    const handlePageSizeChange = useCallback((current: number, size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    }, []);

    const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
    }, []);

    const handlePublicFilterChange = useCallback((checked: boolean) => {
        setShowOnlyPublic(checked);
        setCurrentPage(0);
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
        totalPages,
        statistics,
        isDarkMode,

        // Trạng thái UI
        loading,
        viewMode,
        currentPage: currentPage + 1, // Convert to 1-based for UI display
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