'use client'

import { useState } from 'react'
import { X, Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onInventoryUpdated: (update: any) => void
  type: 'adjustment' | 'transfer' | 'alert' | 'count'
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

export default function InventoryModal({ isOpen, onClose, onInventoryUpdated, type }: InventoryModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [transferData, setTransferData] = useState({
    fromLocation: '',
    toLocation: '',
    products: [] as any[]
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Base de données des produits
  const products: Product[] = [
    { id: '1', name: 'Lait 1L', sku: 'LAIT001', currentStock: 50, minStock: 10, maxStock: 100, location: 'Rayon A1', category: 'Alimentation' },
    { id: '2', name: 'Pain baguette', sku: 'PAIN002', currentStock: 8, minStock: 15, maxStock: 50, location: 'Rayon B2', category: 'Boulangerie' },
    { id: '3', name: 'Yaourt nature', sku: 'YAOURT003', currentStock: 100, minStock: 20, maxStock: 200, location: 'Rayon A3', category: 'Alimentation' },
    { id: '4', name: 'Pommes Golden', sku: 'POMME004', currentStock: 25, minStock: 10, maxStock: 80, location: 'Rayon C1', category: 'Fruits' },
    { id: '5', name: 'Eau minérale 1.5L', sku: 'EAU005', currentStock: 80, minStock: 30, maxStock: 150, location: 'Rayon D2', category: 'Boissons' },
    { id: '6', name: 'Chips nature', sku: 'CHIPS006', currentStock: 45, minStock: 15, maxStock: 100, location: 'Rayon E1', category: 'Snacks' },
    { id: '7', name: 'Café moulu 250g', sku: 'CAFE007', currentStock: 3, minStock: 8, maxStock: 50, location: 'Rayon F3', category: 'Alimentation' },
    { id: '8', name: 'Bananes 1kg', sku: 'BANANE008', currentStock: 35, minStock: 12, maxStock: 60, location: 'Rayon C2', category: 'Fruits' }
  ]

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

  const getOverStockProducts = () => {
    return products.filter(product => product.currentStock >= product.maxStock)
  }

  const processInventoryUpdate = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    let updateData: any = { type, timestamp: new Date().toISOString() }

    switch (type) {
      case 'adjustment':
        updateData.adjustments = adjustments
        break
      case 'transfer':
        updateData.transfer = transferData
        break
      case 'alert':
        updateData.alerts = {
          lowStock: getLowStockProducts(),
          overStock: getOverStockProducts()
        }
        break
      case 'count':
        updateData.count = adjustments
        break
    }

    onInventoryUpdated(updateData)
    setIsProcessing(false)
    onClose()
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => (
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
                  ))}
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
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-900">{product.currentStock}</p>
                            <p className="text-sm text-red-700">Min: {product.minStock}</p>
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

              {/* Over Stock Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes stock élevé</h3>
                {getOverStockProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getOverStockProducts().map(product => (
                      <div key={product.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-orange-900">{product.name}</h4>
                            <p className="text-sm text-orange-700">SKU: {product.sku} • Emplacement: {product.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-900">{product.currentStock}</p>
                            <p className="text-sm text-orange-700">Max: {product.maxStock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                    <p>Aucune alerte de stock élevé</p>
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
        </div>
      </div>
    </div>
  )
} 