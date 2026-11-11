'use client'

import { useSession, signOut } from 'next-auth/react'
import { brandConfig } from '@/lib/config'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div>
          <h2 className="text-3xl font-bold text-red-600">
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            บัญชี {session?.user?.username} ({session?.user?.role}) ไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            กลับ
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}