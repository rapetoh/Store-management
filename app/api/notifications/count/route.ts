import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check and create expiration notifications
async function checkExpirationNotifications(expirationDaysThreshold = 30) {
  try {
    const today = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(today.getDate() + expirationDaysThreshold)

    const expiringAlerts = await prisma.expirationAlert.findMany({
      where: {
        isActive: true,
        currentQuantity: { gt: 0 },
        expirationDate: {
          gte: today,
          lte: thresholdDate
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        supplier: {
          select: {
            name: true
          }
        }
      }
    })

    for (const alert of expiringAlerts) {
      const daysUntilExpiration = Math.ceil((new Date(alert.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Vérifier s'il n'y a pas déjà une notification pour cette alerte
      const existingNotification = await prisma.notification.findFirst({
        where: {
          productId: alert.productId,
          type: 'expiration',
          isRead: false,
          metadata: {
            contains: `"expirationAlertId":"${alert.id}"`
          }
        }
      })

      if (!existingNotification) {
        const priority = daysUntilExpiration <= 7 ? 'critical' : daysUntilExpiration <= 14 ? 'high' : 'normal'
        
        await prisma.notification.create({
          data: {
            type: 'expiration',
            title: 'Produit expirant bientôt',
            message: `Le produit "${alert.product.name}" expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''} (${alert.currentQuantity} unités restantes)`,
            priority,
            productId: alert.productId,
            metadata: JSON.stringify({
              expirationAlertId: alert.id,
              expirationDate: alert.expirationDate,
              currentQuantity: alert.currentQuantity,
              supplierName: alert.supplier?.name,
              daysUntilExpiration
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des expirations:', error)
  }
}

// Check and create stock notifications
async function checkStockNotifications() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        sku: true
      }
    })

    for (const product of products) {
      // Check for out of stock
      if (product.stock === 0) {
        await createStockNotification('stock_out', product)
      }
      // Check for critical stock (less than 25% of min stock)
      else if (product.stock <= Math.max(1, Math.floor(product.minStock * 0.25))) {
        await createStockNotification('stock_critical', product)
      }
      // Check for low stock (less than or equal to min stock)
      else if (product.stock <= product.minStock) {
        await createStockNotification('stock_low', product)
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des niveaux de stock:', error)
  }
}

async function createStockNotification(type: string, product: any) {
  const existingNotification = await prisma.notification.findFirst({
    where: {
      productId: product.id,
      type: type,
      isRead: false
    }
  })

  if (!existingNotification) {
    let title: string, message: string, priority: string

    switch (type) {
      case 'stock_out':
        title = 'Rupture de stock'
        message = `Le produit "${product.name}" est en rupture de stock`
        priority = 'critical'
        break
      case 'stock_critical':
        title = 'Stock critique'
        message = `Le produit "${product.name}" est en stock critique (${product.stock} unités restantes)`
        priority = 'high'
        break
      case 'stock_low':
        title = 'Stock faible'
        message = `Le produit "${product.name}" est en stock faible (${product.stock} unités restantes)`
        priority = 'normal'
        break
      default:
        title = 'Notification de stock'
        message = `Mise à jour du stock pour ${product.name}`
        priority = 'normal'
        break
    }

    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        productId: product.id,
        metadata: JSON.stringify({
          productName: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock
        })
      }
    })
  }
}

// GET - Get notification counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    
    // Vérifier et créer les notifications automatiquement
    await Promise.all([
      checkStockNotifications(),
      checkExpirationNotifications(30) // Valeur fixe de 30 jours
    ])
    
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