import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, markAll = false } = body
    
    if (markAll) {
      // Mark all unread notifications as read
      await prisma.notification.updateMany({
        where: {
          isRead: false
        },
        data: {
          isRead: true
        }
      })
      
      return NextResponse.json({ 
        message: 'Toutes les notifications ont été marquées comme lues',
        updatedCount: 'all'
      })
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          }
        },
        data: {
          isRead: true
        }
      })
      
      return NextResponse.json({ 
        message: `${result.count} notification(s) marquée(s) comme lue(s)`,
        updatedCount: result.count
      })
    } else {
      return NextResponse.json(
        { error: 'IDs de notifications requis ou marquer tout' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Erreur lors du marquage des notifications' },
      { status: 500 }
    )
  }
} 