'use client'

import { useState, useEffect } from 'react'
import { X, Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onInventoryUpdated: (update: any) => void
  type: 'adjustment' | 'transfer' | 'alert' | 'count'
  onReplenishmentRequest?: (product: Product) => void
}

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  location: string
  category: string
  supplier?: {
    id: string
    name: string
  } | null
  costPrice?: number
}

interface StockAdjustment {
  productId: string
  productName: string
  currentStock: number
  adjustment: number
  newStock: number
  reason: string
  type: 'add' | 'remove' | 'set'
}

export default function InventoryModal({ isOpen, onClose, onInventoryUpdated, type, onReplenishmentRequest }: InventoryModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [transferData, setTransferData] = useState({
    fromLocation: '',
    toLocation: '',
    products: [] as any[]
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // State for real products from database
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Load categories from database
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // Load products from database with pagination and search
  const loadProducts = async (page = 1, search = '', category = '') => {
    setIsLoadingProducts(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search,
        categoryId: category,
        isActive: 'true' // Only show active products for stock adjustment
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Transform database products to match the interface
        const transformedProducts = data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id.slice(-6)}`,
          currentStock: product.stock,
          minStock: product.minStock,
          maxStock: product.minStock * 3, // Estimate max stock
          location: 'Rayon A1', // Default location since we don't have this in our schema
          category: product.category?.name || 'Général',
          supplier: product.supplier ? {
            id: product.supplier.id,
            name: product.supplier.name
          } : null,
          costPrice: product.costPrice || 0
        }))
        
        if (page === 1) {
          setProducts(transformedProducts)
        } else {
          setProducts(prev => [...prev, ...transformedProducts])
        }
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Load more products (infinite scroll)
  const loadMoreProducts = () => {
    if (pagination.hasNextPage && !isLoadingProducts) {
      loadProducts(pagination.page + 1, searchTerm, selectedCategory)
    }
  }

  // Load products and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (type === 'alert') {
        // For alerts, load all products to show low stock alerts
        loadProducts(1, '', '')
      } else {
        loadProducts(1, searchTerm, selectedCategory)
      }
    }
  }, [isOpen, type])

  // Reload products when search or category changes
  useEffect(() => {
    if (isOpen) {
      setProducts([]) // Clear current products
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
      loadProducts(1, searchTerm, selectedCategory)
    }
  }, [searchTerm, selectedCategory])

  const locations = ['Rayon A1', 'Rayon A2', 'Rayon A3', 'Rayon B1', 'Rayon B2', 'Rayon B3', 'Rayon C1', 'Rayon C2', 'Entrepôt', 'Réserve']

  const adjustmentReasons = [
    'Inventaire physique',
    'Perte/Vol',
    'Produit défectueux',
    'Expiration',
    'Transfert',
    'Réception',
    'Correction d\'erreur',
    'Promotion',
    'Autre'
  ]

  const getTitle = () => {
    switch (type) {
      case 'adjustment': return 'Ajustement de stock'
      case 'transfer': return 'Transfert de stock'
      case 'alert': return 'Alertes de stock'
      case 'count': return 'Inventaire physique'
      default: return 'Gestion d\'inventaire'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'adjustment': return 'Ajuster les quantités en stock'
      case 'transfer': return 'Transférer des produits entre emplacements'
      case 'alert': return 'Gérer les alertes de stock faible'
      case 'count': return 'Effectuer un inventaire physique'
      default: return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'adjustment': return <TrendingUp className="w-5 h-5" />
      case 'transfer': return <ArrowRight className="w-5 h-5" />
      case 'alert': return <AlertTriangle className="w-5 h-5" />
      case 'count': return <Package className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'adjustment': return 'Appliquer les ajustements'
      case 'transfer': return 'Effectuer le transfert'
      case 'alert': return 'Traiter les alertes'
      case 'count': return 'Valider l\'inventaire'
      default: return 'Confirmer'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'adjustment': return 'bg-blue-600 hover:bg-blue-700'
      case 'transfer': return 'bg-green-600 hover:bg-green-700'
      case 'alert': return 'bg-orange-600 hover:bg-orange-700'
      case 'count': return 'bg-purple-600 hover:bg-purple-700'
      default: return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleStockAdjustment = (productId: string, adjustment: number, reason: string, type: 'add' | 'remove' | 'set') => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    let newStock: number
    if (type === 'add') {
      newStock = product.currentStock + adjustment
    } else if (type === 'remove') {
      newStock = Math.max(0, product.currentStock - adjustment)
    } else {
      newStock = adjustment
    }

    const existingAdjustment = adjustments.find(a => a.productId === productId)
    
    if (existingAdjustment) {
      setAdjustments(prev => prev.map(a => 
        a.productId === productId 
          ? { ...a, adjustment, newStock, reason, type }
          : a
      ))
    } else {
      setAdjustments(prev => [...prev, {
        productId,
        productName: product.name,
        currentStock: product.currentStock,
        adjustment,
        newStock,
        reason,
        type
      }])
    }
  }

  const getLowStockProducts = () => {
    return products.filter(product => product.currentStock <= product.minStock)
  }

  const handleReplenishmentFromAlert = (product: Product) => {
    if (onReplenishmentRequest) {
      onReplenishmentRequest(product)
      onClose() // Close the alert modal
    }
  }



  const processInventoryUpdate = async () => {
    setIsProcessing(true)

    try {
      let updateData: any = { type, timestamp: new Date().toISOString() }

      switch (type) {
        case 'adjustment':
          // Actually update the database
          if (adjustments.length > 0) {
            const response = await fetch('/api/products/adjust-stock', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ adjustments })
            })

            if (!response.ok) {
              throw new Error('Erreur lors de l\'ajustement du stock')
            }

            const result = await response.json()
            updateData.adjustments = adjustments
            updateData.results = result.results

            // Show success message
            showToast('success', 'Ajustements effectués', `${result.results.filter((r: any) => r.success).length} produits mis à jour`)
          }
          break
        case 'transfer':
          updateData.transfer = transferData
          showToast('info', 'Transfert', 'Fonctionnalité de transfert à implémenter')
          break
        case 'alert':
          updateData.alerts = {
            lowStock: getLowStockProducts()
          }
          showToast('info', 'Alertes', 'Alertes de stock faible affichées')
          break
        case 'count':
          updateData.count = adjustments
          showToast('info', 'Inventaire', 'Inventaire physique à implémenter')
          break
      }

      onInventoryUpdated(updateData)
    } catch (error) {
      console.error('Error processing inventory update:', error)
      showToast('error', 'Erreur', 'Erreur lors du traitement des ajustements')
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === 'adjustment' ? 'bg-blue-500' :
              type === 'transfer' ? 'bg-green-500' :
              type === 'alert' ? 'bg-orange-500' : 'bg-purple-500'
            }`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
              <p className="text-sm text-gray-600">{getDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {type === 'adjustment' && (
            <div className="space-y-6">
                             <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner les produits</h3>
                 
                 {/* Search and Filter Bar */}
                 <div className="mb-4 space-y-3">
                   <div className="flex gap-3">
                     <div className="flex-1">
                       <input
                         type="text"
                         placeholder="Rechercher par nom, SKU ou code-barres..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div className="w-48">
                                               <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Toutes les catégories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                     </div>
                   </div>
                   <div className="text-sm text-gray-600">
                     {pagination.totalCount > 0 && (
                       <span>{pagination.totalCount} produit{pagination.totalCount !== 1 ? 's' : ''} trouvé{pagination.totalCount !== 1 ? 's' : ''}</span>
                     )}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoadingProducts ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Chargement des produits...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-600">Aucun produit trouvé</p>
                    </div>
                  ) : (
                    products.map(product => (
                    <div
                      key={product.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProductSelection(product.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-600">Emplacement: {product.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{product.currentStock} unités</p>
                          <p className={`text-xs ${
                            product.currentStock <= product.minStock ? 'text-red-600' :
                            product.currentStock >= product.maxStock ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {product.currentStock <= product.minStock ? 'Stock faible' :
                             product.currentStock >= product.maxStock ? 'Stock élevé' : 'Stock OK'}
                          </p>
                        </div>
                      </div>
                    </div>
                                     ))
                   )}
                   
                   {/* Load More Button */}
                   {pagination.hasNextPage && (
                     <div className="col-span-2 text-center pt-4">
                       <button
                         onClick={loadMoreProducts}
                         disabled={isLoadingProducts}
                         className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isLoadingProducts ? 'Chargement...' : 'Charger plus de produits'}
                       </button>
                     </div>
                   )}
                 </div>
              </div>

              {selectedProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajustements de stock</h3>
                  <div className="space-y-4">
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId)
                      const adjustment = adjustments.find(a => a.productId === productId)
                      
                      if (!product) return null

                      return (
                        <div key={productId} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <span className="text-sm text-gray-600">Stock actuel: {product.currentStock}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'ajustement</label>
                              <select
                                value={adjustment?.type || 'add'}
                                onChange={(e) => handleStockAdjustment(productId, adjustment?.adjustment || 0, adjustment?.reason || '', e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="add">Ajouter</option>
                                <option value="remove">Retirer</option>
                                <option value="set">Définir</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                              <input
                                type="number"
                                min="0"
                                value={adjustment?.adjustment || 0}
                                onChange={(e) => handleStockAdjustment(productId, parseInt(e.target.value) || 0, adjustment?.reason || '', adjustment?.type || 'add')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                              <select
                                value={adjustment?.reason || ''}
                                onChange={(e) => handleStockAdjustment(productId, adjustment?.adjustment || 0, e.target.value, adjustment?.type || 'add')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Sélectionner une raison</option>
                                {adjustmentReasons.map(reason => (
                                  <option key={reason} value={reason}>{reason}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {adjustment && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">
                                  Nouveau stock: {adjustment.newStock} unités
                                </span>
                                <span className={`font-medium ${
                                  adjustment.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {adjustment.adjustment > 0 ? '+' : ''}{adjustment.adjustment}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'alert' && (
            <div className="space-y-6">
              {/* Low Stock Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes stock faible</h3>
                {getLowStockProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getLowStockProducts().map(product => (
                      <div key={product.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-red-900">{product.name}</h4>
                            <p className="text-sm text-red-700">SKU: {product.sku} • Emplacement: {product.location}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-900">{product.currentStock}</p>
                              <p className="text-sm text-red-700">Min: {product.minStock}</p>
                            </div>
                            <button
                              onClick={() => handleReplenishmentFromAlert(product)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Package className="w-4 h-4" />
                              <span>Ravitaillement</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                    <p>Aucune alerte de stock faible</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'transfer' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emplacement source</h3>
                  <select
                    value={transferData.fromLocation}
                    onChange={(e) => setTransferData(prev => ({ ...prev, fromLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un emplacement</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emplacement destination</h3>
                  <select
                    value={transferData.toLocation}
                    onChange={(e) => setTransferData(prev => ({ ...prev, toLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un emplacement</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {transferData.fromLocation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products
                      .filter(product => product.location === transferData.fromLocation)
                      .map(product => (
                        <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">Stock: {product.currentStock}</p>
                            </div>
                            <button
                              onClick={() => {
                                // Logique pour ajouter au transfert
                                showToast('info', 'Transfert', `${product.name} ajouté au transfert`)
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Transférer
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {type !== 'alert' && (
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={processInventoryUpdate}
                disabled={isProcessing || (type === 'adjustment' && selectedProducts.length === 0)}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2 ${getButtonColor()}`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    {getIcon()}
                    <span>{getButtonText()}</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Close button for alert modal */}
          {type === 'alert' && (
            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 