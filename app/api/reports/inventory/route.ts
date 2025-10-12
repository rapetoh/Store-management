import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get('categoryId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')
    // Note: For inventory analysis, date filters can show inventory movements trends

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

    // Build where clause for movements
    const movementWhere: any = {}
    
    if (startDate && endDate) {
      movementWhere.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (categoryId) {
      movementWhere.product = {
        categoryId: categoryId
      }
    }
    
    // Get recent inventory movements
    const recentMovements = await prisma.inventoryMovement.findMany({
      where: movementWhere,
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

    // Get movement statistics by type (exclude 'in' type movements as they're rare)
    const movementStats = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      where: {
        ...movementWhere,
        type: {
          not: 'in'
        }
      },
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

    // Get inventory time threshold from settings (default: 24 hours)
    const notWorkedOnHoursSetting = await prisma.userSettings.findUnique({
      where: { key: 'notWorkedOnHours' }
    })
    const notWorkedOnHours = notWorkedOnHoursSetting ? parseInt(notWorkedOnHoursSetting.value) : 24

    // Calculate cutoff date for "recently inventoried" products
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - notWorkedOnHours)

    // Inventory Insights - Date-based analysis
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const inventoryInsights = {
      // Products inventoried recently
      inventoriedLast30Days: products.filter(p => 
        p.lastInventoryDate && new Date(p.lastInventoryDate) >= thirtyDaysAgo
      ).length,
      
      // Products not inventoried in various periods
      notInventoried30Days: products.filter(p => 
        !p.lastInventoryDate || new Date(p.lastInventoryDate) < thirtyDaysAgo
      ).length,
      
      notInventoried60Days: products.filter(p => 
        !p.lastInventoryDate || new Date(p.lastInventoryDate) < sixtyDaysAgo
      ).length,
      
      notInventoried90Days: products.filter(p => 
        !p.lastInventoryDate || new Date(p.lastInventoryDate) < ninetyDaysAgo
      ).length,
      
      // Never inventoried
      neverInventoried: products.filter(p => !p.lastInventoryDate).length,
      
      // Inventory status breakdown (using time threshold)
      inventoryStatusOK: products.filter(p => 
        p.lastInventoryStatus === 'OK' && 
        p.lastInventoryDate && 
        new Date(p.lastInventoryDate) >= cutoffDate
      ).length,
      inventoryStatusAdjusted: products.filter(p => 
        p.lastInventoryStatus === 'ADJUSTED' && 
        p.lastInventoryDate && 
        new Date(p.lastInventoryDate) >= cutoffDate
      ).length,
      inventoryStatusUnknown: products.filter(p => 
        !p.lastInventoryStatus || 
        !p.lastInventoryDate || 
        new Date(p.lastInventoryDate) < cutoffDate
      ).length,
      
      // Age analysis
      totalProducts: products.length,
      inventoriedProducts: products.filter(p => p.lastInventoryDate).length,
      
      // Value at risk (products not inventoried in 60+ days)
      valueAtRisk: products
        .filter(p => !p.lastInventoryDate || new Date(p.lastInventoryDate) < sixtyDaysAgo)
        .reduce((sum, p) => sum + (p.stock * p.price), 0),
      
      // Average days since last inventory
      averageDaysSinceInventory: (() => {
        const inventoriedProducts = products.filter(p => p.lastInventoryDate)
        if (inventoriedProducts.length === 0) return null
        
        const totalDays = inventoriedProducts.reduce((sum, p) => {
          const daysSince = Math.floor((now.getTime() - new Date(p.lastInventoryDate!).getTime()) / (1000 * 60 * 60 * 24))
          return sum + daysSince
        }, 0)
        
        return Math.round(totalDays / inventoriedProducts.length)
      })()
    }

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
      needsReorder,
      insights: inventoryInsights
    })
  } catch (error) {
    console.error('Error fetching inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory report' },
      { status: 500 }
    )
  }
} 