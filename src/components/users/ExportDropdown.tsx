import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { FiDownload, FiChevronDown } from 'react-icons/fi';
import type { MenuProps } from 'antd';

export interface ExportDropdownProps {
    onExportCurrent: () => void;
    onExportAll: () => void;
    onCreateTemplate: () => void;
    disabled?: boolean;
    loading?: boolean;
    isDarkMode?: boolean;
    currentCount?: number;
    totalCount?: number;
}

export default function ExportDropdown({
    onExportCurrent,
    onExportAll,
    onCreateTemplate,
    disabled = false,
    loading = false,
    isDarkMode = false,
    currentCount = 0,
    totalCount = 0
}: ExportDropdownProps) {
    const items: MenuProps['items'] = [
        {
            key: 'current',
            label: (
                <div className="flex flex-col py-1">
                    <span>Xuất trang hiện tại</span>
                    <small className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentCount} người dùng
                    </small>
                </div>
            ),
            onClick: onExportCurrent,
            disabled: currentCount === 0
        },
        {
            key: 'all',
            label: (
                <div className="flex flex-col py-1">
                    <span>Xuất tất cả</span>
                    <small className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {totalCount} người dùng
                    </small>
                </div>
            ),
            onClick: onExportAll,
            disabled: totalCount === 0
        },
        {
            type: 'divider'
        },
        {
            key: 'template',
            label: (
                <div className="flex flex-col py-1">
                    <span>Tạo template import</span>
                    <small className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        File Excel mẫu
                    </small>
                </div>
            ),
            onClick: onCreateTemplate
        }
    ];

    return (
        <Dropdown
            menu={{ items }}
            placement="bottomRight"
            disabled={disabled}
            trigger={['click']}
        >
            <Button
                icon={<FiDownload />}
                loading={loading}
                disabled={disabled}
                className={isDarkMode ? 'border-gray-600' : ''}
            >
                <Space>
                    Xuất dữ liệu
                    <FiChevronDown />
                </Space>
            </Button>
        </Dropdown>
    );
}
