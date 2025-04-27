"use client";

import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SnackbarProvider } from 'notistack';
import '@ant-design/v5-patch-for-react-19';

interface GlobalContextProviderProps {
    children: React.ReactNode;
}

/**
 * GlobalContextProvider
 * 
 * Một component wrapper kết hợp tất cả các context provider tại một nơi.
 * Điều này đảm bảo rằng tất cả các context provider được đánh dấu đúng là client components
 * và ngăn chặn lỗi "createContext only works in Client Components".
 */
export function GlobalContextProvider({ children }: GlobalContextProviderProps) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    autoHideDuration={3000}
                >
                    {children}
                </SnackbarProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}