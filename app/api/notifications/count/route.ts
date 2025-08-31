import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get notification counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    
    // Build where clause
    const where: any = {
      isRead: false
    }
    
    if (type) {
      where.type = type
    }
    
    // Get counts
    const [unreadCount, totalCount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count()
    ])
    
    // Get counts by type
    const countsByType = await prisma.notification.groupBy({
      by: ['type', 'isRead'],
      where: {
        isRead: false
      },
      _count: {
        id: true
      }
    })
    
    // Format counts by type
    const typeCounts = countsByType.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = 0
      }
      acc[item.type] += item._count.id
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      unreadCount,
      totalCount,
      typeCounts
    })
  } catch (error) {
    console.error('Error getting notification counts:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des compteurs de notifications' },
      { status: 500 }
    )
  }
} 