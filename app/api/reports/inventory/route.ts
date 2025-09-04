import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get('categoryId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    // Note: startDate and endDate parameters are ignored for inventory 
    // as inventory represents current state, not historical data

    // Build where clause for products
    const productWhere: any = {
      isActive: true
    }

    if (categoryId) {
      productWhere.categoryId = categoryId
    }

    if (lowStock) {
      productWhere.stock = {
        lte: prisma.product.fields.minStock
      }
    }

    if (outOfStock) {
      productWhere.stock = 0
    }

    // Get inventory data
    const products = await prisma.product.findMany({
      where: productWhere,
      include: {
        category: true,
        taxRate: true
      },
      orderBy: {
        stock: 'asc'
      }
    })

    // Calculate inventory metrics
    const inventoryMetrics = products.reduce((acc, product) => {
      const stockValue = product.stock * product.price
      const costValue = product.stock * (product.costPrice || 0)
      
      acc.totalProducts += 1
      acc.totalStock += product.stock
      acc.totalValue += stockValue
      acc.totalCost += costValue
      
      if (product.stock <= product.minStock) {
        acc.lowStockProducts += 1
      }
      
      if (product.stock === 0) {
        acc.outOfStockProducts += 1
      }

      return acc
    }, {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      totalCost: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    })

    // Get recent inventory movements
    const recentMovements = await prisma.inventoryMovement.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Get movement statistics by type
    const movementStats = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      }
    })

    // Get category breakdown for inventory value
    const categoryInventory = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Sans catégorie'
      const stockValue = product.stock * product.price
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          productCount: 0,
          totalStock: 0,
          totalValue: 0
        }
      }
      
      acc[categoryName].productCount += 1
      acc[categoryName].totalStock += product.stock
      acc[categoryName].totalValue += stockValue
      
      return acc
    }, {} as Record<string, { name: string; productCount: number; totalStock: number; totalValue: number }>)

    // Get top products by stock value
    const topStockValue = products
      .map(product => ({
        product,
        stockValue: product.stock * product.price
      }))
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 10)

    // Get products that need reordering
    const needsReorder = products.filter(product => 
      product.stock <= product.minStock && product.stock > 0
    )

    return NextResponse.json({
      products,
      metrics: {
        ...inventoryMetrics,
        averageStockValue: inventoryMetrics.totalProducts > 0 
          ? inventoryMetrics.totalValue / inventoryMetrics.totalProducts 
          : 0,
        profitMargin: inventoryMetrics.totalValue > 0 
          ? ((inventoryMetrics.totalValue - inventoryMetrics.totalCost) / inventoryMetrics.totalValue) * 100 
          : 0
      },
      recentMovements,
      movementStats: movementStats.map(stat => ({
        type: stat.type,
        totalQuantity: stat._sum.quantity || 0,
        count: stat._count.id || 0
      })),
      categoryBreakdown: Object.values(categoryInventory),
      topStockValue,
      needsReorder
    })
  } catch (error) {
    console.error('Error fetching inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory report' },
      { status: 500 }
    )
  }
} 