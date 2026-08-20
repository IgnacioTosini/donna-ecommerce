'use server'

import { cookies } from 'next/headers'
import {
    ADMIN_SESSION_DURATION_SECONDS,
    createAdminSessionToken,
} from '@/lib/admin-session-token'

export async function loginAdmin(password: string) {
    const serverSecret = process.env.ADMIN_PASSWORD
        ?? process.env.SECRET_API_KEY
        ?? process.env.NEXT_PUBLIC_SECRET_API_KEY
        ?? process.env.INTERNAL_API_KEY

    if (!serverSecret || password !== serverSecret) {
        return { error: 'Clave incorrecta' }
    }

    const cookieStore = await cookies()
    const sessionToken = await createAdminSessionToken()

    cookieStore.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ADMIN_SESSION_DURATION_SECONDS,
    })

    return { success: true }
}
