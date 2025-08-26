// Centralized logging utility for the entire application
export interface LogActivity {
  action: string
  details: string
  user: string
  financialImpact?: number | null
  category: string
  metadata?: any
}

export class ActivityLogger {
  private static async logToDatabase(logData: LogActivity) {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...logData,
          metadata: logData.metadata ? JSON.stringify(logData.metadata) : null
        }),
      })
      
      if (!response.ok) {
        console.error('Failed to log activity to database:', response.statusText)
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Sales activities
  static async logSale(saleData: {
    saleId: string
    total: number
    itemCount: number
    paymentMethod: string
    user: string
  }) {
    await this.logToDatabase({
      action: 'sale',
      details: `Vente #${saleData.saleId} - ${saleData.itemCount} articles - ${saleData.paymentMethod}`,
      user: saleData.user,
      financialImpact: saleData.total,
      category: 'Ventes'
    })
  }

  static async logSaleDeletion(saleData: {
    saleId: string
    total: number
    user: string
  }) {
    await this.logToDatabase({
      action: 'modification',
      details: `Suppression vente #${saleData.saleId} - Total: ${saleData.total.toLocaleString('fr-FR')} FCFA`,
      user: saleData.user,
      financialImpact: -(saleData.total), // Negative impact for deletion
      category: 'Ventes'
    })
  }

  // Inventory activities
  static async logStockAdjustment(adjustmentData: {
    productName: string
    previousStock: number
    newStock: number
    reason: string
    financialImpact: number
    user: string
  }) {
    const difference = adjustmentData.newStock - adjustmentData.previousStock
    await this.logToDatabase({
      action: 'adjustment',
      details: `Ajustement ${adjustmentData.productName}: ${adjustmentData.previousStock} → ${adjustmentData.newStock} (${difference > 0 ? '+' : ''}${difference}) - ${adjustmentData.reason}`,
      user: adjustmentData.user,
      financialImpact: adjustmentData.financialImpact,
      category: 'Inventaire'
    })
  }

  // Supplier activities
  static async logSupplierAction(action: 'add' | 'edit' | 'delete', supplierData: {
    name: string
    previousName?: string
    user: string
  }) {
    let details = ''
    switch (action) {
      case 'add':
        details = `Ajout fournisseur: ${supplierData.name}`
        break
      case 'edit':
        details = `Modification fournisseur: ${supplierData.previousName} → ${supplierData.name}`
        break
      case 'delete':
        details = `Suppression fournisseur: ${supplierData.name}`
        break
    }

    await this.logToDatabase({
      action: 'modification',
      details,
      user: supplierData.user,
      financialImpact: null, // No financial impact for supplier operations
      category: 'Fournisseurs'
    })
  }

  // Product activities
  static async logProductAction(action: 'add' | 'edit' | 'delete', productData: {
    name: string
    previousName?: string
    user: string
  }) {
    let details = ''
    switch (action) {
      case 'add':
        details = `Ajout produit: ${productData.name}`
        break
      case 'edit':
        details = `Modification produit: ${productData.previousName} → ${productData.name}`
        break
      case 'delete':
        details = `Suppression produit: ${productData.name}`
        break
    }

    await this.logToDatabase({
      action: 'modification',
      details,
      user: productData.user,
      financialImpact: null, // No direct financial impact for product operations
      category: 'Produits'
    })
  }

  // User activities
  static async logUserAction(action: string, details: string, user: string) {
    await this.logToDatabase({
      action: 'login',
      details,
      user,
      financialImpact: null,
      category: 'Système'
    })
  }

  // Generic logging method
  static async log(activity: LogActivity) {
    await this.logToDatabase(activity)
  }
}

// Convenience function for quick logging
export const logActivity = async (activity: LogActivity) => {
  await ActivityLogger.log(activity)
} 