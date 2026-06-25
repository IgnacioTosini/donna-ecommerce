'use server'

import { cookies } from 'next/headers'

export async function loginAdmin(password: string) {
    const serverSecret = process.env.SECRET_API_KEY ?? process.env.NEXT_PUBLIC_SECRET_API_KEY

    if (!serverSecret || password !== serverSecret) {
        return { error: 'Clave incorrecta' }
    }

    const cookieStore = await cookies()

    cookieStore.set('admin-session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
    })

    return { success: true }
}
