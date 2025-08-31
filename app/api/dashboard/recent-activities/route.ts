import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get the 5 most recent activities from the logs table
    const recentActivities = await prisma.activityLog.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        action: true,
        details: true,
        user: true,
        financialImpact: true,
        category: true,
        timestamp: true
      }
    })

    // Transform the data to include formatted information
    const formattedActivities = recentActivities.map(activity => {
      // Determine the icon and color based on the action type
      let icon = 'activity'
      let color = 'blue'
      let bgColor = 'blue-100'
      let textColor = 'blue-800'

      switch (activity.action) {
        case 'vente':
        case 'sale':
          icon = 'shopping-cart'
          color = 'green'
          bgColor = 'green-100'
          textColor = 'green-800'
          break
        case 'ajout':
        case 'creation':
        case 'modification':
          icon = 'edit'
          color = 'blue'
          bgColor = 'blue-100'
          textColor = 'blue-800'
          break
        case 'suppression':
        case 'deletion':
          icon = 'trash'
          color = 'red'
          bgColor = 'red-100'
          textColor = 'red-800'
          break
        case 'ravitaillement':
        case 'replenishment':
          icon = 'package'
          color = 'purple'
          bgColor = 'purple-100'
          textColor = 'purple-800'
          break
        case 'ajustement':
        case 'adjustment':
          icon = 'settings'
          color = 'orange'
          bgColor = 'orange-100'
          textColor = 'orange-800'
          break
        default:
          icon = 'activity'
          color = 'gray'
          bgColor = 'gray-100'
          textColor = 'gray-800'
      }

      // Format the financial impact
      let financialDisplay = 'N/A'
      if (activity.financialImpact !== null && activity.financialImpact !== undefined) {
        const impact = activity.financialImpact
        if (impact > 0) {
          financialDisplay = `+${impact.toLocaleString('fr-FR')} FCFA`
        } else if (impact < 0) {
          financialDisplay = `${impact.toLocaleString('fr-FR')} FCFA`
        } else {
          financialDisplay = '0 FCFA'
        }
      }

      // Format the time
      const now = new Date()
      const activityTime = new Date(activity.timestamp)
      const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
      
      let timeDisplay = ''
      if (diffInMinutes < 1) {
        timeDisplay = 'À l\'instant'
      } else if (diffInMinutes < 60) {
        timeDisplay = `Il y a ${diffInMinutes} min`
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        timeDisplay = `Il y a ${hours}h`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        timeDisplay = `Il y a ${days}j`
      }

      return {
        id: activity.id,
        action: activity.action,
        details: activity.details,
        user: activity.user,
        financialImpact: activity.financialImpact,
        financialDisplay,
        category: activity.category,
        createdAt: activity.timestamp,
        timeDisplay,
        icon,
        color,
        bgColor,
        textColor
      }
    })

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des activités récentes' },
      { status: 500 }
    )
  }
} 