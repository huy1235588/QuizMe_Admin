import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@/contexts/ThemeContext';
import { QuizAPI } from '@/api/quizAPI';
import { categoryService } from '@/services';
import {
    Quiz,
    Category,
    QuizFilterParams,
    ApiResponse,
    PageResponse
} from '@/types/database';

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
    const [difficultyFilter, setDifficultyFilter] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);  // Bộ lọc độ khó
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');  // Thứ tự sắp xếp
    const [activeTab, setActiveTab] = useState<string>('all');  // Tab đang hoạt động
    const [currentPage, setCurrentPage] = useState<number>(0);  // Trang hiện tại (backend sử dụng 0-based indexing)
    const [pageSize, setPageSize] = useState<number>(12);  // Số lượng item mỗi trang
    const [totalQuizzes, setTotalQuizzes] = useState<number>(0);  // Tổng số quiz
    const [totalPages, setTotalPages] = useState<number>(1);  // Tổng số trang
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);  // Hiển thị modal xóa
    const [quizToDelete, setQuizToDelete] = useState<number | null>(null);  // ID quiz cần xóa
    const [trendingQuizzes, setTrendingQuizzes] = useState<Quiz[]>([]);  // Các quiz thịnh hành
    const [showOnlyPublic, setShowOnlyPublic] = useState<boolean>(false);  // Chỉ hiển thị quiz công khai    // Tạo dữ liệu mẫu cho phát triển

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

            // Sử dụng QuizAPI để lấy dữ liệu theo phân trang
            const response = await QuizAPI.getPagedQuizzes(queryParams);

            // Kiểm tra xem có dữ liệu thực tế không
            if (response.status === 'success' && response.data?.content) {
                const pageData = response.data;
                setQuizzes(pageData.content);
                setTotalQuizzes(pageData.totalElements);
                setTotalPages(pageData.totalPages);

                // Lấy trending quizzes riêng biệt
                const trendingResponse = await QuizAPI.getPopularQuizzes(0, 5);
                if (trendingResponse.status === 'success' && trendingResponse.data?.content) {
                    setTrendingQuizzes(trendingResponse.data.content);
                }
            }

        } catch (err) {
            console.error('Error fetching quizzes:', err);
            enqueueSnackbar('Failed to load quizzes', { variant: 'error' });
            setQuizzes([]);
            setTotalQuizzes(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, selectedCategory, searchQuery, difficultyFilter, sortOrder, activeTab, showOnlyPublic, enqueueSnackbar]);    // Lấy danh sách danh mục từ API
    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryService.getAllCategories();

            if (response.status === 'success' && response.data) {
                setCategories(response.data);
            } else {
                throw new Error(response.message || 'Failed to load categories');
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
            // Sử dụng QuizAPI để xóa quiz
            const response = await QuizAPI.deleteQuiz(quizToDelete);

            if (response.status === 'success') {
                // Cập nhật state để loại bỏ quiz đã xóa
                setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizToDelete));
                enqueueSnackbar('Quiz deleted successfully', { variant: 'success' });
            } else {
                throw new Error(response.message || 'Failed to delete quiz');
            }
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
    }, []); const handleCancelDelete = useCallback(() => {
        setIsDeleteModalVisible(false);
        setQuizToDelete(null);
    }, []);

    // Thêm các utility functions sử dụng QuizAPI
    const refreshQuizzes = useCallback(async () => {
        await fetchQuizzes();
    }, [fetchQuizzes]);

    const getQuizById = useCallback(async (id: number) => {
        try {
            const response = await QuizAPI.getQuizById(id);
            return response;
        } catch (error) {
            console.error('Error fetching quiz by ID:', error);
            enqueueSnackbar('Failed to load quiz details', { variant: 'error' });
            throw error;
        }
    }, [enqueueSnackbar]);

    const createQuiz = useCallback(async (quizData: any) => {
        try {
            const response = await QuizAPI.createQuizFromRequest(quizData);
            if (response.status === 'success') {
                enqueueSnackbar('Quiz created successfully', { variant: 'success' });
                // Refresh the quiz list
                await fetchQuizzes();
                return response;
            } else {
                throw new Error(response.message || 'Failed to create quiz');
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            enqueueSnackbar('Failed to create quiz', { variant: 'error' });
            throw error;
        }
    }, [enqueueSnackbar, fetchQuizzes]);

    const updateQuiz = useCallback(async (id: number, quizData: any) => {
        try {
            const response = await QuizAPI.updateQuizFromRequest(id, quizData);
            if (response.status === 'success') {
                enqueueSnackbar('Quiz updated successfully', { variant: 'success' });
                // Refresh the quiz list
                await fetchQuizzes();
                return response;
            } else {
                throw new Error(response.message || 'Failed to update quiz');
            }
        } catch (error) {
            console.error('Error updating quiz:', error);
            enqueueSnackbar('Failed to update quiz', { variant: 'error' });
            throw error;
        }
    }, [enqueueSnackbar, fetchQuizzes]);

    const toggleQuizPublicStatus = useCallback(async (id: number) => {
        try {
            const response = await QuizAPI.toggleQuizPublicStatus(id);
            if (response.status === 'success') {
                enqueueSnackbar('Quiz status updated successfully', { variant: 'success' });
                // Refresh the quiz list
                await fetchQuizzes();
                return response;
            } else {
                throw new Error(response.message || 'Failed to update quiz status');
            }
        } catch (error) {
            console.error('Error toggling quiz status:', error);
            enqueueSnackbar('Failed to update quiz status', { variant: 'error' });
            throw error;
        }
    }, [enqueueSnackbar, fetchQuizzes]);

    const duplicateQuiz = useCallback(async (id: number, newTitle?: string) => {
        try {
            const response = await QuizAPI.duplicateQuiz(id, newTitle);
            if (response.status === 'success') {
                enqueueSnackbar('Quiz duplicated successfully', { variant: 'success' });
                // Refresh the quiz list
                await fetchQuizzes();
                return response;
            } else {
                throw new Error(response.message || 'Failed to duplicate quiz');
            }
        } catch (error) {
            console.error('Error duplicating quiz:', error);
            enqueueSnackbar('Failed to duplicate quiz', { variant: 'error' });
            throw error;
        }
    }, [enqueueSnackbar, fetchQuizzes]);

    // Lấy dữ liệu khi component được mount và khi bộ lọc thay đổi
    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
    }, [fetchQuizzes, fetchCategories]); return {
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

        // Các hàm xử lý UI
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

        // API utility functions
        refreshQuizzes,
        getQuizById,
        createQuiz,
        updateQuiz,
        toggleQuizPublicStatus,
        duplicateQuiz,
    };
};