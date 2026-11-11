import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ['queued', 'cooking', 'served', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const orderItem = await prisma.orderItem.update({
      where: {
        id: params.itemId
      },
      data: {
        status: status
      }
    })

    return NextResponse.json(orderItem)
  } catch (error) {
    console.error('Error updating order item status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}