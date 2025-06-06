import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@/contexts/ThemeContext';
import { UserAPI } from '@/api/userAPI';
import { UserResponse, UserProfileResponse, Role, UserFilterParams, PageResponse } from '@/types/database';

/**
 * Hook để quản lý danh sách người dùng top
 */
export const useTopUsers = () => {
    const [topUsers, setTopUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const users = await UserAPI.getTopUsers();
            setTopUsers(users);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch top users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopUsers();
    }, [fetchTopUsers]);

    return {
        topUsers,
        loading,
        error,
        refetch: fetchTopUsers
    };
};

/**
 * Hook để quản lý thông tin người dùng theo ID
 */
export const useUser = (userId: number | null) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await UserAPI.getUserById(id);
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUser(userId);
        }
    }, [userId, fetchUser]);

    return {
        user,
        loading,
        error,
        refetch: userId ? () => fetchUser(userId) : () => { }
    };
};

/**
 * Hook để quản lý profile người dùng hiện tại
 */
export const useCurrentUserProfile = () => {
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await UserAPI.getCurrentUserProfile();
            setProfile(profileData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    };
};

/**
 * Hook để quản lý profile người dùng theo ID
 */
export const useUserProfile = (userId: number | null) => {
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await UserAPI.getUserProfile(id);
            setProfile(profileData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
        }
    }, [userId, fetchProfile]);

    return {
        profile,
        loading,
        error,
        refetch: userId ? () => fetchProfile(userId) : () => { }
    };
};

/**
 * Hook để quản lý tổng số người dùng
 */
export const useUserCount = () => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const userCount = await UserAPI.getUserCount();
            setCount(userCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user count');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();
    }, [fetchCount]);

    return {
        count,
        loading,
        error,
        refetch: fetchCount
    };
};

/**
 * Hook để quản lý upload/remove avatar
 */
export const useAvatar = () => {
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadAvatar = useCallback(async (file: File): Promise<UserResponse | null> => {
        try {
            setUploading(true);
            setError(null);
            const updatedUser = await UserAPI.uploadAvatar(file);
            return updatedUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload avatar');
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    const removeAvatar = useCallback(async (): Promise<UserResponse | null> => {
        try {
            setRemoving(true);
            setError(null);
            const updatedUser = await UserAPI.removeAvatar();
            return updatedUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove avatar');
            return null;
        } finally {
            setRemoving(false);
        }
    }, []);

    return {
        uploadAvatar,
        removeAvatar,
        uploading,
        removing,
        loading: uploading || removing,
        error
    };
};

/**
 * Hook chính để quản lý danh sách người dùng với đầy đủ tính năng
 */
export const useUsers = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const { enqueueSnackbar } = useSnackbar();

    // Quản lý state
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<Role | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null); const [sortBy, setSortBy] = useState<keyof UserResponse>('createdAt');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name' | 'lastLogin'>('newest');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [topUsers, setTopUsers] = useState<UserResponse[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Lấy danh sách người dùng (mock data vì API chưa có pagination)
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            // Lấy top users từ API
            const topUsersData = await UserAPI.getTopUsers();
            setTopUsers(topUsersData);

            // Mock thêm dữ liệu cho development
            const mockUsers: UserResponse[] = [
                ...topUsersData,
                {
                    id: 999,
                    username: 'testuser1',
                    email: 'test1@example.com',
                    fullName: 'Test User 1',
                    profileImage: undefined,
                    createdAt: '2024-01-15T10:30:00Z',
                    lastLogin: '2024-06-01T08:00:00Z',
                    role: 'USER' as Role,
                    isActive: true
                },
                {
                    id: 998,
                    username: 'testuser2',
                    email: 'test2@example.com',
                    fullName: 'Test User 2',
                    profileImage: undefined,
                    createdAt: '2024-02-20T14:45:00Z',
                    lastLogin: '2024-05-30T16:20:00Z',
                    role: 'USER' as Role,
                    isActive: false
                },
                {
                    id: 997,
                    username: 'admin1',
                    email: 'admin@example.com',
                    fullName: 'Admin User',
                    profileImage: undefined,
                    createdAt: '2023-12-01T09:00:00Z',
                    lastLogin: '2024-06-05T07:30:00Z',
                    role: 'ADMIN' as Role,
                    isActive: true
                }
            ];

            setUsers(mockUsers);
            setTotalUsers(mockUsers.length);

        } catch (error) {
            console.error('Error fetching users:', error);
            enqueueSnackbar('Failed to load users', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    // Lấy số lượng người dùng
    const fetchUserCount = useCallback(async () => {
        try {
            const count = await UserAPI.getUserCount();
            setTotalUsers(count);
        } catch (error) {
            console.error('Error fetching user count:', error);
        }
    }, []);

    // Filtered và sorted users
    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = UserAPI.filterUsers(filtered, searchQuery);
        }

        // Filter by role
        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Filter by status
        if (statusFilter !== null) {
            filtered = filtered.filter(user => user.isActive === statusFilter);
        }        // Sort users
        filtered = UserAPI.sortUsers(filtered, sortBy, sortOrder === 'newest' ? false : sortOrder === 'oldest' ? true : sortOrder === 'name' ? true : false);

        return filtered;
    }, [users, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

    // Paginated users
    const paginatedUsers = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginated = filteredUsers.slice(startIndex, endIndex);
        setTotalPages(Math.ceil(filteredUsers.length / pageSize));
        return paginated;
    }, [filteredUsers, currentPage, pageSize]);

    // Handle actions
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(0);
    }, []);

    const handleRoleFilter = useCallback((role: Role | null) => {
        setRoleFilter(role);
        setCurrentPage(0);
    }, []);

    const handleStatusFilter = useCallback((status: boolean | null) => {
        setStatusFilter(status);
        setCurrentPage(0);
    }, []); const handleSort = useCallback((sortType: 'newest' | 'oldest' | 'name' | 'lastLogin') => {
        setSortOrder(sortType);

        // Update sortBy based on sortType
        switch (sortType) {
            case 'newest':
                setSortBy('createdAt');
                break;
            case 'oldest':
                setSortBy('createdAt');
                break;
            case 'name':
                setSortBy('fullName');
                break;
            case 'lastLogin':
                setSortBy('lastLogin');
                break;
        }

        setCurrentPage(0);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    }, []);

    const handleSelectUser = useCallback((userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }, []);

    const handleSelectAllUsers = useCallback((checked: boolean) => {
        setSelectedUsers(checked ? paginatedUsers.map(user => user.id) : []);
    }, [paginatedUsers]);

    const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete') => {
        try {
            enqueueSnackbar(`${action} action performed on ${selectedUsers.length} users`, {
                variant: 'success'
            });
            setSelectedUsers([]);
            await fetchUsers();
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            enqueueSnackbar(`Failed to ${action} users`, { variant: 'error' });
        }
    }, [selectedUsers, enqueueSnackbar, fetchUsers]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchUsers();
        fetchUserCount();
    }, [fetchUsers, fetchUserCount]);

    return {
        // Data
        users: paginatedUsers,
        allUsers: filteredUsers,
        topUsers,
        loading,
        totalUsers,
        totalPages,
        currentPage,
        pageSize,
        selectedUsers,
        viewMode,

        // Filters
        searchQuery,
        roleFilter,
        statusFilter,
        sortBy,
        sortOrder,

        // Actions
        handleSearch,
        handleRoleFilter,
        handleStatusFilter,
        handleSort,
        handlePageChange,
        handlePageSizeChange,
        handleSelectUser,
        handleSelectAllUsers,
        handleBulkAction,
        toggleViewMode,
        fetchUsers,

        // Utilities
        isDarkMode
    };
};

/**
 * Hook để quản lý danh sách người dùng theo phân trang và lọc
 */
export const usePagedUsers = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // 0-based for API
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'username'>('newest');

    const { enqueueSnackbar } = useSnackbar();

    const fetchPagedUsers = useCallback(async (params?: Partial<UserFilterParams>) => {
        try {
            setLoading(true);
            setError(null);

            const filterParams: UserFilterParams = {
                page: params?.page ?? currentPage,
                pageSize: params?.pageSize ?? pageSize,
                search: params?.search ?? (searchQuery || undefined),
                sort: params?.sort ?? sortBy,
            };

            const response = await UserAPI.getPagedUsers(filterParams);

            setUsers(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
            setIsLastPage(response.last);

            // Update current page if provided in params
            if (params?.page !== undefined) {
                setCurrentPage(params.page);
            }
            if (params?.pageSize !== undefined) {
                setPageSize(params.pageSize);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, sortBy, enqueueSnackbar]);

    // Initial fetch
    useEffect(() => {
        fetchPagedUsers();
    }, [fetchPagedUsers]);

    // Handlers
    const handlePageChange = useCallback((page: number) => {
        const newPage = page - 1; // Convert UI (1-based) to API (0-based)
        fetchPagedUsers({ page: newPage });
    }, [fetchPagedUsers]);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        fetchPagedUsers({ page: 0, pageSize: newPageSize }); // Reset to first page
    }, [fetchPagedUsers]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        fetchPagedUsers({ page: 0, search: query }); // Reset to first page
    }, [fetchPagedUsers]);

    const handleSortChange = useCallback((sort: 'newest' | 'oldest' | 'name' | 'username') => {
        setSortBy(sort);
        fetchPagedUsers({ page: 0, sort }); // Reset to first page
    }, [fetchPagedUsers]);

    const handleRefresh = useCallback(() => {
        fetchPagedUsers();
    }, [fetchPagedUsers]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setSortBy('newest');
        fetchPagedUsers({ page: 0, pageSize: 10, search: undefined, sort: 'newest' });
    }, [fetchPagedUsers]);

    // Computed values
    const hasUsers = users.length > 0;
    const hasMore = !isLastPage;
    const currentPageUI = currentPage + 1; // Convert API (0-based) to UI (1-based)
    const startIndex = currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

    return {
        // Data
        users,
        loading,
        error,

        // Pagination
        currentPage: currentPageUI,
        pageSize,
        totalElements,
        totalPages,
        isLastPage,
        hasMore,
        startIndex,
        endIndex,

        // Filters
        searchQuery,
        sortBy,

        // Computed
        hasUsers,

        // Actions
        handlePageChange,
        handlePageSizeChange,
        handleSearch,
        handleSortChange,
        handleRefresh,
        handleReset,

        // Direct fetch with params
        fetchPagedUsers
    };
};
