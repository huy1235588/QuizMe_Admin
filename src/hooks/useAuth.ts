import { useState, useCallback } from 'react';
import { authService, AuthResponse, ApiResponse } from '@/services/authService';
import { LoginRequest, RegisterRequest } from '@/types/database';

interface UseAuthReturn {
    // State
    isLoading: boolean;
    error: string | null;

    // Methods
    login: (loginRequest: LoginRequest) => Promise<AuthResponse | null>;
    register: (registerRequest: RegisterRequest) => Promise<AuthResponse | null>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<AuthResponse | null>;
    clearError: () => void;

    // Utils
    isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (loginRequest: LoginRequest): Promise<AuthResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(loginRequest);

            if (response.status === 'success') {
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (registerRequest: RegisterRequest): Promise<AuthResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register(registerRequest);

            if (response.status === 'success') {
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.logout();
        } catch (err: any) {
            // Log error but don't throw since logout should always clean up
            console.error('Logout error:', err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<AuthResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.refreshToken();

            if (response.status === 'success') {
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        // State
        isLoading,
        error,

        // Methods
        login,
        register,
        logout,
        refreshToken,
        clearError,

        // Utils
        isAuthenticated: authService.isAuthenticated(),
    };
};

export default useAuth;
