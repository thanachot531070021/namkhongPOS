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

    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            isCompleted: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        number: 'asc'
      }
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}