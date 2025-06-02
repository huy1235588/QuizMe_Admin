# API Request Guidelines - QuizMe Admin

## 📋 Tổng quan

Tài liệu này mô tả các quy tắc và patterns để tạo và quản lý các request API trong dự án QuizMe Admin. Dự án sử dụng kiến trúc tầng (layered architecture) để tách biệt logic và tái sử dụng code.

## 🏗️ Kiến trúc API Layer

```
src/
├── api/              # API Helper classes (lớp trung gian)
├── services/         # Core API services (lớp cốt lõi)
├── utils/            # Axios configuration & utilities
├── constants/        # API endpoints & constants
├── hooks/            # Custom hooks sử dụng services
├── types/            # TypeScript interfaces & types
└── components/       # UI components consume hooks
```

## 📁 Cấu trúc Files

### 1. Constants Layer (`/src/constants/`)

**File: `apiEndpoints.ts`**
- Định nghĩa tất cả endpoints API
- Sử dụng `as const` để type safety
- Hỗ trợ dynamic endpoints với parameters

```typescript
// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Static endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
} as const;

// Dynamic endpoints
export const QUIZ_ENDPOINTS = {
    LIST: '/api/quizzes',
    GET_BY_ID: (id: number) => `/api/quizzes/${id}`,
    UPDATE: (id: number) => `/api/quizzes/${id}`,
    DELETE: (id: number) => `/api/quizzes/${id}`,
} as const;
```

### 2. Types Layer (`/src/types/`)

**File: `database.ts`**
- Định nghĩa Request types (dữ liệu gửi lên)
- Định nghĩa Response types (dữ liệu nhận về)
- Sử dụng generic ApiResponse wrapper

```typescript
// Cấu trúc response chuẩn
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message: string;
    timestamp?: string;
}

// Request types
export type LoginRequest = {
    usernameOrEmail: string;
    password: string;
}

export type QuizRequest = {
    title: string;
    description: string;
    thumbnailFile?: File;
    categoryIds: number[];
    difficulty: Difficulty;
    isPublic: boolean;
}

// Response types
export interface QuizResponse {
    id: number;
    title: string;
    description: string;
    quizThumbnails?: string;
    difficulty: Difficulty;
    isPublic: boolean;
    playCount: number;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
}
```

### 3. Utils Layer (`/src/utils/`)

**File: `axios.ts`**
- Cấu hình Axios instance chung
- Request/Response interceptors
- Automatic token handling
- Error handling & retry logic

```typescript
import axios from 'axios';
import { API_BASE_URL } from '@/constants/apiEndpoints';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - thêm token tự động
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                config.headers['x-access-token'] = token;
            }
        }
        return config;
    }
);

// Response interceptor - xử lý refresh token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Auto refresh token logic
        // Redirect to login if refresh fails
    }
);
```

### 4. Services Layer (`/src/services/`)

**Chức năng:**
- Thực hiện actual API calls
- Error handling cơ bản
- Trả về raw API response
- Không chứa business logic

**Patterns:**

```typescript
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
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Tạo danh mục mới
     * POST /api/categories
     */
    async createCategory(categoryRequest: CategoryRequest): Promise<ApiResponse<CategoryResponse>> {
        try {
            // Xử lý FormData cho file upload
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
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }
}
```

### 5. API Helper Layer (`/src/api/`)

**Chức năng:**
- Utility functions cho specific use cases
- Bổ sung logic cho services
- Xử lý localStorage cho auth

```typescript
export class AuthAPI {
    /**
     * Đăng nhập với username/email và password
     */
    static async loginWithCredentials(usernameOrEmail: string, password: string) {
        const loginRequest: LoginRequest = {
            usernameOrEmail,
            password
        };

        return await authService.login(loginRequest);
    }

    /**
     * Đăng xuất người dùng hiện tại
     */
    static async logoutUser() {
        return await authService.logout();
    }
}
```

### 6. Hooks Layer (`/src/hooks/`)

**Chức năng:**
- Kết hợp services với React state
- Business logic & data transformation
- Loading states & error handling
- Cache & state management

**Patterns:**

```typescript
export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.getAllCategories();
            if (response.status === 'success') {
                setCategories(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Error fetching categories');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const createCategory = async (categoryRequest: CategoryRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryService.createCategory(categoryRequest);
            if (response.status === 'success') {
                await fetchAllCategories(); // Refresh data
                return response.data;
            } else {
                setError(response.message);
                throw new Error(response.message);
            }
        } catch (err) {
            setError('Error creating category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        loading,
        error,
        fetchAllCategories,
        createCategory,
        setError, // Để clear error từ component
    };
};
```

## 🔄 Request Types & Patterns

### 1. GET Requests

**Simple GET:**
```typescript
// Service method
async getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
    const response = await axiosInstance.get<ApiResponse<CategoryResponse[]>>(
        CATEGORY_ENDPOINTS.LIST
    );
    return response.data;
}

// Hook usage
const { categories, loading, error } = useCategories();
```

**GET with Parameters:**
```typescript
// Service method với query parameters
async getQuizzes(params: QuizFilterParams): Promise<ApiResponse<QuizListResponse>> {
    const response = await axiosInstance.get<ApiResponse<QuizListResponse>>(
        QUIZ_ENDPOINTS.LIST,
        { params }
    );
    return response.data;
}

// Hook với filtered data
const fetchQuizzes = useCallback(async () => {
    const queryParams: QuizFilterParams = {
        page: currentPage,
        pageSize,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        difficulty: difficultyFilter || undefined,
    };
    
    const response = await axiosInstance.get('/api/quizzes', {
        params: queryParams
    });
}, [currentPage, pageSize, selectedCategory, searchQuery]);
```

**GET by ID:**
```typescript
// Dynamic endpoint
async getCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
    const response = await axiosInstance.get<ApiResponse<CategoryResponse>>(
        CATEGORY_ENDPOINTS.GET_BY_ID(id)
    );
    return response.data;
}
```

### 2. POST Requests

**JSON POST:**
```typescript
async login(loginRequest: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.LOGIN,
        loginRequest
    );
    
    // Handle success case
    if (response.data.status === 'success') {
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response.data;
}
```

**FormData POST (File Upload):**
```typescript
async createQuiz(quizRequest: QuizRequest): Promise<ApiResponse<QuizResponse>> {
    const formData = new FormData();
    formData.append('title', quizRequest.title);
    formData.append('description', quizRequest.description);
    formData.append('categoryId', quizRequest.categoryId.toString());
    formData.append('difficulty', quizRequest.difficulty);
    formData.append('isPublic', quizRequest.isPublic.toString());
    
    if (quizRequest.thumbnailFile) {
        formData.append('thumbnailFile', quizRequest.thumbnailFile);
    }

    const response = await axiosInstance.post<ApiResponse<QuizResponse>>(
        QUIZ_ENDPOINTS.CREATE,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );
    return response.data;
}
```

### 3. PUT/PATCH Requests

```typescript
async updateQuiz(id: number, quizRequest: QuizRequest): Promise<ApiResponse<QuizResponse>> {
    const formData = new FormData();
    // ... append fields like POST
    
    const response = await axiosInstance.put<ApiResponse<QuizResponse>>(
        QUIZ_ENDPOINTS.UPDATE(id),
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );
    return response.data;
}
```

### 4. DELETE Requests

```typescript
async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        CATEGORY_ENDPOINTS.DELETE(id)
    );
    return response.data;
}

// Usage trong hook
const deleteCategory = async (id: number) => {
    try {
        setLoading(true);
        const response = await categoryService.deleteCategory(id);
        if (response.status === 'success') {
            await fetchAllCategories(); // Refresh data
            return true;
        } else {
            setError(response.message);
            throw new Error(response.message);
        }
    } catch (err) {
        setError('Error deleting category');
        throw err;
    } finally {
        setLoading(false);
    }
};
```

## 🎯 Best Practices

### 1. Error Handling

**Service Level:**
```typescript
try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
} catch (error) {
    console.error('Error description:', error);
    throw error; // Re-throw để hook xử lý
}
```

**Hook Level:**
```typescript
try {
    setLoading(true);
    setError(null);
    const response = await service.method();
    if (response.status === 'success') {
        // Handle success
    } else {
        setError(response.message);
        throw new Error(response.message);
    }
} catch (err) {
    setError('User-friendly error message');
    console.error('Detailed error:', err);
    throw err; // Optional: re-throw nếu component cần handle
} finally {
    setLoading(false);
}
```

### 2. Loading States

```typescript
// Hook pattern
const [loading, setLoading] = useState(false);

const performAction = async () => {
    try {
        setLoading(true);
        // API call
    } finally {
        setLoading(false); // Always reset loading
    }
};

// Component usage
if (loading) {
    return <Spin size="large" tip="Loading..." />;
}
```

### 3. Data Refresh Patterns

```typescript
// Refresh sau khi tạo/sửa/xóa
const createItem = async (data) => {
    const response = await service.create(data);
    if (response.status === 'success') {
        await fetchAllItems(); // Refresh danh sách
        return response.data;
    }
};

// Optimistic updates (cập nhật UI trước, rollback nếu fail)
const deleteItem = async (id: number) => {
    // Update UI immediately
    setItems(prev => prev.filter(item => item.id !== id));
    
    try {
        await service.delete(id);
        enqueueSnackbar('Deleted successfully', { variant: 'success' });
    } catch (error) {
        // Rollback on error
        await fetchAllItems();
        enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
};
```

### 4. Pagination Handling

```typescript
// Service method với pagination
async getQuizzes(params: QuizFilterParams): Promise<ApiResponse<PaginatedResponse<QuizResponse>>> {
    const response = await axiosInstance.get('/api/quizzes', { params });
    return response.data;
}

// Hook state
const [currentPage, setCurrentPage] = useState(0); // 0-based cho API
const [pageSize, setPageSize] = useState(12);
const [totalPages, setTotalPages] = useState(1);

// Fetch với pagination
const fetchQuizzes = useCallback(async () => {
    const params = {
        page: currentPage,
        pageSize,
        // ... other filters
    };
    
    const response = await service.getQuizzes(params);
    if (response.status === 'success') {
        setQuizzes(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
    }
}, [currentPage, pageSize, ...otherDependencies]);

// UI handlers
const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page - 1); // Convert UI (1-based) to API (0-based)
}, []);
```

### 5. Filter & Search Patterns

```typescript
// State cho filters
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(null);

// Debounced search
const [debouncedSearch] = useDebounce(searchQuery, 500);

// Effect để fetch khi filter thay đổi
useEffect(() => {
    fetchData();
}, [debouncedSearch, selectedCategory, difficultyFilter, currentPage]);

// Reset trang khi filter thay đổi
const handleFilterChange = useCallback((filterValue) => {
    setFilterValue(filterValue);
    setCurrentPage(0); // Reset về trang đầu
}, []);
```

## 📝 Naming Conventions

### Services
- Class names: `PascalCase` (VD: `CategoryService`, `AuthService`)
- Method names: `camelCase` với action prefix
  - `get...()` - Lấy dữ liệu
  - `create...()` - Tạo mới
  - `update...()` - Cập nhật
  - `delete...()` - Xóa
  - `fetch...()` - Lấy và cache dữ liệu

### Hooks
- Hook names: `use...` prefix (VD: `useCategories`, `useAuth`)
- Return object với destructuring pattern
- State names: descriptive và consistent

### API Endpoints
- Constant names: `UPPER_SNAKE_CASE`
- Grouped by resource: `AUTH_ENDPOINTS`, `QUIZ_ENDPOINTS`
- RESTful conventions

### Types
- Request types: `...Request` suffix
- Response types: `...Response` suffix
- Enums: `PascalCase`

## 🚀 Component Integration

```typescript
// Component sử dụng hook
const CategoriesPage = () => {
    const {
        categories,
        loading,
        error,
        fetchAllCategories,
        createCategory,
        deleteCategory,
    } = useCategories();

    // Effects
    useEffect(() => {
        fetchAllCategories();
    }, []);

    // Handlers
    const handleCreate = async (data: CategoryRequest) => {
        try {
            await createCategory(data);
            enqueueSnackbar('Category created successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to create category', { variant: 'error' });
        }
    };

    // Render
    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;
    
    return (
        <div>
            {categories.map(category => (
                <CategoryCard 
                    key={category.id} 
                    category={category}
                    onDelete={deleteCategory}
                />
            ))}
        </div>
    );
};
```

## 🔐 Security Considerations

1. **Token Management**: Automatic token inclusion via interceptors
2. **HTTPS Only**: Production API calls qua HTTPS
3. **Input Validation**: Validate data trước khi gửi API
4. **Error Information**: Không expose sensitive info trong error messages
5. **File Upload**: Validate file types và sizes

## 📊 Performance Optimization

1. **Request Debouncing**: Cho search và filters
2. **Pagination**: Không load tất cả data một lúc
3. **Caching**: Sử dụng React Query hoặc SWR cho advanced caching
4. **Optimistic Updates**: Update UI trước, sync sau
5. **Error Boundaries**: Graceful error handling

---

**Lưu ý**: Documentation này sẽ được cập nhật khi có thay đổi trong architecture hoặc requirements mới.
