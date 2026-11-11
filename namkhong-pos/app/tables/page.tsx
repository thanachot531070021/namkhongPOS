'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { brandConfig } from '@/lib/config'
import toast from 'react-hot-toast'

interface Table {
  id: string
  number: string
  status: 'closed' | 'open' | 'reserved'
  orders: Array<{
    id: string
    isCompleted: boolean
    isPaid: boolean
    total: number
    createdAt: string
  }>
}

export default function TablesPage() {
  const { data: session, status } = useSession()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTables()
    }
  }, [status])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (!response.ok) throw new Error('Failed to fetch tables')
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error('ไม่สามารถโหลดข้อมูลโต๊ะได้')
    } finally {
      setLoading(false)
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'กำลังใช้งาน'
      case 'reserved':
        return 'จอง'
      default:
        return 'ว่าง'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {brandConfig.name}
              </h1>
              <span className="ml-4 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {session?.user?.role === 'cashier' ? 'แคชเชียร์' : 'เสิร์ฟ'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                สวัสดี, {session?.user?.username}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tables Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">เลือกโต๊ะ</h2>
          <p className="text-sm text-gray-600 mt-1">
            กดเลือกโต๊ะเพื่อรับออเดอร์หรือจัดการรายการอาหาร
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const currentOrder = table.orders.find(order => !order.isCompleted)
            
            return (
              <Link
                key={table.id}
                href={`/order/${table.id}`}
                className={`
                  relative p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                  ${getTableStatusColor(table.status)}
                  hover:scale-105
                `}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {table.number}
                  </div>
                  <div className="text-sm font-medium mb-2">
                    {getTableStatusText(table.status)}
                  </div>
                  
                  {currentOrder && (
                    <div className="text-xs space-y-1">
                      <div className="font-medium">
                        ฿{currentOrder.total.toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        {new Date(currentOrder.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {table.status === 'open' && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </div>

        {tables.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <p className="text-gray-600">ไม่พบข้อมูลโต๊ะ</p>
          </div>
        )}
      </main>
    </div>
  )
}