'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { brandConfig } from '@/lib/config'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        setIsLoading(false)
        return
      }

      const session = await getSession()
      const role = session?.user?.role

      // Role-based redirect
      switch (role) {
        case 'admin':
          router.push('/admin')
          break
        case 'kitchen':
          router.push('/kds')
          break
        case 'cashier':
        case 'waiter':
          router.push('/tables')
          break
        default:
          router.push('/login')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 mb-6 relative">
            <Image 
              src={brandConfig.logoUrl} 
              alt={brandConfig.name}
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback to text if logo doesn't exist
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
              {brandConfig.name.charAt(0)}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {brandConfig.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            เข้าสู่ระบบ POS
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 relative block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="กรอกชื่อผู้ใช้"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 relative block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="กรอกรหัสผ่าน"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">บัญชีทดสอบ:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>admin/admin123</div>
                <div>cashier/cashier123</div>
                <div>waiter/waiter123</div>
                <div>kitchen/kitchen123</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}