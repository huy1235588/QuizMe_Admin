// Import các thư viện cần thiết
import React from 'react';
import { Modal, Typography, Space, Divider } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

// Định nghĩa interface cho props của component
interface DeleteQuizModalProps {
    visible: boolean; // Thuộc tính để hiển thị hoặc ẩn modal
    onCancel: () => void; // Hàm được gọi khi người dùng huỷ thao tác
    onConfirm: () => void; // Hàm được gọi khi người dùng xác nhận xoá
    quizTitle?: string; // Tiêu đề của quiz để hiển thị trong thông báo
}

// Định nghĩa component DeleteQuizModal
const DeleteQuizModal: React.FC<DeleteQuizModalProps> = ({
    visible,
    onCancel,
    onConfirm,
    quizTitle = 'this quiz',
}) => {
    const { Title, Text } = Typography;
    const t = useTranslations('quizzes');
    const commonT = useTranslations('common');

    return (
        // Component Modal từ thư viện Ant Design
        <Modal title={
            <Space>
                <DeleteOutlined style={{ color: '#ff4d4f' }} />
                <span>{t('deleteQuiz')}</span>
            </Space>
        }
            open={visible}
            onOk={onConfirm} onCancel={onCancel}
            okText={commonT('delete')}
            okButtonProps={{
                danger: true,
                icon: <DeleteOutlined />
            }}
            cancelText={commonT('cancel')}
            centered
            width={500}
        >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <ExclamationCircleOutlined style={{ fontSize: 60, color: '#faad14', marginBottom: 15 }} />

                <Title level={4}>{t('deleteConfirmation', { quizTitle })}</Title>

                <Divider />

                <Text type="danger" strong>
                    {t('deleteWarning')}
                </Text>
            </div>
        </Modal>
    );
};

// Export component để sử dụng ở nơi khác
export default DeleteQuizModal;