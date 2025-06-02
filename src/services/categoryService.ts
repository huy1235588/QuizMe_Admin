import axiosInstance from '@/utils/axios';
import { CATEGORY_ENDPOINTS } from '@/constants/apiEndpoints';
import { CategoryRequest, CategoryResponse, ApiResponse } from '@/types/database';

/**
 * Category Service
 * Các service để gọi API liên quan đến Category
 */
class CategoryService {
    /**
     * Lấy danh sách tất cả các danh mục
     * GET /api/categories
     */
    async getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>(
                CATEGORY_ENDPOINTS.LIST
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching all categories:', error);
            throw error;
        }
    }

    /**
     * Lấy danh mục theo ID
     * GET /api/categories/{id}
     */
    async getCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse>>(
                CATEGORY_ENDPOINTS.GET_BY_ID(id)
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching category with id ${id}:`, error);
            throw error;
        }
    }    /**
     * Lấy danh sách các danh mục hoạt động
     * GET /api/categories/active
     */
    async getActiveCategories(): Promise<ApiResponse<CategoryResponse[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>(
                CATEGORY_ENDPOINTS.ACTIVE
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching active categories:', error);
            throw error;
        }
    }

    /**
     * Tạo mới danh mục (chỉ dành cho ADMIN)
     * POST /api/categories
     * Content-Type: multipart/form-data
     */
    async createCategory(categoryRequest: CategoryRequest): Promise<ApiResponse<CategoryResponse>> {
        try {
            const formData = new FormData();
            formData.append('name', categoryRequest.name);
            formData.append('description', categoryRequest.description);
            formData.append('isActive', categoryRequest.isActive.toString());
            
            if (categoryRequest.iconFile) {
                formData.append('iconFile', categoryRequest.iconFile);
            }

            const response = await axiosInstance.post<ApiResponse<CategoryResponse>>(
                CATEGORY_ENDPOINTS.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    /**
     * Cập nhật thông tin danh mục (chỉ dành cho ADMIN)
     * PUT /api/categories/{id}
     * Content-Type: multipart/form-data
     */
    async updateCategory(id: number, categoryRequest: CategoryRequest): Promise<ApiResponse<CategoryResponse>> {
        try {
            const formData = new FormData();
            formData.append('name', categoryRequest.name);
            formData.append('description', categoryRequest.description);
            formData.append('isActive', categoryRequest.isActive.toString());
            
            if (categoryRequest.iconFile) {
                formData.append('iconFile', categoryRequest.iconFile);
            }

            const response = await axiosInstance.put<ApiResponse<CategoryResponse>>(
                CATEGORY_ENDPOINTS.UPDATE(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating category with id ${id}:`, error);
            throw error;
        }
    }

    /**
     * Xóa danh mục (chỉ dành cho ADMIN)
     * DELETE /api/categories/{id}
     */
    async deleteCategory(id: number): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(
                CATEGORY_ENDPOINTS.DELETE(id)
            );
            return response.data;
        } catch (error) {
            console.error(`Error deleting category with id ${id}:`, error);
            throw error;
        }
    }
}

const categoryService = new CategoryService();
export default categoryService;
