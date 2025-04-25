"use client";

import { useSnackbar } from 'notistack';

export function useNotification() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // Thông báo thành công
    const success = (message: string) => {
        enqueueSnackbar(message, { variant: 'success' });
    };

    // Thông báo lỗi
    const error = (message: string) => {
        enqueueSnackbar(message, { variant: 'error' });
    };

    // Thông báo cảnh báo
    const warning = (message: string) => {
        enqueueSnackbar(message, { variant: 'warning' });
    };

    // Thông báo thông tin
    const info = (message: string) => {
        enqueueSnackbar(message, { variant: 'info' });
    };

    // Thông báo mặc định
    const notify = (message: string) => {
        enqueueSnackbar(message, { variant: 'default' });
    };

    return {
        success,
        error,
        warning,
        info,
        notify,
        closeSnackbar,
    };
}