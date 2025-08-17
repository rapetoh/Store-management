import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')

    // Build where clause for sales
    const saleWhere: any = {}
    
    if (startDate && endDate) {
      saleWhere.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get product performance data
    const productPerformance = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: saleWhere
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      }
    })

    // Get product details for each performance record
    const productsWithPerformance = await Promise.all(
      productPerformance.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            category: true,
            taxRate: true
          }
        })

        if (!product) return null

        // Calculate profit (totalPrice - (costPrice * quantity))
        const totalCost = (product.costPrice || 0) * (item._sum.quantity || 0)
        const totalRevenue = item._sum.totalPrice || 0
        const profit = totalRevenue - totalCost
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

        return {
          product,
          performance: {
            quantitySold: item._sum.quantity || 0,
            totalRevenue: totalRevenue,
            totalCost: totalCost,
            profit: profit,
            profitMargin: profitMargin,
            salesCount: item._count.id || 0
          }
        }
      })
    )

    // Filter out null products
    const validProducts = productsWithPerformance.filter(item => item !== null)

    // Apply category filter if specified
    const filteredProducts = categoryId 
      ? validProducts.filter(item => item!.product.categoryId === categoryId)
      : validProducts

    // Get category breakdown
    const categoryBreakdown = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: saleWhere
      },
      _sum: {
        totalPrice: true
      }
    })

    const categoryStats = await Promise.all(
      categoryBreakdown.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true }
        })
        return {
          categoryId: product?.categoryId,
          categoryName: product?.category?.name || 'Sans catégorie',
          revenue: item._sum.totalPrice || 0
        }
      })
    )

    // Group by category
    const categoryRevenue = categoryStats.reduce((acc, item) => {
      const key = item.categoryName
      if (!acc[key]) {
        acc[key] = { name: key, revenue: 0, count: 0 }
      }
      acc[key].revenue += item.revenue
      acc[key].count += 1
      return acc
    }, {} as Record<string, { name: string; revenue: number; count: number }>)

    return NextResponse.json({
      products: filteredProducts,
      categoryBreakdown: Object.values(categoryRevenue),
      summary: {
        totalProducts: filteredProducts.length,
        totalRevenue: filteredProducts.reduce((sum, item) => sum + item!.performance.totalRevenue, 0),
        totalProfit: filteredProducts.reduce((sum, item) => sum + item!.performance.profit, 0),
        averageProfitMargin: filteredProducts.length > 0 
          ? filteredProducts.reduce((sum, item) => sum + item!.performance.profitMargin, 0) / filteredProducts.length 
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching product performance report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product performance report' },
      { status: 500 }
    )
  }
} 