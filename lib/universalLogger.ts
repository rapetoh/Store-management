// Universal logging utility that works everywhere in the application
export interface LogEntry {
  action: string
  details: string
  user: string
  financialImpact?: number | null
  category: string
  metadata?: any
  source?: 'middleware' | 'client' | 'server'
}

class UniversalLogger {
  private static instance: UniversalLogger
  private isInitialized = false

  private constructor() {}

  static getInstance(): UniversalLogger {
    if (!UniversalLogger.instance) {
      UniversalLogger.instance = new UniversalLogger()
    }
    return UniversalLogger.instance
  }

  // Initialize the logger (call this once at app startup)
  init() {
    if (this.isInitialized) return
    
    // Set up global error logging
    if (typeof window !== 'undefined') {
      // Log unhandled errors
      window.addEventListener('error', (event) => {
        this.log({
          action: 'error',
          details: `JavaScript Error: ${event.message} at ${event.filename}:${event.lineno}`,
          user: 'System',
          financialImpact: null,
          category: 'Système',
          source: 'client',
          metadata: {
            error: event.error?.stack,
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        })
      })

      // Log unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.log({
          action: 'error',
          details: `Unhandled Promise Rejection: ${event.reason}`,
          user: 'System',
          financialImpact: null,
          category: 'Système',
          source: 'client',
          metadata: {
            reason: event.reason,
            url: window.location.href
          }
        })
      })

      // Log page navigation
      let lastUrl = window.location.href
      const observer = new MutationObserver(() => {
        const currentUrl = window.location.href
        if (currentUrl !== lastUrl) {
          this.log({
            action: 'navigation',
            details: `Navigation: ${lastUrl} → ${currentUrl}`,
            user: 'Admin', // TODO: Get actual user
            financialImpact: null,
            category: 'Système',
            source: 'client',
            metadata: {
              from: lastUrl,
              to: currentUrl,
              timestamp: new Date().toISOString()
            }
          })
          lastUrl = currentUrl
        }
      })

      observer.observe(document, { subtree: true, childList: true })
    }

    this.isInitialized = true
  }

  // Main logging method
  async log(entry: LogEntry): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!entry.metadata) {
        entry.metadata = {}
      }
      if (!entry.metadata.timestamp) {
        entry.metadata.timestamp = new Date().toISOString()
      }

      // Add source if not provided
      if (!entry.source) {
        entry.source = typeof window !== 'undefined' ? 'client' : 'server'
      }

      // Send to API
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: entry.action,
          details: entry.details,
          user: entry.user,
          financialImpact: entry.financialImpact,
          category: entry.category,
          metadata: JSON.stringify(entry.metadata)
        }),
      })

      if (!response.ok) {
        console.error('Failed to log activity:', response.statusText)
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Convenience methods for common actions
  async logProductAction(action: 'add' | 'edit' | 'delete', productData: any): Promise<void> {
    const details = action === 'add' 
      ? `Ajout produit: ${productData.name} (${productData.sku || 'N/A'})`
      : action === 'edit'
      ? `Modification produit: ${productData.name}`
      : `Suppression produit: ${productData.name || productData.id}`

    await this.log({
      action: 'modification',
      details,
      user: 'Admin', // TODO: Get actual user
      financialImpact: null,
      category: 'Produits',
      metadata: { productData }
    })
  }

  async logCategoryAction(action: 'add' | 'edit' | 'delete', categoryData: any): Promise<void> {
    const details = action === 'add'
      ? `Ajout catégorie: ${categoryData.name}`
      : action === 'edit'
      ? `Modification catégorie: ${categoryData.name}`
      : `Suppression catégorie: ${categoryData.name}`

    await this.log({
      action: 'modification',
      details,
      user: 'Admin', // TODO: Get actual user
      financialImpact: null,
      category: 'Catégories',
      metadata: { categoryData }
    })
  }

  async logSupplierAction(action: 'add' | 'edit' | 'delete', supplierData: any): Promise<void> {
    const details = action === 'add'
      ? `Ajout fournisseur: ${supplierData.name}`
      : action === 'edit'
      ? `Modification fournisseur: ${supplierData.name}`
      : `Suppression fournisseur: ${supplierData.name}`

    await this.log({
      action: 'modification',
      details,
      user: 'Admin', // TODO: Get actual user
      financialImpact: null,
      category: 'Fournisseurs',
      metadata: { supplierData }
    })
  }

  async logSaleAction(action: 'create' | 'delete', saleData: any): Promise<void> {
    const details = action === 'create'
      ? `Nouvelle vente: ${saleData.total ? `${saleData.total.toLocaleString('fr-FR')} FCFA` : 'N/A'}`
      : `Suppression vente: ID ${saleData.id}`

    await this.log({
      action: action === 'create' ? 'sale' : 'modification',
      details,
      user: 'Admin', // TODO: Get actual user
      financialImpact: action === 'create' ? saleData.total : -(saleData.total || 0),
      category: 'Ventes',
      metadata: { saleData }
    })
  }

  async logInventoryAction(action: 'adjustment', adjustmentData: any): Promise<void> {
    await this.log({
      action: 'adjustment',
      details: `Ajustement inventaire: ${adjustmentData.productName} - ${adjustmentData.reason}`,
      user: 'Admin', // TODO: Get actual user
      financialImpact: adjustmentData.financialImpact,
      category: 'Inventaire',
      metadata: { adjustmentData }
    })
  }

  async logUserAction(action: string, details: string): Promise<void> {
    await this.log({
      action: 'login',
      details,
      user: 'Admin', // TODO: Get actual user
      financialImpact: null,
      category: 'Système',
      metadata: { action }
    })
  }

  async logError(error: Error, context?: string): Promise<void> {
    await this.log({
      action: 'error',
      details: `Erreur: ${error.message}${context ? ` - ${context}` : ''}`,
      user: 'System',
      financialImpact: null,
      category: 'Système',
      metadata: {
        error: error.stack,
        context,
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      }
    })
  }
}

// Export singleton instance
export const universalLogger = UniversalLogger.getInstance()

// Export convenience function
export const logActivity = async (entry: LogEntry): Promise<void> => {
  return universalLogger.log(entry)
} 