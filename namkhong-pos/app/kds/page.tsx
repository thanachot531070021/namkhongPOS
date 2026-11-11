'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { brandConfig } from '@/lib/config'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface OrderItem {
  id: string
  quantity: number
  status: 'queued' | 'cooking' | 'served' | 'cancelled'
  notes?: string
  createdAt: string
  menuItem: {
    name: string
    description?: string
  }
  order: {
    id: string
    table: {
      number: string
    }
    createdAt: string
  }
}

export default function KDSPage() {
  const { data: session, status } = useSession()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'queued' | 'cooking'>('all')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrderItems()
      const interval = setInterval(fetchOrderItems, 5000) // Auto refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchOrderItems = async () => {
    try {
      const response = await fetch('/api/kds/orders')
      if (!response.ok) throw new Error('Failed to fetch order items')
      const data = await response.json()
      setOrderItems(data)
    } catch (error) {
      console.error('Error fetching order items:', error)
      if (!loading) {
        toast.error('ไม่สามารถโหลดคิวงานได้')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      // Update local state
      setOrderItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, status: newStatus as any } : item
        )
      )
      
      const statusText = {
        'cooking': 'เริ่มทำอาหาร',
        'served': 'เสิร์ฟแล้ว',
        'cancelled': 'ยกเลิก'
      }[newStatus] || 'อัปเดต'
      
      toast.success(`${statusText}เรียบร้อย`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('ไม่สามารถอัปเดตสถานะได้')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cooking':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'served':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued':
        return 'รอทำ'
      case 'cooking':
        return 'กำลังทำ'
      case 'served':
        return 'เสิร์ฟแล้ว'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const getTimeDifference = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'เพิ่งสั่ง'
    if (diffInMinutes < 60) return `${diffInMinutes} นาที`
    
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return `${hours}:${minutes.toString().padStart(2, '0')} ชม.`
  }

  const filteredItems = orderItems.filter(item => {
    if (filter === 'all') return item.status !== 'served' && item.status !== 'cancelled'
    return item.status === filter
  })

  const groupedItems = filteredItems.reduce((groups, item) => {
    const orderId = item.order.id
    if (!groups[orderId]) {
      groups[orderId] = {
        orderId,
        tableNumber: item.order.table.number,
        createdAt: item.order.createdAt,
        items: []
      }
    }
    groups[orderId].items.push(item)
    return groups
  }, {} as Record<string, any>)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดคิวงาน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {brandConfig.name}
              </h1>
              <span className="ml-4 px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                ครัว - KDS
              </span>
              <div className="ml-6 text-sm text-gray-600">
                อัปเดตล่าสุด: {format(new Date(), 'HH:mm:ss', { locale: th })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilter('queued')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'queued' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  รอทำ
                </button>
                <button
                  onClick={() => setFilter('cooking')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'cooking' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  กำลังทำ
                </button>
              </div>
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

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              ไม่มีคิวงาน
            </h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'ไม่มีออเดอร์ที่ต้องทำ' : `ไม่มีรายการที่${filter === 'queued' ? 'รอทำ' : 'กำลังทำ'}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(groupedItems).map((group: any) => (
              <div key={group.orderId} className="bg-white rounded-lg shadow-sm border p-4">
                {/* Order Header */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                  <div>
                    <h3 className="font-bold text-lg">โต๊ะ {group.tableNumber}</h3>
                    <p className="text-sm text-gray-600">
                      เวลาสั่ง: {format(new Date(group.createdAt), 'HH:mm', { locale: th })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded ${
                      getTimeDifference(group.createdAt).includes('ชม.') 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getTimeDifference(group.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {group.items.map((item: OrderItem) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.menuItem.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            จำนวน: {item.quantity}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-blue-600 mt-1">
                              หมายเหตุ: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        {item.status === 'queued' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'cooking')}
                            className="flex-1 bg-orange-600 text-white py-1 px-3 rounded text-sm hover:bg-orange-700 transition-colors"
                          >
                            เริ่มทำ
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'served')}
                            className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            เสิร์ฟแล้ว
                          </button>
                        )}
                        {(item.status === 'queued' || item.status === 'cooking') && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'cancelled')}
                            className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}