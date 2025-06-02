import { NextRequest, NextResponse } from 'next/server';
import { AuthAPI } from '@/api/authAPI';

// Danh sách các routes không cần xác thực
const publicRoutes = ['/login', '/register'];

// Danh sách các API routes public
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];

/**
 * Lấy token từ request headers hoặc cookies
 * Vì middleware chạy server-side, không thể truy cập localStorage
 */
function getTokenFromRequest(request: NextRequest): string | null {
    // Thử lấy từ Authorization header (được set bởi axios interceptor)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Thử lấy từ cookies (fallback)
    const cookieToken = request.cookies.get('accessToken')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    // Thử lấy từ custom header (có thể được set từ client)
    const customToken = request.headers.get('x-access-token');
    if (customToken) {
        return customToken;
    }

    return null;
}

/**
 * Kiểm tra token có hết hạn không (server-side check)
 */
function isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
        // Decode JWT token để kiểm tra exp claim
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        // Nếu không thể decode token, coi như đã hết hạn
        return true;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Kiểm tra xem route có thuộc danh sách public không
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isPublicApiRoute = publicApiRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // Lấy token từ request (headers hoặc cookies)
    const token = getTokenFromRequest(request);
    const hasValidToken = token && !isTokenExpired(token);    // Xử lý API routes
    if (pathname.startsWith('/api')) {
        // Cho phép truy cập API public
        if (isPublicApiRoute) {
            return NextResponse.next();
        }

        // API routes cần authentication
        if (!hasValidToken) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Authentication required. Please login to continue.',
                    code: 'UNAUTHORIZED'
                },
                { status: 401 }
            );
        }

        return NextResponse.next();
    }

    // Xử lý web routes
    // Nếu không có token và không phải public route, chuyển hướng đến trang đăng nhập
    if (!hasValidToken && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';

        // Lưu URL người dùng định truy cập để sau khi đăng nhập redirect về
        if (pathname !== '/') {
            url.searchParams.set('from', pathname);
        }

        return NextResponse.redirect(url);
    }

    // Nếu đã đăng nhập và đang truy cập trang đăng nhập/đăng ký
    if (hasValidToken && (pathname === '/login' || pathname === '/register')) {
        const url = request.nextUrl.clone();

        // Kiểm tra xem có redirect path không
        const redirectTo = request.nextUrl.searchParams.get('from');

        if (redirectTo && redirectTo !== '/login' && redirectTo !== '/register') {
            url.pathname = redirectTo;
            url.search = ''; // Clear search params
        } else {
            url.pathname = '/dashboard';
        }

        return NextResponse.redirect(url);
    }

    // Redirect root path to dashboard nếu đã đăng nhập
    if (hasValidToken && pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // Thêm security headers
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Nếu có token, set header để client biết đã authenticated
    if (hasValidToken) {
        response.headers.set('X-Authenticated', 'true');
    }

    return response;
}

export const config = {
    matcher: [
        // Loại trừ các tài nguyên tĩnh
        '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.svg$).*)',
    ],
};