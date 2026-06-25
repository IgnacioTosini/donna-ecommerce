import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const adminCookie = request.cookies.get('admin-session');

    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!adminCookie || adminCookie.value !== 'true') {
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
