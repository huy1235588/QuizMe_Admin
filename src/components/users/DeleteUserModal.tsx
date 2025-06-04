"use client";

import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { UserResponse } from '@/types/database';

const { Text } = Typography;

interface DeleteUserModalProps {
    visible: boolean;
    user: UserResponse | null;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
    visible,
    user,
    onCancel,
    onConfirm,
    loading = false
}) => {
    if (!user) return null;

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined className="text-red-500" />
                    <span>Xác nhận xóa người dùng</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
                danger: true,
                loading: loading,
                type: 'primary'
            }}
            cancelButtonProps={{ disabled: loading }}
            width={500}
            centered
        >
            <div className="py-4">
                <Text>
                    Bạn có chắc chắn muốn xóa người dùng{' '}
                    <Text strong>"{user.fullName}"</Text>{' '}
                    (@{user.username})?
                </Text>

                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <Text type="danger" className="text-sm">
                        <strong>Cảnh báo:</strong> Thao tác này không thể hoàn tác.
                        Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn, bao gồm:
                    </Text>
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                        <li>Thông tin tài khoản và hồ sơ</li>
                        <li>Lịch sử tham gia quiz</li>
                        <li>Điểm số và thành tích</li>
                        <li>Các quiz đã tạo (nếu có)</li>
                    </ul>
                </div>

                <div className="mt-4">
                    <Text className="text-sm text-gray-600">
                        Nếu bạn chỉ muốn tạm thời vô hiệu hóa tài khoản,
                        hãy sử dụng chức năng "Khóa tài khoản" thay vì xóa.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;
