'use client';

import { useState } from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { GB, VN } from 'country-flag-icons/react/3x2';

const { Option } = Select;

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const t = useTranslations('language'); const [currentLocale, setCurrentLocale] = useState(() => {
        return Cookies.get('locale') || 'vi';
    });

    const handleLanguageChange = (locale: string) => {
        setCurrentLocale(locale);
        Cookies.set('locale', locale, { expires: 365 });
        // Reload the page to apply the new language
        window.location.reload();
    };

    return (
        <Select
            value={currentLocale}
            onChange={handleLanguageChange}
            className={className}
            suffixIcon={<GlobalOutlined />}
            style={{
                minWidth: 120
            }}
            popupMatchSelectWidth={false}
        >
            <Option value="en">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GB style={{ width: '16px', marginRight: '4px' }} /> {t('english')}
                </div>
            </Option>
            <Option value="vi">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <VN style={{ width: '16px', marginRight: '4px' }} /> {t('vietnamese')}
                </div>
            </Option>
        </Select>
    );
};

export default LanguageSwitcher;
