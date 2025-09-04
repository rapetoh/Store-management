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
        supplier: true,
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
        supplier: true,
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
    supplierId?: string
    image?: string
  }) {
    return await prisma.product.create({
      data,
      include: {
        category: true,
        supplier: true,
      },
    })
  }

  static async updateProduct(id: string, data: any) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        supplier: true,
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

  // Supplier operations
  static async getAllSuppliers() {
    return await prisma.supplier.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  static async searchSuppliers(searchTerm: string) {
    return await prisma.supplier.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } }
        ]
      },
      orderBy: {
        name: 'asc'
      },
      take: 10 // Limit results
    })
  }

  static async createSupplier(data: {
    name: string
    email?: string
    phone?: string
    address?: string
    contactPerson?: string
    website?: string
    notes?: string
  }) {
    return await prisma.supplier.create({ data })
  }

  static async getSupplierById(id: string) {
    return await prisma.supplier.findUnique({
      where: { id },
    })
  }

  static async getSupplierByName(name: string) {
    return await prisma.supplier.findFirst({
      where: { name },
    })
  }

  static async updateSupplier(id: string, data: any) {
    return await prisma.supplier.update({
      where: { id },
      data,
    })
  }

  static async deleteSupplier(id: string) {
    return await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
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
    // Generate auto-incremented loyalty card if not provided
    let loyaltyCard = data.loyaltyCard
    if (!loyaltyCard) {
      loyaltyCard = await this.generateNextLoyaltyCard()
    }
    
    return await prisma.customer.create({ 
      data: { ...data, loyaltyCard }
    })
  }

  static async generateNextLoyaltyCard(): Promise<string> {
    // Find the highest existing loyalty card number
    const customers = await prisma.customer.findMany({
      where: {
        loyaltyCard: {
          startsWith: 'LOY'
        }
      },
      select: {
        loyaltyCard: true
      },
      orderBy: {
        loyaltyCard: 'desc'
      },
      take: 1
    })

    if (customers.length === 0) {
      // No existing loyalty cards, start with LOY001
      return 'LOY001'
    }

    const lastLoyaltyCard = customers[0].loyaltyCard
    if (!lastLoyaltyCard) {
      return 'LOY001'
    }

    // Extract the number part and increment it
    const match = lastLoyaltyCard.match(/LOY(\d+)/)
    if (!match) {
      return 'LOY001'
    }

    const nextNumber = parseInt(match[1]) + 1
    return `LOY${nextNumber.toString().padStart(3, '0')}`
  }

  static async updateCustomer(id: string, data: any) {
    return await prisma.customer.update({
      where: { id },
      data,
    })
  }

  static async searchCustomers(searchTerm: string) {
    const searchLower = searchTerm.toLowerCase()
    return await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: searchLower } },
          { phone: { contains: searchTerm } },
          { loyaltyCard: { contains: searchLower } },
          { email: { contains: searchLower } }
        ],
        isActive: true
      },
      orderBy: { name: 'asc' },
      take: 10 // Limit results to 10 customers
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
    // Create the sale with transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
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

      // Update stock and create inventory movements for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (product) {
          const previousStock = product.stock
          const newStock = previousStock - item.quantity

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock }
          })

          // Create inventory movement record
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'vente',
              quantity: -item.quantity, // Negative for sales (stock decrease)
              previousStock,
              newStock,
              reason: `Vente ${sale.id}`,
              reference: `Vente ${sale.id}`,
              userId: data.cashierId || 'Admin'
            }
          })
        }
      }

      return sale
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

  static async getSalesByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // End of day

    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: start,
          lte: end,
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

  static async getSalesByCustomerId(customerId: string, startDate?: string, endDate?: string) {
    const whereClause: any = {
      customerId: customerId
    }

    // Add date filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // End of day
      
      whereClause.saleDate = {
        gte: start,
        lte: end,
      }
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
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
    }).join(', ')}\nMontant retourné: FCFA${totalReturnAmount.toFixed(2)}`

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
    
    // Calculate yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Calculate Jan 1 of current year
    const currentYear = new Date().getFullYear()
    const janFirst = new Date(currentYear, 0, 1) // January 1st of current year
    
    // Calculate Jan 1 of previous year
    const previousYear = currentYear - 1
    const janFirstPreviousYear = new Date(previousYear, 0, 1)

    const [
      totalProducts,
      lowStockProducts,
      totalSales,
      todaySales,
      totalCustomers,
      totalRevenue,
      todayRevenue,
      yearRevenue,
      yesterdayRevenue,
      previousYearRevenue,
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
      prisma.sale.aggregate({
        _sum: {
          finalAmount: true,
        },
        where: {
          saleDate: {
            gte: janFirst,
          },
        },
      }),
      prisma.sale.aggregate({
        _sum: {
          finalAmount: true,
        },
        where: {
          saleDate: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      prisma.sale.aggregate({
        _sum: {
          finalAmount: true,
        },
        where: {
          saleDate: {
            gte: janFirstPreviousYear,
            lt: janFirst,
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
      yearRevenue: yearRevenue._sum.finalAmount || 0,
      yesterdayRevenue: yesterdayRevenue._sum.finalAmount || 0,
      previousYearRevenue: previousYearRevenue._sum.finalAmount || 0,
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

  // Activity Log Management
  static async getActivityLogs(params: {
    action?: string
    user?: string
    category?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  } = {}) {
    const { action, user, category, startDate, endDate, limit = 100, offset = 0 } = params

    const where: any = {}

    if (action) where.action = action
    if (user) where.user = { contains: user }
    if (category) where.category = category
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    return await prisma.activityLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    })
  }

  static async createActivityLog(data: {
    action: string
    details: string
    user: string
    financialImpact?: number | null
    category: string
    metadata?: string | null
  }) {
    return await prisma.activityLog.create({
      data: {
        action: data.action,
        details: data.details,
        user: data.user,
        financialImpact: data.financialImpact,
        category: data.category,
        metadata: data.metadata
      }
    })
  }

  static async getActivityLogsCount(params: {
    action?: string
    user?: string
    category?: string
    startDate?: string
    endDate?: string
  } = {}) {
    const { action, user, category, startDate, endDate } = params

    const where: any = {}

    if (action) where.action = action
    if (user) where.user = { contains: user }
    if (category) where.category = category
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    return await prisma.activityLog.count({ where })
  }

  // Get sales data for current week
  static async getSalesByWeekdayCurrentYear() {
    // Get current week (Monday to Sunday)
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1 // Days since Monday
    
    const monday = new Date(now)
    monday.setDate(now.getDate() - daysFromMonday)
    monday.setHours(0, 0, 0, 0) // Start of Monday
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999) // End of Sunday

    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: monday,
          lte: sunday,
        },
        paymentStatus: 'completed',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Initialize weekday data for current week
    const weekdays = [
      { name: 'Lun', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Mar', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Mer', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Jeu', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Ven', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Sam', chiffreAffaire: 0, benefice: 0, count: 0 },
      { name: 'Dim', chiffreAffaire: 0, benefice: 0, count: 0 },
    ]

    // Group sales by weekday for current week
    sales.forEach(sale => {
      const dayOfWeek = sale.saleDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to our array index (Monday = 0)
      
      // Calculate revenue (chiffre d'affaire)
      const revenue = sale.finalAmount
      weekdays[weekdayIndex].chiffreAffaire += revenue
      weekdays[weekdayIndex].count += 1

      // Calculate profit (bénéfice) for each item
      let totalProfit = 0
      sale.items.forEach(item => {
        const product = item.product
        if (product && product.costPrice && product.price) {
          const profitPerUnit = product.price - product.costPrice
          totalProfit += profitPerUnit * item.quantity
        }
      })
      weekdays[weekdayIndex].benefice += totalProfit
    })

    return weekdays
  }

  // Get category profit data for current year
  static async getCategoryProfitData() {
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1) // January 1st
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999) // December 31st

    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
        paymentStatus: 'completed',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    // Group profit by category
    const categoryProfit: { [key: string]: number } = {}

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = item.product
        if (product && product.costPrice && product.price && product.category) {
          const profitPerUnit = product.price - product.costPrice
          const totalProfit = profitPerUnit * item.quantity
          const categoryName = product.category.name
          
          categoryProfit[categoryName] = (categoryProfit[categoryName] || 0) + totalProfit
        }
      })
    })

    // Convert to array format for chart
    const colors = ['#3B82F6', '#10B981', '#6B7280', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
    const result = Object.entries(categoryProfit).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))

    return result
  }

  // Inventory Management Methods
  static async markProductAsOK(id: string) {
    return await prisma.product.update({
      where: { id },
      data: {
        lastInventoryDate: new Date(),
        lastInventoryStatus: 'OK'
      }
    })
  }

  static async adjustProductStock(id: string, newStock: number, reason: string, notes?: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error('Product not found')

    const previousStock = product.stock
    const stockDifference = newStock - previousStock

    // Update product stock and inventory status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        lastInventoryDate: new Date(),
        lastInventoryStatus: 'ADJUSTED'
      }
    })

    // Create inventory movement record
    await prisma.inventoryMovement.create({
      data: {
        productId: id,
        type: 'ajustement',
        quantity: stockDifference,
        previousStock,
        newStock,
        reason: `Ajustement: ${reason}`,
        notes: notes || null,
        userId: 'Admin' // TODO: Get actual user from auth system
      }
    })

    return updatedProduct
  }

  static async getProductsForInventory(filters: {
    categoryId?: string
    supplierId?: string
    status?: string
    search?: string
    notWorkedOnHours?: number
  } = {}) {
    const { categoryId, supplierId, status, search, notWorkedOnHours = 24 } = filters

    const where: any = {
      isActive: true
    }

    if (categoryId) where.categoryId = categoryId
    if (supplierId) where.supplierId = supplierId
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } }
      ]
    }

    // Filter by inventory status
    if (status === 'not_worked_on') {
      const cutoffDate = new Date()
      cutoffDate.setHours(cutoffDate.getHours() - notWorkedOnHours)
      where.OR = [
        { lastInventoryDate: null },
        { lastInventoryDate: { lt: cutoffDate } }
      ]
    } else if (status === 'worked_on') {
      const cutoffDate = new Date()
      cutoffDate.setHours(cutoffDate.getHours() - notWorkedOnHours)
      where.lastInventoryDate = { gte: cutoffDate }
    } else if (status === 'ok') {
      where.lastInventoryStatus = 'OK'
    } else if (status === 'adjusted') {
      where.lastInventoryStatus = 'ADJUSTED'
    }

    return await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  // Inventory Movements Methods
  static async getInventoryMovements(filters: {
    search?: string
    type?: string
    startDate?: string
    endDate?: string
    reason?: string
    financialImpact?: 'positive' | 'negative'
  } = {}) {
    const { search, type, startDate, endDate, reason, financialImpact } = filters

    const where: any = {}

    if (type) where.type = type
    if (reason) where.reason = { contains: reason }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setDate(endDateTime.getDate() + 1) // Include the end date
        where.createdAt.lt = endDateTime
      }
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            costPrice: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate financial impact for each movement
    let movementsWithImpact = movements.map(movement => {
      let financialImpact = 0
      
      if (movement.type === 'vente') {
        // For sales: positive impact (we gain profit from selling)
        // The financial impact is the profit per unit * quantity sold
        const profitPerUnit = (movement.product.price - movement.product.costPrice)
        financialImpact = profitPerUnit * Math.abs(movement.quantity)
      } else if (movement.type === 'ajustement') {
        // For adjustments: calculate based on whether it's a gain or loss
        if (movement.quantity > 0) {
          // Stock increase: positive impact (we gain value)
          financialImpact = movement.product.costPrice * movement.quantity
        } else {
          // Stock decrease: negative impact (we lose money due to missing inventory)
          financialImpact = movement.product.costPrice * movement.quantity
        }
      } else if (movement.type === 'ravitaillement') {
        // For replenishment: use stored financialImpact if available, otherwise calculate
        if (movement.financialImpact !== null && movement.financialImpact !== undefined) {
          financialImpact = movement.financialImpact
        } else {
          // Fallback calculation (without delivery cost)
          financialImpact = -movement.product.costPrice * movement.quantity
        }
      }

      return {
        ...movement,
        financialImpact: Math.round(financialImpact)
      }
    })

    // Filter by financial impact if specified
    if (financialImpact === 'positive') {
      movementsWithImpact = movementsWithImpact.filter(movement => movement.financialImpact > 0)
    } else if (financialImpact === 'negative') {
      movementsWithImpact = movementsWithImpact.filter(movement => movement.financialImpact < 0)
    }

    return movementsWithImpact
  }

  // Replenishment Methods
  static async getReplenishments(filters: {
    search?: string
    supplierId?: string
    startDate?: string
    endDate?: string
    receiptNumber?: string
  } = {}) {
    const { search, supplierId, startDate, endDate, receiptNumber } = filters

    console.log('🔍 Replenishment filters:', { search, supplierId, startDate, endDate, receiptNumber })

    const where: any = {}

    if (supplierId) where.supplierId = supplierId
    if (receiptNumber) where.receiptNumber = { contains: receiptNumber }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        // Start date: include from the beginning of the day (avoid timezone issues)
        const [year, month, day] = startDate.split('-').map(Number)
        const startDateTime = new Date(year, month - 1, day, 0, 0, 0, 0)
        where.createdAt.gte = startDateTime
        console.log('📅 Start date filter:', startDateTime.toISOString())
      }
      if (endDate) {
        // End date: include until the end of the day (avoid timezone issues)
        const [year, month, day] = endDate.split('-').map(Number)
        const endDateTime = new Date(year, month - 1, day, 23, 59, 59, 999)
        where.createdAt.lte = endDateTime
        console.log('📅 End date filter:', endDateTime.toISOString())
      }
    }

    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { product: { sku: { contains: search } } },
        { supplier: { name: { contains: search } } },
        { receiptNumber: { contains: search } }
      ]
    }

    return await prisma.replenishment.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async createReplenishment(data: {
    productId: string
    supplierId?: string
    quantity: number
    unitPrice: number
    deliveryCost: number
    receiptNumber?: string
    expirationDate?: Date | null
    notes?: string
    userId?: string
  }) {
    const totalPrice = (data.quantity * data.unitPrice) + data.deliveryCost

    return await prisma.$transaction(async (tx) => {
      // Récupérer le stock actuel avant le ravitaillement
      const product = await tx.product.findUnique({
        where: { id: data.productId },
        select: { stock: true }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const previousStock = product.stock
      const newStock = previousStock + data.quantity

      const replenishment = await tx.replenishment.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          deliveryCost: data.deliveryCost,
          totalPrice: totalPrice,
          receiptNumber: data.receiptNumber,
          expirationDate: data.expirationDate,
          notes: data.notes,
          userId: data.userId
        }
      })

      // Mettre à jour le stock du produit
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: newStock
        }
      })

      // Créer un mouvement d'inventaire avec previousStock et newStock
      await tx.inventoryMovement.create({
        data: {
          productId: data.productId,
          type: 'ravitaillement',
          quantity: data.quantity,
          previousStock: previousStock,
          newStock: newStock,
          reason: `Ravitaillement: ${data.receiptNumber || 'N/A'}`,
          financialImpact: -(totalPrice), // Impact négatif car c'est un coût
          reference: `Replenishment ${replenishment.id}`,
          userId: data.userId
        }
      })

      // Créer une alerte de péremption si une date est fournie
      if (data.expirationDate) {
        await tx.expirationAlert.create({
          data: {
            replenishmentId: replenishment.id,
            productId: data.productId,
            supplierId: data.supplierId,
            expirationDate: data.expirationDate,
            originalQuantity: data.quantity,
            currentQuantity: data.quantity, // Initialement égal à la quantité achetée
            isActive: true
          }
        })
      }

      // Créer un log d'activité
      await tx.activityLog.create({
        data: {
          action: 'REPLENISHMENT_CREATED',
          details: `Ravitaillement créé: ${data.quantity} unités`,
          user: data.userId || 'Système',
          category: 'REPLENISHMENT',
          financialImpact: totalPrice
        }
      })

      return replenishment
    })
  }

  static async createInventoryMovement(data: {
    productId: string
    type: string
    quantity: number
    previousStock: number
    newStock: number
    reason: string
    reference?: string
    notes?: string
    userId?: string
  }) {
    return await prisma.inventoryMovement.create({
      data: {
        ...data,
        userId: data.userId || 'Admin'
      }
    })
  }
}

export default DatabaseService 