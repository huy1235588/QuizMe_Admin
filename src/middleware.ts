import { NextRequest, NextResponse } from 'next/server';

// Danh sách các routes không cần xác thực
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Kiểm tra xem route có thuộc danh sách public không
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Lấy token từ cookies hoặc localStorage (ở client-side)
    const token = request.cookies.get('accessToken')?.value || '';

    // Nếu không có token và không phải public route, chuyển hướng đến trang đăng nhập
    if (!token && !isPublicRoute) {
        // Nếu là một API route
        if (pathname.startsWith('/api')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Lưu URL người dùng định truy cập để sau khi đăng nhập redirect về
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);

        return NextResponse.redirect(url);
    }

    // Nếu đã đăng nhập và đang truy cập trang đăng nhập, chuyển hướng đến dashboard
    if (token && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Loại trừ các tài nguyên tĩnh
        '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.svg$).*)',
    ],
};