import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/admin-session-token';

export async function proxy(request: NextRequest) {
    const adminCookie = request.cookies.get('admin-session');

    if (request.nextUrl.pathname.startsWith('/admin')) {
        const isAuthenticated = await verifyAdminSessionToken(adminCookie?.value);

        if (!isAuthenticated) {
            const url = new URL('/', request.url);
            url.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
