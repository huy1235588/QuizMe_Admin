import React, { useState } from 'react';
import { Modal, Radio, Checkbox, Button, Space, Divider, Typography } from 'antd';
import { FiDownload, FiFileText } from 'react-icons/fi';

const { Text } = Typography;

export interface ExportModalProps {
    visible: boolean;
    onCancel: () => void;
    onExport: (format: 'excel' | 'csv', includeFields: string[]) => void;
    loading?: boolean;
    isDarkMode?: boolean;
    exportType?: 'current' | 'all';
    currentCount?: number;
    totalCount?: number;
}

export interface ExportField {
    key: string;
    label: string;
    defaultChecked: boolean;
}

const exportFields: ExportField[] = [
    { key: 'id', label: 'ID', defaultChecked: true },
    { key: 'username', label: 'Tên đăng nhập', defaultChecked: true },
    { key: 'email', label: 'Email', defaultChecked: true },
    { key: 'fullName', label: 'Họ và tên', defaultChecked: true },
    { key: 'role', label: 'Vai trò', defaultChecked: true },
    { key: 'isActive', label: 'Trạng thái', defaultChecked: true },
    { key: 'lastLogin', label: 'Đăng nhập lần cuối', defaultChecked: true },
    { key: 'createdAt', label: 'Ngày tạo', defaultChecked: true },
    { key: 'updatedAt', label: 'Ngày cập nhật', defaultChecked: false },
];

export default function ExportModal({
    visible,
    onCancel,
    onExport,
    loading = false,
    isDarkMode = false,
    exportType = 'current',
    currentCount = 0,
    totalCount = 0
}: ExportModalProps) {
    const [format, setFormat] = useState<'excel' | 'csv'>('excel');
    const [selectedFields, setSelectedFields] = useState<string[]>(
        exportFields.filter(field => field.defaultChecked).map(field => field.key)
    );

    const handleFieldChange = (checkedValues: string[]) => {
        setSelectedFields(checkedValues);
    };

    const handleSelectAll = () => {
        setSelectedFields(exportFields.map(field => field.key));
    };

    const handleDeselectAll = () => {
        setSelectedFields([]);
    };

    const handleExport = () => {
        if (selectedFields.length === 0) {
            return;
        }
        onExport(format, selectedFields);
    };

    const fieldOptions = exportFields.map(field => ({
        label: field.label,
        value: field.key,
    }));

    return (<Modal
        title={
            <div className="flex items-center space-x-2">
                <FiDownload className="text-lg" />
                <span>
                    Xuất dữ liệu người dùng
                    {exportType === 'all'
                        ? ` (Tất cả ${totalCount} người dùng)`
                        : ` (${currentCount} người dùng hiện tại)`
                    }
                </span>
            </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
        className={isDarkMode ? 'dark-modal' : ''}
    >
        <div className="space-y-6">
            {/* Chọn định dạng file */}
            <div>
                <Text strong className={`block mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Định dạng file:
                </Text>
                <Radio.Group
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Radio.Button
                            value="excel"
                            className={`h-20 flex flex-col items-center justify-center ${isDarkMode ? 'border-gray-600' : ''
                                }`}
                        >
                            <FiFileText className="text-2xl mb-1" />
                            <span>Excel (.xlsx)</span>
                            <small className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                Tốt nhất cho phân tích
                            </small>
                        </Radio.Button>
                        <Radio.Button
                            value="csv"
                            className={`h-20 flex flex-col items-center justify-center ${isDarkMode ? 'border-gray-600' : ''
                                }`}
                        >
                            <FiFileText className="text-2xl mb-1" />
                            <span>CSV (.csv)</span>
                            <small className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                Tương thích nhiều ứng dụng
                            </small>
                        </Radio.Button>
                    </div>
                </Radio.Group>
            </div>

            <Divider className={isDarkMode ? 'border-gray-600' : ''} />

            {/* Chọn trường dữ liệu */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Text strong className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                        Chọn trường dữ liệu:
                    </Text>
                    <Space>
                        <Button
                            size="small"
                            type="link"
                            onClick={handleSelectAll}
                            className={isDarkMode ? 'text-blue-400' : ''}
                        >
                            Chọn tất cả
                        </Button>
                        <Button
                            size="small"
                            type="link"
                            onClick={handleDeselectAll}
                            className={isDarkMode ? 'text-blue-400' : ''}
                        >
                            Bỏ chọn tất cả
                        </Button>
                    </Space>
                </div>

                <Checkbox.Group
                    options={fieldOptions}
                    value={selectedFields}
                    onChange={handleFieldChange}
                    className="w-full"
                >
                    <div className="grid grid-cols-2 gap-2">
                        {fieldOptions.map(option => (
                            <div key={option.value} className="py-1">
                                <Checkbox value={option.value}>
                                    {option.label}
                                </Checkbox>
                            </div>
                        ))}
                    </div>
                </Checkbox.Group>
            </div>

            {selectedFields.length === 0 && (
                <div className={`text-center py-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <Text type="warning">
                        Vui lòng chọn ít nhất một trường dữ liệu để xuất
                    </Text>
                </div>
            )}

            <Divider className={isDarkMode ? 'border-gray-600' : ''} />

            {/* Nút hành động */}
            <div className="flex justify-end space-x-3">
                <Button onClick={onCancel}>
                    Hủy
                </Button>
                <Button
                    type="primary"
                    icon={<FiDownload />}
                    onClick={handleExport}
                    loading={loading}
                    disabled={selectedFields.length === 0}
                    className={isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : ''}
                >
                    Xuất dữ liệu
                </Button>
            </div>
        </div>
    </Modal>
    );
}
