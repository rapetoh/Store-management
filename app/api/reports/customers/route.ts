import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause for sales
    const saleWhere: any = {}
    
    if (startDate && endDate) {
      saleWhere.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get customer spending data
    const customerSpending = await prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        ...saleWhere,
        customerId: { not: null }
      },
      _sum: {
        finalAmount: true,
        discountAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          finalAmount: 'desc'
        }
      }
    })

    // Get customer details for each spending record
    const customersWithSpending = await Promise.all(
      customerSpending.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId! }
        })

        if (!customer) return null

        // Calculate average order value
        const totalSpent = item._sum.finalAmount || 0
        const orderCount = item._count.id || 0
        const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0

        return {
          customer,
          spending: {
            totalSpent: totalSpent,
            totalDiscount: item._sum.discountAmount || 0,
            orderCount: orderCount,
            averageOrderValue: averageOrderValue
          }
        }
      })
    )

    // Filter out null customers
    const validCustomers = customersWithSpending.filter(item => item !== null)

    // Get customer segments based on spending
    const customerSegments = validCustomers.map(item => {
      const totalSpent = item!.spending.totalSpent
      let segment = 'Bronze'
      
      if (totalSpent >= 1000000) { // 1M FCFA
        segment = 'Diamant'
      } else if (totalSpent >= 500000) { // 500K FCFA
        segment = 'Or'
      } else if (totalSpent >= 200000) { // 200K FCFA
        segment = 'Argent'
      }

      return {
        ...item!,
        segment
      }
    })

    // Group by segment
    const segmentBreakdown = customerSegments.reduce((acc, item) => {
      const segment = item.segment
      if (!acc[segment]) {
        acc[segment] = {
          name: segment,
          count: 0,
          totalSpent: 0,
          averageSpent: 0
        }
      }
      acc[segment].count += 1
      acc[segment].totalSpent += item.spending.totalSpent
      return acc
    }, {} as Record<string, { name: string; count: number; totalSpent: number; averageSpent: number }>)

    // Calculate averages
    Object.keys(segmentBreakdown).forEach(segment => {
      const data = segmentBreakdown[segment]
      data.averageSpent = data.count > 0 ? data.totalSpent / data.count : 0
    })

    // Get top customers by spending
    const topCustomers = customerSegments
      .sort((a, b) => b.spending.totalSpent - a.spending.totalSpent)
      .slice(0, 10)

    // Get customer acquisition over time (if we have date data)
    const customerAcquisition = await prisma.customer.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      customers: customerSegments,
      topCustomers,
      segmentBreakdown: Object.values(segmentBreakdown),
      summary: {
        totalCustomers: validCustomers.length,
        totalRevenue: validCustomers.reduce((sum, item) => sum + item!.spending.totalSpent, 0),
        averageOrderValue: validCustomers.length > 0 
          ? validCustomers.reduce((sum, item) => sum + item!.spending.averageOrderValue, 0) / validCustomers.length 
          : 0,
        totalOrders: validCustomers.reduce((sum, item) => sum + item!.spending.orderCount, 0)
      },
      acquisitionData: customerAcquisition.map(item => ({
        date: item.createdAt,
        newCustomers: item._count.id
      }))
    })
  } catch (error) {
    console.error('Error fetching customer analysis report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer analysis report' },
      { status: 500 }
    )
  }
} 