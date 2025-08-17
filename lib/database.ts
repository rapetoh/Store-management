import { PrismaClient } from '@prisma/client'

// Create a global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database service class
export class DatabaseService {
  // Product operations
  static async getAllProducts() {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  static async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
  }

  static async getProductByBarcode(barcode: string) {
    return await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
      },
    })
  }

  static async getProductBySku(sku: string) {
    return await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    })
  }

  static async createProduct(data: {
    name: string
    description?: string
    price: number
    costPrice?: number
    stock?: number
    minStock?: number
    barcode?: string
    sku?: string
    categoryId?: string
    image?: string
  }) {
    return await prisma.product.create({
      data,
      include: {
        category: true,
      },
    })
  }

  static async updateProduct(id: string, data: any) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    })
  }

  static async deleteProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
  }

  static async updateStock(id: string, newStock: number, reason: string, type: string, reference?: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error('Product not found')

    const previousStock = product.stock

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    })

    // Create inventory movement record
    await prisma.inventoryMovement.create({
      data: {
        productId: id,
        type,
        quantity: newStock - previousStock,
        previousStock,
        newStock,
        reason,
        reference,
      },
    })

    return updatedProduct
  }

  // Category operations
  static async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  }

  static async createCategory(data: { name: string; description?: string }) {
    return await prisma.category.create({ data })
  }

  static async getCategoryByName(name: string) {
    return await prisma.category.findFirst({
      where: { name },
    })
  }

  // Customer operations
  static async getAllCustomers() {
    return await prisma.customer.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  static async getCustomerById(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
    })
  }

  static async getCustomerByPhone(phone: string) {
    return await prisma.customer.findFirst({
      where: { phone },
    })
  }

  static async getCustomerByLoyaltyCard(loyaltyCard: string) {
    return await prisma.customer.findFirst({
      where: { loyaltyCard },
    })
  }

  static async createCustomer(data: {
    name: string
    email?: string
    phone?: string
    address?: string
    loyaltyCard?: string
  }) {
    return await prisma.customer.create({ data })
  }

  static async updateCustomer(id: string, data: any) {
    return await prisma.customer.update({
      where: { id },
      data,
    })
  }

  // Sale operations
  static async createSale(data: {
    customerId?: string
    totalAmount: number
    discountAmount?: number
    taxAmount?: number
    finalAmount: number
    paymentMethod: string
    paymentStatus?: string
    notes?: string
    cashierId?: string
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      discount?: number
      totalPrice: number
    }>
  }) {
    return await prisma.sale.create({
      data: {
        customerId: data.customerId,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        taxAmount: data.taxAmount || 0,
        finalAmount: data.finalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'completed',
        notes: data.notes,
        cashierId: data.cashierId,
        items: {
          create: data.items,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  static async getAllSales() {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    })

    // Transform the data to match frontend expectations
    return sales.map(sale => ({
      id: sale.id,
      customer: sale.customer?.name || 'Client anonyme',
      date: sale.saleDate.toLocaleDateString('fr-FR'),
      time: sale.saleDate.toLocaleTimeString('fr-FR'),
      total: sale.finalAmount, // Map finalAmount to total
      status: sale.paymentStatus === 'completed' ? 'Payé' : 'En cours',
      items: sale.items.length,
      paymentMethod: sale.paymentMethod,
      cashier: 'Caissier actuel', // Default value
      notes: sale.notes,
      saleItems: sale.items,
      customerInfo: sale.customer,
      appliedPromos: [], // Will be populated if needed
      appliedDiscount: null, // Will be populated if needed
    }))
  }

  static async getSaleById(id: string) {
    return await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  static async updateSale(id: string, data: { notes?: string; paymentMethod?: string }) {
    return await prisma.sale.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  static async cancelSale(id: string) {
    // Get the sale with items
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!sale) {
      throw new Error('Sale not found')
    }

    // Restore stock for all items
    for (const item of sale.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (product) {
        const newStock = product.stock + item.quantity
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        })

        // Create inventory movement record
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'in',
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: 'Sale cancellation',
            reference: `Sale ${id} cancelled`,
          },
        })
      }
    }

    // Mark sale as cancelled
    return await prisma.sale.update({
      where: { id },
      data: { 
        paymentStatus: 'cancelled',
        notes: sale.notes ? `${sale.notes}\n\n[VENTE ANNULLÉE - ${new Date().toLocaleString('fr-FR')}]` : `[VENTE ANNULLÉE - ${new Date().toLocaleString('fr-FR')}]`
      },
    })
  }

  static async processReturn(saleId: string, returnItems: Array<{ itemId: string; quantity: number; reason: string }>, reason: string) {
    // Get the sale with items
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!sale) {
      throw new Error('Sale not found')
    }

    let totalReturnAmount = 0

    // Process each returned item
    for (const returnItem of returnItems) {
      const saleItem = sale.items.find(item => item.id === returnItem.itemId)
      
      if (!saleItem) {
        throw new Error(`Sale item ${returnItem.itemId} not found`)
      }

      if (returnItem.quantity > saleItem.quantity) {
        throw new Error(`Return quantity exceeds original quantity for item ${saleItem.product.name}`)
      }

      // Restore stock
      const product = await prisma.product.findUnique({
        where: { id: saleItem.productId },
      })

      if (product) {
        const newStock = product.stock + returnItem.quantity
        await prisma.product.update({
          where: { id: saleItem.productId },
          data: { stock: newStock },
        })

        // Create inventory movement record
        await prisma.inventoryMovement.create({
          data: {
            productId: saleItem.productId,
            type: 'in',
            quantity: returnItem.quantity,
            previousStock: product.stock,
            newStock,
            reason: `Return: ${reason}`,
            reference: `Sale ${saleId} return`,
          },
        })
      }

      totalReturnAmount += returnItem.quantity * saleItem.unitPrice
    }

    // Update sale notes with return information
    const returnNote = `\n\n[RETOUR - ${new Date().toLocaleString('fr-FR')}]\nRaison: ${reason}\nArticles retournés: ${returnItems.map(item => {
      const saleItem = sale.items.find(si => si.id === item.itemId)
      return `${saleItem?.product.name} (${item.quantity})`
    }).join(', ')}\nMontant retourné: €${totalReturnAmount.toFixed(2)}`

    await prisma.sale.update({
      where: { id: saleId },
      data: {
        notes: sale.notes ? sale.notes + returnNote : returnNote,
      },
    })

    return {
      success: true,
      totalReturnAmount,
      returnedItems: returnItems.length,
    }
  }

  // Promo code operations
  static async getAllPromoCodes() {
    return await prisma.promoCode.findMany({
      where: {
        isActive: true,
        validUntil: {
          gte: new Date(),
        },
      },
      orderBy: {
        code: 'asc',
      },
    })
  }

  static async getAllPromoCodesIncludingExpired() {
    return await prisma.promoCode.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    })
  }

  static async getPromoCodeByCode(code: string) {
    return await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validUntil: {
          gte: new Date(),
        },
      },
    })
  }

  static async createPromoCode(data: {
    code: string
    type: string
    value: number
    minAmount?: number
    maxUses?: number
    validUntil: Date
    description?: string
  }) {
    return await prisma.promoCode.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    })
  }

  static async updatePromoCodeUsage(id: string) {
    return await prisma.promoCode.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    })
  }

  // Settings operations
  static async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    })
    return setting?.value
  }

  static async setSetting(key: string, value: string, description?: string) {
    return await prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    })
  }

  // Dashboard statistics
  static async getDashboardStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalProducts,
      lowStockProducts,
      totalSales,
      todaySales,
      totalCustomers,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
      }),
      prisma.sale.count(),
      prisma.sale.count({
        where: {
          saleDate: {
            gte: today,
          },
        },
      }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.sale.aggregate({
        _sum: {
          finalAmount: true,
        },
      }),
      prisma.sale.aggregate({
        _sum: {
          finalAmount: true,
        },
        where: {
          saleDate: {
            gte: today,
          },
        },
      }),
    ])

    return {
      totalProducts,
      lowStockProducts,
      totalSales,
      todaySales,
      totalCustomers,
      totalRevenue: totalRevenue._sum.finalAmount || 0,
      todayRevenue: todayRevenue._sum.finalAmount || 0,
    }
  }

  // Cash Session operations
  static async openCashSession(data: {
    openingAmount: number
    cashierId?: string
    cashierName?: string
    notes?: string
  }) {
    // Check if there's already an open session
    const openSession = await prisma.cashSession.findFirst({
      where: { status: 'open' },
    })

    if (openSession) {
      throw new Error('Une session de caisse est déjà ouverte')
    }

    return await prisma.cashSession.create({
      data: {
        ...data,
        sessionDate: new Date(),
        startTime: new Date(),
        status: 'open',
      },
    })
  }

  static async closeCashSession(sessionId: string, data: {
    closingAmount: number
    actualAmount: number
    notes?: string
  }) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session de caisse non trouvée')
    }

    if (session.status !== 'open' && session.status !== 'counted') {
      throw new Error('Cette session de caisse n\'est pas ouverte')
    }

    // Calculate expected amount from sales
    const salesData = await prisma.sale.aggregate({
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        saleDate: {
          gte: session.startTime,
        },
        paymentMethod: 'cash',
      },
    })

    const expectedAmount = session.openingAmount + (salesData._sum.finalAmount || 0)
    const difference = expectedAmount - data.actualAmount

    return await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        ...data,
        expectedAmount,
        difference,
        totalSales: salesData._sum.finalAmount || 0,
        totalTransactions: salesData._count.id || 0,
        endTime: new Date(),
        status: 'closed',
      },
    })
  }

  static async countCash(sessionId: string, data: {
    actualAmount: number
    notes?: string
  }) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session de caisse non trouvée')
    }

    if (session.status === 'closed') {
      throw new Error('Cette session de caisse est déjà fermée')
    }

    // Calculate expected amount from sales
    const salesData = await prisma.sale.aggregate({
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        saleDate: {
          gte: session.startTime,
        },
        paymentMethod: 'cash',
      },
    })

    const expectedAmount = session.openingAmount + (salesData._sum.finalAmount || 0)
    const difference = expectedAmount - data.actualAmount

    return await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        ...data,
        expectedAmount,
        difference,
        totalSales: salesData._sum.finalAmount || 0,
        totalTransactions: salesData._count.id || 0,
        status: 'counted',
      },
    })
  }

  static async getCurrentCashSession() {
    return await prisma.cashSession.findFirst({
      where: { 
        OR: [
          { status: 'open' },
          { status: 'counted' },
          { endTime: null }
        ]
      },
      orderBy: { startTime: 'desc' },
    })
  }

  static async getCashSessionHistory(limit = 10) {
    return await prisma.cashSession.findMany({
      orderBy: { sessionDate: 'desc' },
      take: limit,
    })
  }

  static async getCashSessionById(id: string) {
    return await prisma.cashSession.findUnique({
      where: { id },
    })
  }

  static async updateCashSessionSales(sessionId: string, saleAmount: number) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session de caisse non trouvée')
    }

    if (session.status === 'closed') {
      throw new Error('Cette session de caisse est déjà fermée')
    }

    // Update the session with the new sale amount
    return await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        totalSales: session.totalSales + saleAmount,
        totalTransactions: session.totalTransactions + 1,
      },
    })
  }

  static async recalculateCashSessionTotals(sessionId: string) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session de caisse non trouvée')
    }

    // Get all cash sales from the session start time
    const salesData = await prisma.sale.aggregate({
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        saleDate: {
          gte: session.startTime,
        },
        paymentMethod: 'cash',
      },
    })

    const totalSales = salesData._sum.finalAmount || 0
    const expectedAmount = session.openingAmount + totalSales

    // Update the session with recalculated totals
    return await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        totalSales,
        totalTransactions: salesData._count.id || 0,
        expectedAmount,
      },
    })
  }

  static async updateCashSession(sessionId: string, updates: any) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session de caisse non trouvée')
    }

    // Prepare update data
    const updateData: any = {}

    // Allow updating specific fields
    if (updates.actualAmount !== undefined) {
      updateData.actualAmount = updates.actualAmount
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes
    }

    // Recalculate difference if actual amount changed
    if (updates.actualAmount !== undefined) {
      const expectedAmount = session.expectedAmount || (session.openingAmount + session.totalSales)
      updateData.difference = expectedAmount - updates.actualAmount
    }

    // Update the session
    return await prisma.cashSession.update({
      where: { id: sessionId },
      data: updateData,
    })
  }

  static async createUnassignedCashSession() {
    // Create a temporary session for unassigned cash sales
    return await prisma.cashSession.create({
      data: {
        sessionDate: new Date(),
        startTime: new Date(),
        openingAmount: 0,
        totalSales: 0,
        totalTransactions: 0,
        status: 'unassigned',
        cashierName: 'Ventes non assignées',
        notes: 'Session automatique pour ventes sans caisse ouverte',
      },
    })
  }

  // Tax Rate Management
  static async getTaxRates() {
    return await prisma.taxRate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })
  }

  static async getDefaultTaxRate() {
    return await prisma.taxRate.findFirst({
      where: { isDefault: true }
    })
  }

  static async createTaxRate(data: {
    name: string
    rate: number
    isDefault?: boolean
    description?: string
  }) {
    // If this is the new default, unset the current default
    if (data.isDefault) {
      await prisma.taxRate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    return await prisma.taxRate.create({
      data: {
        name: data.name,
        rate: data.rate,
        isDefault: data.isDefault || false,
        description: data.description
      }
    })
  }

  static async updateTaxRate(id: string, data: {
    name?: string
    rate?: number
    isDefault?: boolean
    description?: string
    isActive?: boolean
  }) {
    // If this is the new default, unset the current default
    if (data.isDefault) {
      await prisma.taxRate.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    return await prisma.taxRate.update({
      where: { id },
      data
    })
  }

  static async deleteTaxRate(id: string) {
    // Check if tax rate is used by any products
    const productsUsingTaxRate = await prisma.product.count({
      where: { taxRateId: id }
    })

    if (productsUsingTaxRate > 0) {
      throw new Error(`Ce taux de TVA est utilisé par ${productsUsingTaxRate} produit(s) et ne peut pas être supprimé`)
    }

    return await prisma.taxRate.delete({
      where: { id }
    })
  }
}

export default DatabaseService 