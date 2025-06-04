'use client';

import { useState } from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

const { Option } = Select;

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const t = useTranslations('language');
    const [currentLocale, setCurrentLocale] = useState(() => {
        return Cookies.get('locale') || 'vn';
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
            style={{ minWidth: 120 }}
            popupMatchSelectWidth={false}
        >
            <Option value="en">
                🇺🇸 {t('english')}
            </Option>
            <Option value="vi">
                🇻🇳 {t('vietnamese')}
            </Option>
        </Select>
    );
};

export default LanguageSwitcher;
