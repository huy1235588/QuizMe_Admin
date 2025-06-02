import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS } from '@/constants/apiEndpoints';

// Tạo instance Axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho request để thêm token xác thực
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Chỉ áp dụng cho các request phía client (trình duyệt)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Thêm token vào Authorization header (cho API calls)
                config.headers.Authorization = `Bearer ${token}`;

                // Thêm token vào custom header (cho middleware)
                config.headers['x-access-token'] = token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho response để xử lý việc làm mới token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Kiểm tra nếu lỗi là do token hết hạn (401) và chưa thử làm mới token
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // Không có refresh token, chuyển hướng đến trang đăng nhập
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Gọi API để làm mới token
                const response = await axios.post(
                    `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
                    { refreshToken }
                );

                if (response.data.status === 'success') {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Cập nhật tokens trong bộ nhớ cục bộ
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Thiết lập header xác thực cho các request tương lai
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    // Thử lại request ban đầu với token mới
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                // Xóa tất cả dữ liệu xác thực và chuyển hướng đến trang đăng nhập
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Xuất instance Axios đã được cấu hình
export default axiosInstance;