'use client'

import { useState } from 'react'
import { X, DollarSign, Calculator, Clock, AlertTriangle, CheckCircle, Printer, Download } from 'lucide-react'

interface CashRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'open' | 'close' | 'count'
}

interface ShiftData {
  startTime: string
  endTime?: string
  initialAmount: number
  finalAmount?: number
  sales: number
  transactions: number
  cashier: string
  notes: string
}

export default function CashRegisterModal({ isOpen, onClose, type }: CashRegisterModalProps) {
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: new Date().toLocaleTimeString('fr-FR'),
    initialAmount: 0,
    sales: 0,
    transactions: 0,
    cashier: 'Caissier actuel',
    notes: ''
  })
  const [countedAmount, setCountedAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOpenShift = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simuler l'ouverture de caisse
    showToast('success', 'Caisse ouverte', `Caisse ouverte avec €${shiftData.initialAmount.toFixed(2)}`)
    setIsProcessing(false)
    onClose()
  }

  const handleCloseShift = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simuler la fermeture de caisse
    const difference = countedAmount - shiftData.initialAmount
    const message = difference === 0 
      ? 'Caisse fermée - Montant correct'
      : `Caisse fermée - Différence: ${difference > 0 ? '+' : ''}€${difference.toFixed(2)}`
    
    showToast('success', 'Caisse fermée', message)
    setIsProcessing(false)
    onClose()
  }

  const handleCountCash = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simuler le comptage
    showToast('success', 'Comptage terminé', `Montant compté: €${countedAmount.toFixed(2)}`)
    setIsProcessing(false)
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'open': return 'Ouverture de caisse'
      case 'close': return 'Fermeture de caisse'
      case 'count': return 'Comptage de caisse'
      default: return 'Gestion de caisse'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'open': return 'Ouvrir la caisse pour commencer votre shift'
      case 'close': return 'Fermer la caisse et générer le rapport'
      case 'count': return 'Compter l\'argent en caisse'
      default: return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'open': return <CheckCircle className="w-5 h-5" />
      case 'close': return <Clock className="w-5 h-5" />
      case 'count': return <Calculator className="w-5 h-5" />
      default: return <DollarSign className="w-5 h-5" />
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'open': return 'Ouvrir la caisse'
      case 'close': return 'Fermer la caisse'
      case 'count': return 'Compter la caisse'
      default: return 'Confirmer'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'open': return 'bg-green-600 hover:bg-green-700'
      case 'close': return 'bg-red-600 hover:bg-red-700'
      case 'count': return 'bg-blue-600 hover:bg-blue-700'
      default: return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === 'open' ? 'bg-green-500' : 
              type === 'close' ? 'bg-red-500' : 'bg-blue-500'
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
          {type === 'open' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant initial en caisse *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={shiftData.initialAmount}
                    onChange={(e) => setShiftData(prev => ({ ...prev, initialAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caissier
                </label>
                <input
                  type="text"
                  value={shiftData.cashier}
                  onChange={(e) => setShiftData(prev => ({ ...prev, cashier: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du caissier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={shiftData.notes}
                  onChange={(e) => setShiftData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes pour ce shift..."
                />
              </div>
            </div>
          )}

          {type === 'close' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé du shift</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Heure d'ouverture</p>
                    <p className="font-medium">{shiftData.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant initial</p>
                    <p className="font-medium">€{shiftData.initialAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ventes</p>
                    <p className="font-medium">{shiftData.sales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="font-medium">{shiftData.transactions}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant compté en caisse *
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={countedAmount}
                    onChange={(e) => setCountedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {countedAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Différence</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Différence: {(countedAmount - shiftData.initialAmount) > 0 ? '+' : ''}€{(countedAmount - shiftData.initialAmount).toFixed(2)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de fermeture (optionnel)
                </label>
                <textarea
                  value={shiftData.notes}
                  onChange={(e) => setShiftData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes pour la fermeture..."
                />
              </div>
            </div>
          )}

          {type === 'count' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Comptage de caisse</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Comptez soigneusement l'argent en caisse et saisissez le montant total.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant compté *
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={countedAmount}
                    onChange={(e) => setCountedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Détail du comptage</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Billets de 50€</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billets de 20€</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billets de 10€</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billets de 5€</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pièces de 2€</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pièces de 1€</p>
                    <p className="font-medium">0</p>
                  </div>
                </div>
              </div>
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
            
            {type === 'count' && (
              <button
                onClick={handleCountCash}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Comptage...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>Compter</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={type === 'open' ? handleOpenShift : handleCloseShift}
              disabled={isProcessing || (type === 'open' && shiftData.initialAmount <= 0) || (type === 'close' && countedAmount <= 0)}
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2 ${getButtonColor()}`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  {type === 'open' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
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