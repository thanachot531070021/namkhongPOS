import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: {
        tableId: params.tableId,
        isCompleted: false
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'No active order found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching current order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}