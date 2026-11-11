import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only kitchen role can access KDS
    if (session.user.role !== 'kitchen' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          isCompleted: false
        }
      },
      include: {
        menuItem: true,
        order: {
          include: {
            table: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(orderItems)
  } catch (error) {
    console.error('Error fetching KDS orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}