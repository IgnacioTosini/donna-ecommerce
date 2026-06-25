'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { loginAdmin } from '../actions/admin.actions'
import './_adminLogin.scss'

export default function AdminLoginPage() {
    const router = useRouter()

    const handleLogin = async (password: string) => {
        const result = await loginAdmin(password)

        if (result.error) {
            toast.error(result.error)
            return;
        }

        router.push('/admin')
    }

    return (
        <form className='adminLoginForm' onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const password = String(formData.get('password') ?? '')
            handleLogin(password)
        }}>
            <h1 className='adminLoginTitle'>Login Admin</h1>
            <label htmlFor="password" className='adminLoginLabel'>Contraseña:</label>
            <input id="password" name='password' type="password" className='adminLoginInput' />
            <button type='submit' className='adminLoginButton'>
                Ingresar como administrador
            </button>
        </form>
    )
}
