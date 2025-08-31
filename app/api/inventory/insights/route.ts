import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get inventory insights
export async function GET(request: NextRequest) {
  try {
    // Get total products count
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    })

    // Get total inventoried products count
    const totalInventoried = await prisma.product.count({
      where: {
        isActive: true,
        lastInventoryDate: {
          not: null
        }
      }
    })

    // Get inventory insights grouped by date
    const inventoryInsights = await prisma.product.groupBy({
      by: ['lastInventoryDate', 'lastInventoryStatus'],
      where: {
        isActive: true,
        lastInventoryDate: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        lastInventoryDate: 'desc'
      }
    })

    // Transform the data to match the expected format
    const insights = inventoryInsights.map(insight => ({
      date: insight.lastInventoryDate!.toISOString(),
      count: insight._count.id,
      status: insight.lastInventoryStatus as 'OK' | 'ADJUSTED'
    }))

    // Group by date and sum counts
    const groupedInsights = insights.reduce((acc, insight) => {
      const date = insight.date.split('T')[0] // Get just the date part
      if (!acc[date]) {
        acc[date] = {
          date: insight.date,
          count: 0,
          status: insight.status
        }
      }
      acc[date].count += insight.count
      return acc
    }, {} as Record<string, any>)

    // Convert back to array and sort by date
    const finalInsights = Object.values(groupedInsights).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json({
      insights: finalInsights,
      totalProducts,
      totalInventoried,
      summary: {
        totalSessions: finalInsights.length,
        averagePerSession: finalInsights.length > 0 
          ? Math.round(finalInsights.reduce((sum, insight) => sum + insight.count, 0) / finalInsights.length)
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching inventory insights:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des insights d\'inventaire' },
      { status: 500 }
    )
  }
} 