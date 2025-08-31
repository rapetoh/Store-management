import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface NotificationData {
  type: 'stock_low' | 'stock_critical' | 'stock_out' | 'sale' | 'replenishment' | 'system'
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  productId?: string
  metadata?: any
}

export class NotificationService {
  // Create a notification
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          productId: data.productId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      })
      
      console.log(`📢 Notification créée: ${data.title}`)
      return notification
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error)
      throw error
    }
  }

  // Check stock levels and create notifications
  static async checkStockLevels() {
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
          await this.createStockOutNotification(product)
        }
        // Check for critical stock (less than 25% of min stock)
        else if (product.stock <= Math.max(1, Math.floor(product.minStock * 0.25))) {
          await this.createCriticalStockNotification(product)
        }
        // Check for low stock (less than or equal to min stock)
        else if (product.stock <= product.minStock) {
          await this.createLowStockNotification(product)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des niveaux de stock:', error)
    }
  }

  // Create stock out notification
  static async createStockOutNotification(product: { id: string; name: string; sku?: string }) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        productId: product.id,
        type: 'stock_out',
        isRead: false
      }
    })

    if (!existingNotification) {
      await this.createNotification({
        type: 'stock_out',
        title: 'Rupture de stock',
        message: `Le produit "${product.name}" est en rupture de stock`,
        priority: 'critical',
        productId: product.id,
        metadata: {
          productName: product.name,
          sku: product.sku,
          stock: 0
        }
      })
    }
  }

  // Create critical stock notification
  static async createCriticalStockNotification(product: { id: string; name: string; stock: number; minStock: number; sku?: string }) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        productId: product.id,
        type: 'stock_critical',
        isRead: false
      }
    })

    if (!existingNotification) {
      await this.createNotification({
        type: 'stock_critical',
        title: 'Stock critique',
        message: `Le produit "${product.name}" est en stock critique (${product.stock} unités restantes)`,
        priority: 'high',
        productId: product.id,
        metadata: {
          productName: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock
        }
      })
    }
  }

  // Create low stock notification
  static async createLowStockNotification(product: { id: string; name: string; stock: number; minStock: number; sku?: string }) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        productId: product.id,
        type: 'stock_low',
        isRead: false
      }
    })

    if (!existingNotification) {
      await this.createNotification({
        type: 'stock_low',
        title: 'Stock faible',
        message: `Le produit "${product.name}" est en stock faible (${product.stock} unités restantes)`,
        priority: 'normal',
        productId: product.id,
        metadata: {
          productName: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock
        }
      })
    }
  }

  // Create sale notification
  static async createSaleNotification(saleData: { id: string; total: number; items: any[] }) {
    await this.createNotification({
      type: 'sale',
      title: 'Nouvelle vente',
      message: `Vente effectuée pour ${saleData.total.toLocaleString('fr-FR')} FCFA`,
      priority: 'normal',
      metadata: {
        saleId: saleData.id,
        total: saleData.total,
        itemCount: saleData.items.length
      }
    })
  }

  // Create replenishment notification
  static async createReplenishmentNotification(replenishmentData: { productName: string; quantity: number; totalPrice: number }) {
    await this.createNotification({
      type: 'replenishment',
      title: 'Ravitaillement effectué',
      message: `Ravitaillement de ${replenishmentData.quantity} unités de "${replenishmentData.productName}" pour ${replenishmentData.totalPrice.toLocaleString('fr-FR')} FCFA`,
      priority: 'normal',
      metadata: {
        productName: replenishmentData.productName,
        quantity: replenishmentData.quantity,
        totalPrice: replenishmentData.totalPrice
      }
    })
  }

  // Get unread notification count
  static async getUnreadCount() {
    return await prisma.notification.count({
      where: {
        isRead: false
      }
    })
  }

  // Mark notifications as read
  static async markAsRead(notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      return await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          }
        },
        data: {
          isRead: true
        }
      })
    } else {
      return await prisma.notification.updateMany({
        where: {
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    }
  }

  // Delete notifications
  static async deleteNotifications(notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      return await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationIds
          }
        }
      })
    } else {
      return await prisma.notification.deleteMany({})
    }
  }
} 