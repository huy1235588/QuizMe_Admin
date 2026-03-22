"use client";

// Import các hook và hàm cần thiết từ React
import React, { createContext, useContext, useState, useEffect } from 'react';

// Định nghĩa kiểu Theme là 'light' hoặc 'dark'
type Theme = 'light' | 'dark';

// Định nghĩa interface cho context
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Tạo context với giá trị mặc định là undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Lấy theme ban đầu từ local storage hoặc theo hệ thống
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        // Khi component mount, kiểm tra xem đã lưu theme chưa hoặc lấy theo hệ thống
        const savedTheme = localStorage.getItem('theme') as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        // Cập nhật document mỗi khi theme thay đổi
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Lưu theme vào localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Hàm chuyển đổi theme
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook custom để sử dụng theme
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme phải được sử dụng bên trong ThemeProvider');
    }
    return context;
}