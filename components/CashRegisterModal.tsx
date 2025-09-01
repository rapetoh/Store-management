'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Calculator, Clock, AlertTriangle, CheckCircle, Printer, Download } from 'lucide-react'

interface CashRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'open' | 'close' | 'count'
}

interface CashSession {
  id: string
  openingAmount: number
  closingAmount?: number
  expectedAmount?: number
  actualAmount?: number
  difference?: number
  totalSales: number
  totalTransactions: number
  cashierName?: string
  status: string
  startTime: string
  endTime?: string
  notes?: string
}

interface ShiftData {
  initialAmount: number
  cashierName: string
  notes: string
}

export default function CashRegisterModal({ isOpen, onClose, type }: CashRegisterModalProps) {
  const [shiftData, setShiftData] = useState<ShiftData>({
    initialAmount: 0,
    cashierName: 'Caissier actuel',
    notes: ''
  })
  const [countedAmount, setCountedAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<CashSession[]>([])

  // Load current session and history when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCashSessionData()
    }
  }, [isOpen])

  const loadCashSessionData = async () => {
    try {
      const response = await fetch('/api/cash')
      const data = await response.json()
      
      console.log('Cash session data:', data) // Debug log
      
      if (data.success) {
        setCurrentSession(data.currentSession)
        setSessionHistory(data.history)
      }
    } catch (error) {
      console.error('Error loading cash session data:', error)
    }
  }

  const handleOpenShift = async () => {
    if (shiftData.initialAmount <= 0) {
      showToast('error', 'Erreur', 'Le montant initial doit être supérieur à 0')
      return
    }

    if (!shiftData.cashierName.trim()) {
      showToast('error', 'Erreur', 'Le nom du caissier est requis')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          openingAmount: shiftData.initialAmount,
          cashierName: shiftData.cashierName,
          notes: shiftData.notes
        })
      })

      const data = await response.json()
      
      if (data.success) {
        showToast('success', 'Caisse ouverte', `Caisse ouverte avec ${shiftData.initialAmount.toLocaleString('fr-FR')} FCFA`)
        await loadCashSessionData()
        onClose()
      } else {
        showToast('error', 'Erreur', data.error || 'Erreur lors de l\'ouverture de la caisse')
      }
    } catch (error) {
      showToast('error', 'Erreur', 'Erreur de connexion')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseShift = async () => {
    if (!currentSession) {
      showToast('error', 'Erreur', 'Aucune session de caisse ouverte')
      return
    }

    if (countedAmount < 0) {
      showToast('error', 'Erreur', 'Le montant compté doit être positif')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          sessionId: currentSession.id,
          closingAmount: countedAmount,
          actualAmount: countedAmount,
          notes: shiftData.notes
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const difference = data.session.difference
        const message = difference === 0 
          ? 'Caisse fermée - Montant correct'
          : `Caisse fermée - Différence: ${difference > 0 ? '+' : ''}${difference.toLocaleString('fr-FR')} FCFA`
        
        showToast('success', 'Caisse fermée', message)
        await loadCashSessionData()
        onClose()
      } else {
        showToast('error', 'Erreur', data.error || 'Erreur lors de la fermeture de la caisse')
      }
    } catch (error) {
      showToast('error', 'Erreur', 'Erreur de connexion')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCountCash = async () => {
    if (!currentSession) {
      showToast('error', 'Erreur', 'Aucune session de caisse ouverte')
      return
    }

    if (countedAmount < 0) {
      showToast('error', 'Erreur', 'Le montant compté doit être positif')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'count',
          sessionId: currentSession.id,
          actualAmount: countedAmount,
          notes: shiftData.notes
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const difference = data.session.difference
        const message = difference === 0 
          ? `Comptage terminé - Montant correct: ${countedAmount.toLocaleString('fr-FR')} FCFA`
          : `Comptage terminé - Différence: ${difference > 0 ? '+' : ''}${difference.toLocaleString('fr-FR')} FCFA`
        
        showToast('success', 'Comptage terminé', message)
        await loadCashSessionData()
      } else {
        showToast('error', 'Erreur', data.error || 'Erreur lors du comptage')
      }
    } catch (error) {
      showToast('error', 'Erreur', 'Erreur de connexion')
    } finally {
      setIsProcessing(false)
    }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'open' ? 'bg-green-500' : 
              type === 'close' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
              <p className="text-xs text-gray-600">{getDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
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
                    step="100"
                    min="0"
                    value={shiftData.initialAmount}
                    onChange={(e) => setShiftData(prev => ({ ...prev, initialAmount: parseFloat(e.target.value) || 0 }))}
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
                    onClick={() => setShiftData(prev => ({ ...prev, initialAmount: 5000 }))}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    5 000 FCFA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftData(prev => ({ ...prev, initialAmount: 10000 }))}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    10 000 FCFA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftData(prev => ({ ...prev, initialAmount: 20000 }))}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    20 000 FCFA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftData(prev => ({ ...prev, initialAmount: 50000 }))}
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
                <input
                  type="text"
                  value={shiftData.cashierName}
                  onChange={(e) => setShiftData(prev => ({ ...prev, cashierName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                  required
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
              {currentSession ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé du shift</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Heure d'ouverture</p>
                      <p className="font-medium">{new Date(currentSession.startTime).toLocaleTimeString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant initial</p>
                      <p className="font-medium">{currentSession.openingAmount.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ventes</p>
                      <p className="font-medium">{currentSession.totalSales.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="font-medium">{currentSession.totalTransactions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Caissier</p>
                      <p className="font-medium">{currentSession.cashierName || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant attendu</p>
                      <p className="font-medium">{(currentSession.openingAmount + currentSession.totalSales).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Aucune session ouverte</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Aucune session de caisse n'est actuellement ouverte.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant compté en caisse *
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={countedAmount}
                    onChange={(e) => setCountedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comptez soigneusement l'argent en caisse
                </p>
              </div>

              {countedAmount > 0 && currentSession && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Différence</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Différence: {(countedAmount - (currentSession.openingAmount + currentSession.totalSales)) > 0 ? '+' : ''}{(countedAmount - (currentSession.openingAmount + currentSession.totalSales)).toLocaleString('fr-FR')} FCFA
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
            <div className="space-y-3">
              {currentSession ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Session en cours</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600">Montant initial</p>
                        <p className="font-medium">{currentSession.openingAmount.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ventes</p>
                        <p className="font-medium">{currentSession.totalSales.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Montant attendu</p>
                        <p className="font-medium">{(currentSession.openingAmount + currentSession.totalSales).toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Caissier</p>
                        <p className="font-medium">{currentSession.cashierName || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-900">Comptage de caisse</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Comptez soigneusement l'argent en caisse et saisissez le montant total.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-red-900">Aucune session ouverte</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Aucune session de caisse n'est actuellement ouverte.
                  </p>
                </div>
              )}

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

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Détail du comptage</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">50000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">20000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">10000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">5000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">2000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600">1000 FCFA</p>
                    <p className="font-medium">0</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            


            <button
              onClick={type === 'open' ? handleOpenShift : type === 'count' ? handleCountCash : handleCloseShift}
              disabled={isProcessing || 
                (type === 'open' && shiftData.initialAmount <= 0) || 
                (type === 'close' && (countedAmount <= 0 || !currentSession)) ||
                (type === 'count' && (countedAmount <= 0 || !currentSession))
              }
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