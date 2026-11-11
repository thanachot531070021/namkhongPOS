'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { brandConfig } from '@/lib/config'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface MenuItem {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  categoryId: string
  category: {
    name: string
  }
  isAvailable: boolean
}

interface Category {
  id: string
  name: string
}

interface OrderItem {
  id: string
  menuItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'queued' | 'cooking' | 'served' | 'cancelled'
  notes?: string
  menuItem: {
    name: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  tableId: string
  subtotal: number
  serviceCharge: number
  vat: number
  total: number
  isPaid: boolean
  isCompleted: boolean
  paymentMethod?: string
  orderItems: OrderItem[]
}

interface Table {
  id: string
  number: string
  status: string
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes: string
  imageUrl?: string
}

export default function OrderPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string

  const [table, setTable] = useState<Table | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tableId) {
      Promise.all([
        fetchTable(),
        fetchMenuItems(),
        fetchCategories(),
        fetchCurrentOrder()
      ]).finally(() => setLoading(false))
    }
  }, [tableId])

  const fetchTable = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}`)
      if (!response.ok) throw new Error('Table not found')
      const data = await response.json()
      setTable(data)
    } catch (error) {
      console.error('Error fetching table:', error)
      toast.error('ไม่พบข้อมูลโต๊ะ')
      router.push('/tables')
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      if (!response.ok) throw new Error('Failed to fetch menu')
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('ไม่สามารถโหลดเมนูได้')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCurrentOrder = async () => {
    try {
      const response = await fetch(`/api/orders/table/${tableId}/current`)
      if (response.ok) {
        const data = await response.json()
        setCurrentOrder(data)
      }
    } catch (error) {
      console.error('Error fetching current order:', error)
    }
  }

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.isAvailable
  })

  const addToCart = (menuItem: MenuItem, quantity: number = 1) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        notes: '',
        imageUrl: menuItem.imageUrl
      }])
    }
  }

  const updateCartItem = (menuItemId: string, updates: Partial<CartItem>) => {
    setCart(cart.map(item =>
      item.menuItemId === menuItemId ? { ...item, ...updates } : item
    ))
  }

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const serviceCharge = subtotal * (brandConfig.serviceRate / 100)
    const vat = (subtotal + serviceCharge) * (brandConfig.vatRate / 100)
    const total = subtotal + serviceCharge + vat
    
    return { subtotal, serviceCharge, vat, total }
  }

  const updateOrderItemStatus = async (orderItemId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/items/${orderItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Failed to update item status')
      
      fetchCurrentOrder()
      toast.success('อัปเดตสถานะแล้ว')
    } catch (error) {
      console.error('Error updating item status:', error)
      toast.error('ไม่สามารถอัปเดตสถานะได้')
    }
  }

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('กรุณาเลือกรายการอาหาร')
      return
    }

    try {
      const { subtotal, serviceCharge, vat, total } = calculateTotals()
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cart,
          subtotal,
          serviceCharge,
          vat,
          total
        })
      })

      if (!response.ok) throw new Error('Failed to submit order')

      toast.success('สั่งอาหารเรียบร้อย')
      setCart([])
      fetchCurrentOrder()
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('ไม่สามารถสั่งอาหารได้')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { subtotal, serviceCharge, vat, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/tables"
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                โต๊ะ {table?.number}
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {session?.user?.username}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Menu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเมนู..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        🍽️
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-lg text-blue-600">
                          ฿{item.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <p className="text-gray-600">ไม่พบเมนูที่ค้นหา</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Current Order Items */}
              {currentOrder && currentOrder.orderItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold text-lg mb-4">รายการที่สั่งแล้ว</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {currentOrder.orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{item.menuItem.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} x ฿{item.unitPrice.toLocaleString()}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {['queued', 'cooking', 'served'].map(status => (
                              <button
                                key={status}
                                onClick={() => updateOrderItemStatus(item.id, status)}
                                className={`text-xs px-2 py-1 rounded ${
                                  item.status === status
                                    ? status === 'queued' ? 'bg-yellow-100 text-yellow-800'
                                      : status === 'cooking' ? 'bg-orange-100 text-orange-800'
                                      : 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {status === 'queued' ? 'รอ' : status === 'cooking' ? 'ทำ' : 'เสร็จ'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="font-semibold">
                          ฿{item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-lg mb-4">รายการที่เลือก</h3>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีรายการ</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.menuItemId} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => updateCartItem(item.menuItemId, { 
                                    quantity: Math.max(1, item.quantity - 1) 
                                  })}
                                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartItem(item.menuItemId, { 
                                    quantity: item.quantity + 1 
                                  })}
                                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.menuItemId)}
                                  className="text-red-500 text-sm ml-2"
                                >
                                  ลบ
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="หมายเหตุ..."
                                value={item.notes}
                                onChange={(e) => updateCartItem(item.menuItemId, { notes: e.target.value })}
                                className="mt-2 w-full text-sm border border-gray-300 rounded px-2 py-1"
                              />
                            </div>
                            <div className="font-semibold ml-4">
                              ฿{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>ยอดรวม</span>
                        <span>฿{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>ค่าบริการ ({brandConfig.serviceRate}%)</span>
                        <span>฿{serviceCharge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>ภาษี ({brandConfig.vatRate}%)</span>
                        <span>฿{vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>รวมทั้งสิ้น</span>
                        <span>฿{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={submitOrder}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
                    >
                      สั่งอาหาร
                    </button>
                  </>
                )}
              </div>

              {/* Close Bill Button */}
              {currentOrder && session?.user?.role === 'cashier' && (
                <Link
                  href={`/receipt/${currentOrder.id}`}
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
                >
                  ปิดบิล
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}