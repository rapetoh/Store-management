'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, DollarSign, ArrowRight, User } from 'lucide-react'

interface CashRegisterWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenCashRegister: (initialAmount: number, cashierName: string) => void
  onContinueWithoutRegister: () => void
}

export default function CashRegisterWarningModal({ 
  isOpen, 
  onClose, 
  onOpenCashRegister, 
  onContinueWithoutRegister 
}: CashRegisterWarningModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [initialAmount, setInitialAmount] = useState(10000)
  const [cashierName, setCashierName] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialAmount(10000)
      setCashierName('')
    }
  }, [isOpen])

  const handleOpenCashRegister = async () => {
    if (initialAmount <= 0) {
      // You can add toast notification here if needed
      return
    }

    if (!cashierName.trim()) {
      // You can add toast notification here if needed
      return
    }

    setIsProcessing(true)
    try {
      await onOpenCashRegister(initialAmount, cashierName)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Caisse non ouverte</h2>
              <p className="text-xs text-gray-600">Action requise pour continuer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ouvrir une session de caisse
            </h3>
            <p className="text-sm text-gray-600">
              Pour effectuer des ventes en espèces, vous devez d'abord ouvrir une session de caisse.
              Cela permet de suivre correctement les transactions et de maintenir un contrôle financier.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Recommandé :</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Ouvrir la caisse pour un suivi complet</li>
              <li>• Toutes les ventes seront liées à la session</li>
              <li>• Rapports financiers détaillés</li>
              <li>• Contrôle de caisse en fin de journée</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant initial en caisse *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Montant en FCFA pour commencer votre shift
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setInitialAmount(5000)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  5 000 FCFA
                </button>
                <button
                  type="button"
                  onClick={() => setInitialAmount(10000)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  10 000 FCFA
                </button>
                <button
                  type="button"
                  onClick={() => setInitialAmount(20000)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  20 000 FCFA
                </button>
                <button
                  type="button"
                  onClick={() => setInitialAmount(50000)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  50 000 FCFA
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caissier *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3 p-4 border-t border-gray-200">
          <button
            onClick={handleOpenCashRegister}
            disabled={isProcessing || initialAmount <= 0 || !cashierName.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Ouverture...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Ouvrir la caisse</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          
          <button
            onClick={onContinueWithoutRegister}
            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continuer sans ouvrir la caisse
          </button>
        </div>
      </div>
    </div>
  )
} 