'use client'

import React from 'react'
import { X, ShoppingCart, RotateCcw, Package, User, Calendar, DollarSign, AlertTriangle } from 'lucide-react'

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
  items?: SaleItem[]
  // For compatibility with Orders component
  total?: number
  date?: string
  time?: string
  status?: string
  cashier?: string
}

interface SaleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
  if (!isOpen || !sale) return null

  // Parse notes to extract return information
  const parseReturnInfo = (notes: string) => {
    const returnMatches = notes.match(/\[RETOUR - ([^\]]+)\]/g)
    if (!returnMatches) return []

    return returnMatches.map(match => {
      const dateMatch = match.match(/\[RETOUR - ([^\]]+)\]/)
      const reasonMatch = notes.match(/Raison: ([^\n]+)/)
      const itemsMatch = notes.match(/Articles retournés: ([^\n]+)/)
      const amountMatch = notes.match(/Montant retourné: €([0-9.]+)/)

      return {
        date: dateMatch ? dateMatch[1] : '',
        reason: reasonMatch ? reasonMatch[1] : '',
        items: itemsMatch ? itemsMatch[1] : '',
        amount: amountMatch ? parseFloat(amountMatch[1]) : 0
      }
    })
  }

  const returnHistory = sale.notes ? parseReturnInfo(sale.notes) : []
  const hasReturns = returnHistory.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Détails de la vente</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Sale Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">ID:</span>
                <span className="text-sm text-gray-900 font-mono">{sale.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Client:</span>
                <span className="text-sm text-gray-900">{sale.customer || 'Client anonyme'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(sale.saleDate || sale.date || '').toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Articles:</span>
                <span className="text-sm text-gray-900">{sale.items?.length || 0} items</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-sm text-gray-900 font-semibold">
                  €{(sale.finalAmount || sale.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Statut:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  sale.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {sale.status || 'Payé'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Méthode de paiement:</span>
                <span className="text-sm text-gray-900">{sale.paymentMethod}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Caissier:</span>
                <span className="text-sm text-gray-900">{sale.cashier || 'Caissier actuel'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 text-sm whitespace-pre-line">{sale.notes}</p>
              </div>
            </div>
          )}

          {/* Sale Items */}
          {sale.items && sale.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Articles de la vente</h3>
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remise
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sale.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          €{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          €{item.discount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          €{item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Return History */}
          {hasReturns && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <RotateCcw className="w-5 h-5 text-orange-500 mr-2" />
                Historique des retours
              </h3>
              <div className="space-y-3">
                {returnHistory.map((returnInfo, index) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-800">
                          Retour du {returnInfo.date}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-orange-800">
                        -€{returnInfo.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-orange-700">
                        <span className="font-medium">Raison:</span> {returnInfo.reason}
                      </p>
                      <p className="text-sm text-orange-700">
                        <span className="font-medium">Articles retournés:</span> {returnInfo.items}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total de la vente:</span>
              <span className="text-lg font-semibold text-gray-900">
                €{(sale.finalAmount || sale.total || 0).toFixed(2)}
              </span>
            </div>
            {hasReturns && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-orange-700">Total des retours:</span>
                <span className="text-sm font-semibold text-orange-700">
                  -€{returnHistory.reduce((sum, ret) => sum + ret.amount, 0).toFixed(2)}
                </span>
              </div>
            )}
            {hasReturns && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Montant net:</span>
                <span className="text-lg font-semibold text-gray-900">
                  €{((sale.finalAmount || sale.total || 0) - returnHistory.reduce((sum, ret) => sum + ret.amount, 0)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
} 