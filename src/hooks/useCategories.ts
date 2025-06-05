import { useState, useCallback, useEffect } from 'react';
import { categoryService } from '@/services';
import { CategoryResponse, CategoryRequest, ApiResponse } from '@/types/database';

interface UseCategoriesReturn {
    // State
    categories: CategoryResponse[];
    activeCategories: CategoryResponse[];
    isLoading: boolean;
    error: string | null;

    // Methods
    fetchAllCategories: () => Promise<CategoryResponse[] | null>;
    fetchActiveCategories: () => Promise<CategoryResponse[] | null>;
    createCategory: (categoryRequest: CategoryRequest) => Promise<CategoryResponse | null>;
    updateCategory: (id: number, categoryRequest: CategoryRequest) => Promise<CategoryResponse | null>;
    deleteCategory: (id: number) => Promise<boolean>;
    clearError: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [activeCategories, setActiveCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []); 
    
    const fetchAllCategories = useCallback(async (): Promise<CategoryResponse[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.getAllCategories();

            if (response.status === 'success' && response.data) {
                setCategories(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch categories');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching categories');
            console.error('Error fetching categories:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchActiveCategories = useCallback(async (): Promise<CategoryResponse[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.getActiveCategories();

            if (response.status === 'success' && response.data) {
                setActiveCategories(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch active categories');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching active categories');
            console.error('Error fetching active categories:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (categoryRequest: CategoryRequest): Promise<CategoryResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.createCategory(categoryRequest);

            if (response.status === 'success' && response.data) {
                // Refresh categories list
                await fetchAllCategories();
                return response.data;
            } else {
                setError(response.message || 'Failed to create category');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Error creating category');
            console.error('Error creating category:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [fetchAllCategories]);

    const updateCategory = useCallback(async (id: number, categoryRequest: CategoryRequest): Promise<CategoryResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.updateCategory(id, categoryRequest);

            if (response.status === 'success' && response.data) {
                // Refresh categories list
                await fetchAllCategories();
                return response.data;
            } else {
                setError(response.message || 'Failed to update category');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Error updating category');
            console.error('Error updating category:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [fetchAllCategories]); const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.deleteCategory(id);

            if (response.status === 'success') {
                // Refresh categories list
                await fetchAllCategories();
                return true;
            } else {
                setError(response.message || 'Failed to delete category');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Error deleting category');
            console.error('Error deleting category:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchAllCategories]);

    return {
        // State
        categories,
        activeCategories,
        isLoading,
        error,

        // Methods
        fetchAllCategories,
        fetchActiveCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError,
    };
};

interface UseCategoryReturn {
    // State
    category: CategoryResponse | null;
    isLoading: boolean;
    error: string | null;

    // Methods
    fetchCategory: (categoryId: number) => Promise<CategoryResponse | null>;
    clearError: () => void;
}

export const useCategory = (id: number | null): UseCategoryReturn => {
    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []); const fetchCategory = useCallback(async (categoryId: number): Promise<CategoryResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.getCategoryById(categoryId);

            if (response.status === 'success' && response.data) {
                setCategory(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch category');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching category');
            console.error('Error fetching category:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);// Auto-fetch when id changes
    useEffect(() => {
        if (id) {
            fetchCategory(id);
        }
    }, [id, fetchCategory]);

    return {
        // State
        category,
        isLoading,
        error,

        // Methods
        fetchCategory,
        clearError,
    };
};

export default useCategories;
