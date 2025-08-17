import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')
    const customerId = searchParams.get('customerId')

    // Build where clause
    const where: any = {}
    
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    if (customerId) {
      where.customerId = customerId
    }

    // Get sales data
    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
                taxRate: true
              }
            }
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      }
    })

    // Calculate totals
    const totals = await prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
        discountAmount: true,
        taxAmount: true,
        finalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Group by date for chart data
    const salesByDate = await prisma.sale.groupBy({
      by: ['saleDate'],
      where,
      _sum: {
        finalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        saleDate: 'asc'
      }
    })

    // Payment method breakdown
    const paymentMethodBreakdown = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: {
        finalAmount: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      sales,
      totals: {
        totalSales: totals._count.id || 0,
        totalAmount: totals._sum.totalAmount || 0,
        totalDiscount: totals._sum.discountAmount || 0,
        totalTax: totals._sum.taxAmount || 0,
        totalRevenue: totals._sum.finalAmount || 0
      },
      chartData: salesByDate.map(item => ({
        date: item.saleDate,
        revenue: item._sum.finalAmount || 0,
        salesCount: item._count.id || 0
      })),
      paymentMethods: paymentMethodBreakdown.map(item => ({
        method: item.paymentMethod,
        amount: item._sum.finalAmount || 0,
        count: item._count.id || 0
      }))
    })
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    )
  }
} 