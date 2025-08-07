'use client'

import { useState } from 'react'
import { X, ArrowLeft, DollarSign, Package, AlertTriangle, CheckCircle, Receipt, CreditCard, Calculator } from 'lucide-react'

interface ReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onReturnProcessed: (returnData: any) => void
  originalSale?: any
}

interface ReturnItem {
  id: string
  name: string
  originalPrice: number
  quantity: number
  returnQuantity: number
  returnReason: string
  condition: 'new' | 'damaged' | 'used'
  refundAmount: number
}

export default function ReturnModal({ isOpen, onClose, onReturnProcessed, originalSale }: ReturnModalProps) {
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [selectedReturnType, setSelectedReturnType] = useState<'refund' | 'exchange' | 'credit'>('refund')
  const [refundMethod, setRefundMethod] = useState<'original' | 'store_credit' | 'exchange'>('original')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    reason: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Simuler les articles de la vente originale
  const originalItems = originalSale?.saleItems || [
    { id: '1', name: 'Lait 1L', price: 1.20, quantity: 2 },
    { id: '2', name: 'Pain baguette', price: 0.85, quantity: 1 },
    { id: '3', name: 'Yaourt nature', price: 0.65, quantity: 3 }
  ]

  const returnReasons = [
    'Produit défectueux',
    'Produit endommagé',
    'Mauvais produit reçu',
    'Produit périmé',
    'Taille incorrecte',
    'Couleur différente',
    'Client mécontent',
    'Erreur de commande',
    'Double commande',
    'Autre'
  ]

  const refundMethods = [
    { id: 'original', name: 'Méthode originale', icon: CreditCard },
    { id: 'store_credit', name: 'Crédit magasin', icon: DollarSign },
    { id: 'exchange', name: 'Échange', icon: Package }
  ]

  const handleItemReturn = (itemId: string, returnQuantity: number, reason: string, condition: 'new' | 'damaged' | 'used') => {
    const originalItem = originalItems.find((item: any) => item.id === itemId)
    if (!originalItem) return

    const existingReturn = returnItems.find(item => item.id === itemId)
    
    if (existingReturn) {
      setReturnItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, returnQuantity, returnReason: reason, condition, refundAmount: returnQuantity * originalItem.price }
          : item
      ))
    } else {
      setReturnItems(prev => [...prev, {
        id: itemId,
        name: originalItem.name,
        originalPrice: originalItem.price,
        quantity: originalItem.quantity,
        returnQuantity,
        returnReason: reason,
        condition,
        refundAmount: returnQuantity * originalItem.price
      }])
    }
  }

  const removeReturnItem = (itemId: string) => {
    setReturnItems(prev => prev.filter(item => item.id !== itemId))
  }

  const getTotalRefundAmount = () => {
    return returnItems.reduce((sum, item) => sum + item.refundAmount, 0)
  }

  const getReturnSummary = () => {
    const totalItems = returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)
    const totalRefund = getTotalRefundAmount()
    const newItems = returnItems.filter(item => item.condition === 'new').length
    const damagedItems = returnItems.filter(item => item.condition === 'damaged').length
    const usedItems = returnItems.filter(item => item.condition === 'used').length

    return { totalItems, totalRefund, newItems, damagedItems, usedItems }
  }

  const processReturn = async () => {
    if (returnItems.length === 0) return

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const summary = getReturnSummary()
    const returnData = {
      id: `RET${Date.now()}`,
      originalSaleId: originalSale?.id || 'SALE001',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR'),
      returnItems,
      totalRefund: summary.totalRefund,
      returnType: selectedReturnType,
      refundMethod,
      customerInfo,
      summary,
      status: 'processed'
    }

    onReturnProcessed(returnData)
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
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Retour et remboursement</h2>
              <p className="text-sm text-gray-600">Traiter un retour de produits</p>
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
            {/* Left side - Original sale and return items */}
            <div className="space-y-6">
              {/* Original Sale Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vente originale</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de vente:</span>
                    <span className="font-medium">{originalSale?.id || 'SALE001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{originalSale?.date || '2024-01-15'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total original:</span>
                    <span className="font-medium">€{originalSale?.total?.toFixed(2) || '15.50'}</span>
                  </div>
                </div>
              </div>

              {/* Return Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Articles à retourner</h3>
                <div className="space-y-4">
                  {originalItems.map((item: any) => {
                    const returnItem = returnItems.find(ri => ri.id === item.id)
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              Prix: €{item.price.toFixed(2)} • Quantité achetée: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>

                        {returnItem ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-green-800">
                                Retour: {returnItem.returnQuantity}/{item.quantity}
                              </span>
                              <span className="font-bold text-green-800">
                                -€{returnItem.refundAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-green-700">
                              <p>Raison: {returnItem.returnReason}</p>
                              <p>État: {returnItem.condition === 'new' ? 'Neuf' : returnItem.condition === 'damaged' ? 'Endommagé' : 'Utilisé'}</p>
                            </div>
                            <button
                              onClick={() => removeReturnItem(item.id)}
                              className="mt-2 text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer du retour
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantité à retourner
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 0
                                    if (quantity > 0) {
                                      handleItemReturn(item.id, quantity, '', 'new')
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  État
                                </label>
                                <select
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onChange={(e) => {
                                    const returnItem = returnItems.find(ri => ri.id === item.id)
                                    if (returnItem) {
                                      handleItemReturn(item.id, returnItem.returnQuantity, returnItem.returnReason, e.target.value as any)
                                    }
                                  }}
                                >
                                  <option value="new">Neuf</option>
                                  <option value="used">Utilisé</option>
                                  <option value="damaged">Endommagé</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Raison du retour
                              </label>
                              <select
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onChange={(e) => {
                                  const returnItem = returnItems.find(ri => ri.id === item.id)
                                  if (returnItem) {
                                    handleItemReturn(item.id, returnItem.returnQuantity, e.target.value, returnItem.condition)
                                  }
                                }}
                              >
                                <option value="">Sélectionner une raison</option>
                                {returnReasons.map(reason => (
                                  <option key={reason} value={reason}>{reason}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right side - Return type, refund method, and summary */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations client</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Téléphone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raison générale (optionnel)</label>
                    <textarea
                      value={customerInfo.reason}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, reason: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Raison générale du retour..."
                    />
                  </div>
                </div>
              </div>

              {/* Return Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Type de retour</h3>
                <div className="space-y-2">
                  {[
                    { id: 'refund', name: 'Remboursement', icon: DollarSign, color: 'bg-green-500' },
                    { id: 'exchange', name: 'Échange', icon: Package, color: 'bg-blue-500' },
                    { id: 'credit', name: 'Crédit magasin', icon: CreditCard, color: 'bg-purple-500' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedReturnType(type.id as any)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        selectedReturnType === type.id
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.color}`}>
                        <type.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Refund Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthode de remboursement</h3>
                <div className="space-y-2">
                  {refundMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setRefundMethod(method.id as any)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        refundMethod === method.id
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé du retour</h3>
                {returnItems.length > 0 ? (
                  <div className="space-y-3">
                    {getReturnSummary() && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Articles retournés:</p>
                          <p className="font-medium">{getReturnSummary().totalItems}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Montant remboursé:</p>
                          <p className="font-medium text-green-600">€{getReturnSummary().totalRefund.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">État neuf:</p>
                          <p className="font-medium">{getReturnSummary().newItems}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">État endommagé:</p>
                          <p className="font-medium">{getReturnSummary().damagedItems}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total remboursement:</span>
                        <span className="text-green-600">€{getTotalRefundAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun article sélectionné pour le retour</p>
                  </div>
                )}
              </div>

              {/* Process Return Button */}
              <button
                onClick={processReturn}
                disabled={returnItems.length === 0 || isProcessing}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Traiter le retour</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 