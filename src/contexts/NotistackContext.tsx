"use client";

import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useTheme } from './ThemeContext';

// Custom style for different variants of snackbars
const snackbarStyles = {
    success: {
        light: 'bg-green-50 border-green-500 text-green-800',
        dark: 'bg-green-900/20 border-green-600 text-green-200',
    },
    error: {
        light: 'bg-red-50 border-red-500 text-red-800',
        dark: 'bg-red-900/20 border-red-600 text-red-200',
    },
    warning: {
        light: 'bg-amber-50 border-amber-500 text-amber-800',
        dark: 'bg-amber-900/20 border-amber-600 text-amber-200',
    },
    info: {
        light: 'bg-blue-50 border-blue-500 text-blue-800',
        dark: 'bg-blue-900/20 border-blue-600 text-blue-200',
    },
    default: {
        light: 'bg-gray-50 border-gray-500 text-gray-800',
        dark: 'bg-gray-700 border-gray-500 text-gray-200',
    },
};

// Icons for different variants of snackbars
const snackbarIcons = {
    success: <FiCheckCircle className="text-lg mr-2" />,
    error: <FiAlertCircle className="text-lg mr-2" />,
    warning: <FiAlertTriangle className="text-lg mr-2" />,
    info: <FiInfo className="text-lg mr-2" />,
    default: <FiInfo className="text-lg mr-2" />,
};

export function NotistackProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Success snackbar component with forwardRef
    const SuccessSnackbar = forwardRef(({ id, message, onClose }: any, ref: any) => (
        <div
            ref={ref}
            className={`flex items-center justify-between py-3 px-4 rounded-md border-l-4 shadow-md ${snackbarStyles.success[isDarkMode ? 'dark' : 'light']} border-l-green-500`}
        >
            <div className="flex items-center">
                {snackbarIcons.success}
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="text-lg ml-2 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX />
            </button>
        </div>
    ));
    SuccessSnackbar.displayName = 'SuccessSnackbar';

    // Error snackbar component with forwardRef
    const ErrorSnackbar = forwardRef(({ id, message, onClose }: any, ref: any) => (
        <div
            ref={ref}
            className={`flex items-center justify-between py-3 px-4 rounded-md border-l-4 shadow-md ${snackbarStyles.error[isDarkMode ? 'dark' : 'light']} border-l-red-500`}
        >
            <div className="flex items-center">
                {snackbarIcons.error}
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="text-lg ml-2 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX />
            </button>
        </div>
    ));
    ErrorSnackbar.displayName = 'ErrorSnackbar';

    // Warning snackbar component with forwardRef
    const WarningSnackbar = forwardRef(({ id, message, onClose }: any, ref: any) => (
        <div
            ref={ref}
            className={`flex items-center justify-between py-3 px-4 rounded-md border-l-4 shadow-md ${snackbarStyles.warning[isDarkMode ? 'dark' : 'light']} border-l-amber-500`}
        >
            <div className="flex items-center">
                {snackbarIcons.warning}
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="text-lg ml-2 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX />
            </button>
        </div>
    ));
    WarningSnackbar.displayName = 'WarningSnackbar';

    // Info snackbar component with forwardRef
    const InfoSnackbar = forwardRef(({ id, message, onClose }: any, ref: any) => (
        <div
            ref={ref}
            className={`flex items-center justify-between py-3 px-4 rounded-md border-l-4 shadow-md ${snackbarStyles.info[isDarkMode ? 'dark' : 'light']} border-l-blue-500`}
        >
            <div className="flex items-center">
                {snackbarIcons.info}
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="text-lg ml-2 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX />
            </button>
        </div>
    ));
    InfoSnackbar.displayName = 'InfoSnackbar';

    // Default snackbar component with forwardRef
    const DefaultSnackbar = forwardRef(({ id, message, onClose }: any, ref: any) => (
        <div
            ref={ref}
            className={`flex items-center justify-between py-3 px-4 rounded-md border-l-4 shadow-md ${snackbarStyles.default[isDarkMode ? 'dark' : 'light']} border-l-gray-500`}
        >
            <div className="flex items-center">
                {snackbarIcons.default}
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="text-lg ml-2 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX />
            </button>
        </div>
    ));
    DefaultSnackbar.displayName = 'DefaultSnackbar';

    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            preventDuplicate
            Components={{
                success: SuccessSnackbar,
                error: ErrorSnackbar,
                warning: WarningSnackbar,
                info: InfoSnackbar,
                default: DefaultSnackbar,
            }}
        >
            {children}
        </SnackbarProvider>
    );
}