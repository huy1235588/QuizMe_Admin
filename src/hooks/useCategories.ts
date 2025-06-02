import { useState, useEffect } from 'react';
import { categoryService } from '@/services';
import { CategoryResponse, CategoryRequest } from '@/types/database';

/**
 * Custom hook để quản lý categories
 */
export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [activeCategories, setActiveCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Lấy tất cả categories
     */
    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getAllCategories();
            if (response.success) {
                setCategories(response.data);
            } else {
                setError(response.message || 'Failed to fetch categories');
            }
        } catch (err) {
            setError('Error fetching categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Lấy active categories
     */
    const fetchActiveCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getActiveCategories();
            if (response.success) {
                setActiveCategories(response.data);
            } else {
                setError(response.message || 'Failed to fetch active categories');
            }
        } catch (err) {
            setError('Error fetching active categories');
            console.error('Error fetching active categories:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Tạo category mới
     */
    const createCategory = async (categoryRequest: CategoryRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.createCategory(categoryRequest);
            if (response.success) {
                // Refresh categories list
                await fetchAllCategories();
                return response.data;
            } else {
                setError(response.message || 'Failed to create category');
                throw new Error(response.message || 'Failed to create category');
            }
        } catch (err) {
            setError('Error creating category');
            console.error('Error creating category:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cập nhật category
     */
    const updateCategory = async (id: number, categoryRequest: CategoryRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.updateCategory(id, categoryRequest);
            if (response.success) {
                // Refresh categories list
                await fetchAllCategories();
                return response.data;
            } else {
                setError(response.message || 'Failed to update category');
                throw new Error(response.message || 'Failed to update category');
            }
        } catch (err) {
            setError('Error updating category');
            console.error('Error updating category:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Xóa category
     */
    const deleteCategory = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.deleteCategory(id);
            if (response.success) {
                // Refresh categories list
                await fetchAllCategories();
                return true;
            } else {
                setError(response.message || 'Failed to delete category');
                throw new Error(response.message || 'Failed to delete category');
            }
        } catch (err) {
            setError('Error deleting category');
            console.error('Error deleting category:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        activeCategories,
        loading,
        error,
        fetchAllCategories,
        fetchActiveCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        setError, // Để clear error từ component
    };
};

/**
 * Custom hook để lấy một category cụ thể theo ID
 */
export const useCategory = (id: number | null) => {
    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategory = async (categoryId: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getCategoryById(categoryId);
            if (response.success) {
                setCategory(response.data);
            } else {
                setError(response.message || 'Failed to fetch category');
            }
        } catch (err) {
            setError('Error fetching category');
            console.error('Error fetching category:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCategory(id);
        }
    }, [id]);

    return {
        category,
        loading,
        error,
        fetchCategory,
        setError,
    };
};
