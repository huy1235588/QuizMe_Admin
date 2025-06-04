import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Cung cấp một locale tĩnh, lấy cài đặt người dùng,
    // đọc từ `cookies()`, `headers()`, v.v.
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'vi';

    return {
        locale,
        messages: (await import(`../../lang/${locale}.json`)).default
    };
});
