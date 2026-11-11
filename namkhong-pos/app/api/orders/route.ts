import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId, items, subtotal, serviceCharge, vat, total } = await request.json()

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if there's an active order for this table
      let order = await tx.order.findFirst({
        where: {
          tableId: tableId,
          isCompleted: false
        }
      })

      // If no active order, create a new one
      if (!order) {
        order = await tx.order.create({
          data: {
            tableId: tableId,
            userId: session.user.id,
            subtotal: 0,
            serviceCharge: 0,
            vat: 0,
            total: 0,
            isPaid: false,
            isCompleted: false
          }
        })

        // Update table status to open
        await tx.table.update({
          where: { id: tableId },
          data: { status: 'open' }
        })
      }

      // Add items to the order
      const orderItems = []
      for (const item of items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            status: 'queued',
            notes: item.notes || null
          }
        })
        orderItems.push(orderItem)
      }

      // Update order totals
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal: { increment: subtotal },
          serviceCharge: { increment: serviceCharge },
          vat: { increment: vat },
          total: { increment: total }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      })

      return updatedOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}