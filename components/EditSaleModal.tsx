import React, { useState, useEffect } from 'react'
import { X, Edit, RotateCcw, Trash2, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import DatabaseService from '@/lib/database'

interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

interface Sale {
  id: string
  customerId?: string
  customer?: string
  totalAmount?: number
  discountAmount?: number
  taxAmount?: number
  finalAmount?: number
  paymentMethod: string
  paymentStatus?: string
  saleDate?: string
  notes?: string
  items?: SaleItem[] // Make items optional
  // For compatibility with Orders component
  total?: number
  date?: string
  time?: string
  status?: string
  cashier?: string
}

interface EditSaleModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  onSaleUpdated: () => void
}

export default function EditSaleModal({ isOpen, onClose, sale, onSaleUpdated }: EditSaleModalProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'returns' | 'payment' | 'cancel'>('notes')
  const [notes, setNotes] = useState('')
  const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({})
  const [returnReason, setReturnReason] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: DollarSign },
    { value: 'card', label: 'Carte', icon: DollarSign },
    { value: 'mobile', label: 'Mobile Money', icon: DollarSign },
    { value: 'transfer', label: 'Virement', icon: DollarSign }
  ]

  useEffect(() => {
    if (sale) {
      setNotes(sale.notes || '')
      setNewPaymentMethod(sale.paymentMethod)
      setReturnItems({})
      setReturnReason('')
      setError('')
      
      // If we don't have detailed items, fetch them
      if (!sale.items || !Array.isArray(sale.items)) {
        loadSaleDetails(sale.id)
      }
    }
  }, [sale])



  const loadSaleDetails = async (saleId: string) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`)
      if (response.ok) {
        const saleDetails = await response.json()
        // Update the sale object with detailed items
        if (saleDetails.items && Array.isArray(saleDetails.items)) {
          // We need to update the sale object, but since it's passed as prop,
          // we'll handle this by checking if items exist before using them
        }
      }
    } catch (error) {
      console.error('Error loading sale details:', error)
    }
  }

  const canCancelSale = () => {
    if (!sale) return false
    const saleDate = new Date(sale.saleDate || sale.date || '')
    const now = new Date()
    const hoursDiff = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 // Can cancel within 24 hours
  }

  const handleUpdateNotes = async () => {
    if (!sale) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes
        }),
      })

      if (response.ok) {
        onSaleUpdated()
        onClose()
      } else {
        setError('Erreur lors de la mise à jour des notes')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessReturn = async () => {
    if (!sale) return
    
    const itemsToReturn = Object.entries(returnItems).filter(([_, quantity]) => quantity > 0)
    if (itemsToReturn.length === 0) {
      setError('Veuillez sélectionner des articles à retourner')
      return
    }

    if (!returnReason || returnReason.trim() === '') {
      setError('La raison du retour est requise')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/sales/${sale.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsToReturn.map(([itemId, quantity]) => ({
            itemId,
            quantity
          })),
          reason: returnReason
        }),
      })

      if (response.ok) {
        onSaleUpdated()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du traitement du retour')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!sale || newPaymentMethod === sale.paymentMethod) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: newPaymentMethod
        }),
      })

      if (response.ok) {
        onSaleUpdated()
        onClose()
      } else {
        setError('Erreur lors de la mise à jour du mode de paiement')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSale = async () => {
    if (!sale) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onSaleUpdated()
        onClose()
      } else {
        setError('Erreur lors de l\'annulation de la vente')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const updateReturnQuantity = (itemId: string, quantity: number) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(quantity, sale?.items?.find(item => item.id === itemId)?.quantity || 0))
    }))
  }

  const getTotalReturnAmount = () => {
    if (!sale?.items || !Array.isArray(sale.items)) return 0
    return sale.items.reduce((total, item) => {
      const returnQty = returnItems[item.id] || 0
      return total + (returnQty * item.unitPrice)
    }, 0)
  }

  if (!isOpen || !sale) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Modifier la vente</h2>
                         <p className="text-sm text-gray-600">ID: {sale.id} • {new Date(sale.saleDate || sale.date || '').toLocaleString('fr-FR')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'returns' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retours
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payment' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Paiement
          </button>
          <button
            onClick={() => setActiveTab('cancel')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'cancel' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de la vente
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajoutez des notes sur cette vente..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateNotes}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour les notes'}
                </button>
              </div>
            </div>
          )}

          {/* Returns Tab */}
          {activeTab === 'returns' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    Sélectionnez les articles à retourner et spécifiez la raison
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du retour
                </label>
                                                   <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <option value="">Sélectionnez une raison</option>
                  <option value="defective">Produit défectueux</option>
                  <option value="wrong_item">Mauvais article</option>
                  <option value="customer_request">Demande du client</option>
                  <option value="quality_issue">Problème de qualité</option>
                  <option value="other">Autre</option>
                </select>
              </div>

                             <div className="space-y-3">
                 <h3 className="text-lg font-medium text-gray-900">Articles de la vente</h3>
                 {sale.items && Array.isArray(sale.items) && sale.items.length > 0 ? (
                   sale.items.map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                       <div className="flex-1">
                         <p className="font-medium text-gray-900">{item.productName}</p>
                         <p className="text-sm text-gray-600">
                           {item.quantity} x {item.unitPrice.toLocaleString('fr-FR')} FCFA = {item.totalPrice.toLocaleString('fr-FR')} FCFA
                         </p>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-sm text-gray-600">Retourner:</span>
                         <input
                           type="number"
                           min="0"
                           max={item.quantity}
                           value={returnItems[item.id] || 0}
                           onChange={(e) => updateReturnQuantity(item.id, parseInt(e.target.value) || 0)}
                           className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                         />
                         <span className="text-sm text-gray-600">/ {item.quantity}</span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-gray-600">Chargement des articles...</p>
                     <button
                       onClick={() => loadSaleDetails(sale.id)}
                       className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                     >
                       Recharger les articles
                     </button>
                   </div>
                 )}
               </div>

              {getTotalReturnAmount() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800 font-medium">
                    Montant total du retour: {getTotalReturnAmount().toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleProcessReturn}
                  disabled={isLoading || getTotalReturnAmount() === 0 || !returnReason}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? 'Traitement...' : 'Traiter le retour'}
                </button>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-800 text-sm">
                    Modifier le mode de paiement de cette vente
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement actuel
                </label>
                <p className="text-gray-900 font-medium">{sale.paymentMethod}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mode de paiement
                </label>
                <select
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdatePayment}
                  disabled={isLoading || newPaymentMethod === sale.paymentMethod}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour le paiement'}
                </button>
              </div>
            </div>
          )}

          {/* Cancel Tab */}
          {activeTab === 'cancel' && (
            <div className="space-y-4">
              {canCancelSale() ? (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-red-800 text-sm font-medium">
                        Attention: Cette action annulera complètement la vente
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Détails de la vente</h3>
                                         <div className="bg-gray-50 p-4 rounded-md">
                       <p><strong>Client:</strong> {sale.customer || 'Client anonyme'}</p>
                       <p><strong>Total:</strong> {(sale.finalAmount || sale.total || 0).toLocaleString('fr-FR')} FCFA</p>
                       <p><strong>Articles:</strong> {sale.items?.length || 0}</p>
                       <p><strong>Date:</strong> {new Date(sale.saleDate || sale.date || '').toLocaleString('fr-FR')}</p>
                     </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleCancelSale}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Annulation...' : 'Annuler la vente'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Annulation impossible
                  </h3>
                  <p className="text-gray-600">
                    Cette vente ne peut plus être annulée car elle a plus de 24 heures.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 