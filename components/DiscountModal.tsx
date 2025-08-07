'use client'

import { useState } from 'react'
import { X, Percent, Tag, Calendar, Users, Package, DollarSign, AlertTriangle, CheckCircle, Plus } from 'lucide-react'

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onDiscountApplied: (discount: any) => void
  cartItems?: any[]
  totalAmount?: number
}

interface DiscountRule {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle'
  value: number
  minAmount?: number
  maxAmount?: number
  validFrom: string
  validUntil: string
  customerGroups: string[]
  productCategories: string[]
  maxUses: number
  usedCount: number
  description: string
  isActive: boolean
}

export default function DiscountModal({ isOpen, onClose, onDiscountApplied, cartItems = [], totalAmount = 0 }: DiscountModalProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountRule | null>(null)
  const [customDiscount, setCustomDiscount] = useState({
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    reason: ''
  })
  const [showCustomDiscount, setShowCustomDiscount] = useState(false)

  // Base de données des règles de remise
  const discountRules: DiscountRule[] = [
    {
      id: '1',
      name: 'Remise fidélité 10%',
      type: 'percentage',
      value: 10,
      minAmount: 50,
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      customerGroups: ['fidèle', 'vip'],
      productCategories: ['all'],
      maxUses: 1000,
      usedCount: 234,
      description: '10% de réduction pour clients fidèles',
      isActive: true
    },
    {
      id: '2',
      name: 'Remise volume 15%',
      type: 'percentage',
      value: 15,
      minAmount: 100,
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      customerGroups: ['all'],
      productCategories: ['all'],
      maxUses: 500,
      usedCount: 89,
      description: '15% de réduction pour achats > 100€',
      isActive: true
    },
    {
      id: '3',
      name: 'Remise fixe 5€',
      type: 'fixed',
      value: 5,
      minAmount: 25,
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      customerGroups: ['all'],
      productCategories: ['all'],
      maxUses: 2000,
      usedCount: 567,
      description: '5€ de réduction pour achats > 25€',
      isActive: true
    },
    {
      id: '4',
      name: 'Achetez 2, obtenez 1 gratuit',
      type: 'buy_x_get_y',
      value: 33.33,
      minAmount: 0,
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      customerGroups: ['all'],
      productCategories: ['boissons'],
      maxUses: 100,
      usedCount: 23,
      description: 'Achetez 2 boissons, obtenez 1 gratuite',
      isActive: true
    },
    {
      id: '5',
      name: 'Pack famille -20%',
      type: 'bundle',
      value: 20,
      minAmount: 75,
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      customerGroups: ['all'],
      productCategories: ['alimentation', 'boissons'],
      maxUses: 300,
      usedCount: 45,
      description: '20% de réduction sur les packs famille',
      isActive: true
    }
  ]

  const customerGroups = ['all', 'fidèle', 'vip', 'nouveau']
  const productCategories = ['all', 'alimentation', 'boissons', 'hygiène', 'maison', 'loisirs']

  const isDiscountValid = (discount: DiscountRule) => {
    const now = new Date()
    const validFrom = new Date(discount.validFrom)
    const validUntil = new Date(discount.validUntil)
    
    return (
      discount.isActive &&
      now >= validFrom &&
      now <= validUntil &&
      totalAmount >= (discount.minAmount || 0) &&
      discount.usedCount < discount.maxUses
    )
  }

  const calculateDiscountAmount = (discount: DiscountRule) => {
    if (discount.type === 'percentage') {
      return (totalAmount * discount.value) / 100
    } else if (discount.type === 'fixed') {
      return Math.min(discount.value, totalAmount)
    } else {
      // Pour les types complexes, calculer selon la logique
      return (totalAmount * discount.value) / 100
    }
  }

  const applyDiscount = (discount: DiscountRule) => {
    const discountAmount = calculateDiscountAmount(discount)
    const finalAmount = totalAmount - discountAmount
    
    onDiscountApplied({
      ...discount,
      appliedAmount: discountAmount,
      finalAmount: finalAmount,
      savings: discountAmount
    })
    
    onClose()
  }

  const applyCustomDiscount = () => {
    if (customDiscount.value <= 0) return
    
    const discountAmount = customDiscount.type === 'percentage' 
      ? (totalAmount * customDiscount.value) / 100
      : Math.min(customDiscount.value, totalAmount)
    
    onDiscountApplied({
      id: 'custom',
      name: `Remise personnalisée ${customDiscount.value}${customDiscount.type === 'percentage' ? '%' : '€'}`,
      type: customDiscount.type,
      value: customDiscount.value,
      appliedAmount: discountAmount,
      finalAmount: totalAmount - discountAmount,
      savings: discountAmount,
      reason: customDiscount.reason,
      description: `Remise personnalisée: ${customDiscount.reason}`
    })
    
    onClose()
  }

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />
      case 'fixed': return <DollarSign className="w-4 h-4" />
      case 'buy_x_get_y': return <Package className="w-4 h-4" />
      case 'bundle': return <Tag className="w-4 h-4" />
      default: return <Tag className="w-4 h-4" />
    }
  }

  const getDiscountColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'text-blue-600 bg-blue-50'
      case 'fixed': return 'text-green-600 bg-green-50'
      case 'buy_x_get_y': return 'text-purple-600 bg-purple-50'
      case 'bundle': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestion des remises</h2>
              <p className="text-sm text-gray-600">Appliquer des remises et promotions</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Available discounts */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remises disponibles</h3>
                <div className="space-y-3">
                  {discountRules.map((discount) => {
                    const isValid = isDiscountValid(discount)
                    const discountAmount = calculateDiscountAmount(discount)
                    
                    return (
                      <div
                        key={discount.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isValid 
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                        onClick={() => isValid && setSelectedDiscount(discount)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1 rounded ${getDiscountColor(discount.type)}`}>
                                {getDiscountIcon(discount.type)}
                              </div>
                              <h4 className="font-medium text-gray-900">{discount.name}</h4>
                              {!isValid && (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Non disponible
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{discount.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Min: €{discount.minAmount || 0}</span>
                              <span>Utilisé: {discount.usedCount}/{discount.maxUses}</span>
                            </div>
                          </div>
                          {isValid && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                -€{discountAmount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {discount.type === 'percentage' ? `${discount.value}%` : `€${discount.value}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Custom discount */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remise personnalisée</h3>
                <button
                  onClick={() => setShowCustomDiscount(!showCustomDiscount)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Ajouter une remise personnalisée</span>
                  </div>
                </button>

                {showCustomDiscount && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de remise</label>
                        <select
                          value={customDiscount.type}
                          onChange={(e) => setCustomDiscount(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant fixe (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customDiscount.value}
                          onChange={(e) => setCustomDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={customDiscount.type === 'percentage' ? '10' : '5.00'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnel)</label>
                      <input
                        type="text"
                        value={customDiscount.reason}
                        onChange={(e) => setCustomDiscount(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Client mécontent, erreur de prix..."
                      />
                    </div>
                    <button
                      onClick={applyCustomDiscount}
                      disabled={customDiscount.value <= 0}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Appliquer la remise personnalisée
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Selected discount details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la remise</h3>
                {selectedDiscount ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`p-2 rounded ${getDiscountColor(selectedDiscount.type)}`}>
                        {getDiscountIcon(selectedDiscount.type)}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedDiscount.name}</h4>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{selectedDiscount.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">
                          {selectedDiscount.type === 'percentage' ? 'Pourcentage' : 
                           selectedDiscount.type === 'fixed' ? 'Montant fixe' :
                           selectedDiscount.type === 'buy_x_get_y' ? 'Achetez X, obtenez Y' : 'Pack'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valeur:</span>
                        <span className="font-medium">
                          {selectedDiscount.type === 'percentage' ? `${selectedDiscount.value}%` : `€${selectedDiscount.value}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant minimum:</span>
                        <span className="font-medium">€{selectedDiscount.minAmount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Validité:</span>
                        <span className="font-medium">
                          {new Date(selectedDiscount.validFrom).toLocaleDateString('fr-FR')} - {new Date(selectedDiscount.validUntil).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Calcul de la remise</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Sous-total:</span>
                          <span>€{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Remise:</span>
                          <span>-€{calculateDiscountAmount(selectedDiscount).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-medium">
                          <span>Total après remise:</span>
                          <span>€{(totalAmount - calculateDiscountAmount(selectedDiscount)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => applyDiscount(selectedDiscount)}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Appliquer cette remise</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Sélectionnez une remise pour voir les détails</p>
                  </div>
                )}
              </div>

              {/* Cart summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé du panier</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre d'articles:</span>
                      <span className="font-medium">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-medium">€{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>€{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 