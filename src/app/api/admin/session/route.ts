import { isAdminAuthenticated } from '@/lib/admin-session';

export async function GET() {
    const authenticated = await isAdminAuthenticated();

    return Response.json(
        { authenticated },
        {
            headers: {
                'Cache-Control': 'private, no-store, max-age=0',
            },
        }
    );
}
