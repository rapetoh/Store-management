import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, deleteAll = false } = body
    
    if (deleteAll) {
      // Delete all notifications
      const result = await prisma.notification.deleteMany({})
      
      return NextResponse.json({ 
        message: 'Toutes les notifications ont été supprimées',
        deletedCount: result.count
      })
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Delete specific notifications
      const result = await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationIds
          }
        }
      })
      
      return NextResponse.json({ 
        message: `${result.count} notification(s) supprimée(s)`,
        deletedCount: result.count
      })
    } else {
      return NextResponse.json(
        { error: 'IDs de notifications requis ou supprimer tout' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des notifications' },
      { status: 500 }
    )
  }
} 