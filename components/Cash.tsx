'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Calendar, Clock, User, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import CashRegisterModal from './CashRegisterModal'

interface CashSession {
  id: string
  sessionDate: string
  startTime: string
  endTime?: string
  openingAmount: number
  closingAmount?: number
  expectedAmount?: number
  actualAmount?: number
  difference?: number
  totalSales: number
  totalTransactions: number
  cashierName?: string
  status: string
  notes?: string
}

export default function Cash() {
  const [sessions, setSessions] = useState<CashSession[]>([])
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [cashRegisterType, setCashRegisterType] = useState<'open' | 'close' | 'count'>('open')

  useEffect(() => {
    loadCashSessions()
  }, [])

  const loadCashSessions = async () => {
    try {
      const response = await fetch('/api/cash')
      const data = await response.json()
      if (data.success) {
        setSessions(data.history || [])
        setCurrentSession(data.currentSession || null)
      }
    } catch (error) {
      console.error('Error loading cash sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCashRegister = () => {
    setCashRegisterType('open')
    setShowCashRegisterModal(true)
  }

  const handleCloseCashRegister = () => {
    setCashRegisterType('close')
    setShowCashRegisterModal(true)
  }

  const handleCountCash = () => {
    setCashRegisterType('count')
    setShowCashRegisterModal(true)
  }

  const handleRecalculateTotals = async () => {
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recalculate'
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Reload the cash sessions to show updated totals
        await loadCashSessions()
        // Show success message
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast({ 
            type: 'success', 
            title: 'Totaux recalculés', 
            message: 'Les totaux de la caisse ont été mis à jour avec succès' 
          })
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error recalculating totals:', error)
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast({ 
          type: 'error', 
          title: 'Erreur', 
          message: 'Impossible de recalculer les totaux' 
        })
      }
    }
  }

  const handleCashRegisterComplete = () => {
    setShowCashRegisterModal(false)
    loadCashSessions()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'counted': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ouverte'
      case 'closed': return 'Fermée'
      case 'counted': return 'Comptée'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Caisse</h1>
          <p className="text-gray-600">Historique et gestion des sessions de caisse</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenCashRegister}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Ouvrir la caisse</span>
          </button>
          <button
            onClick={handleCountCash}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Compter la caisse</span>
          </button>
          <button
            onClick={handleRecalculateTotals}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalculer</span>
          </button>
          <button
            onClick={handleCloseCashRegister}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Fermer la caisse</span>
          </button>
        </div>
      </div>

      {/* Current Position */}
      {currentSession && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Position Actuelle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Montant d'ouverture</div>
              <div className="text-2xl font-bold text-blue-900">
                {currentSession.openingAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Ventes en espèces</div>
              <div className="text-2xl font-bold text-green-900">
                {currentSession.totalSales.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Montant attendu</div>
              <div className="text-2xl font-bold text-purple-900">
                {(currentSession.openingAmount + currentSession.totalSales).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600">Dernier comptage</div>
              <div className="text-2xl font-bold text-orange-900">
                {currentSession.actualAmount ? 
                  `${currentSession.actualAmount.toLocaleString('fr-FR')} FCFA` : 
                  'Non compté'
                }
              </div>
              {currentSession.actualAmount && currentSession.difference && (
                <div className={`text-sm mt-1 ${currentSession.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentSession.difference >= 0 ? '+' : ''}{currentSession.difference.toLocaleString('fr-FR')} FCFA
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Caissier:</strong> {currentSession.cashierName || 'N/A'} | 
              <strong> Ouvert le:</strong> {new Date(currentSession.startTime).toLocaleString('fr-FR')}
            </div>
          </div>
        </div>
      )}

      {/* Cash Sessions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caissier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ouverture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compté</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Différence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Chargement des sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune session de caisse trouvée
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.sessionDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.cashierName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.openingAmount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.totalSales.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.expectedAmount ? `${session.expectedAmount.toLocaleString('fr-FR')} FCFA` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.actualAmount ? `${session.actualAmount.toLocaleString('fr-FR')} FCFA` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {session.difference ? (
                        <span className={session.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {session.difference >= 0 ? '+' : ''}{session.difference.toLocaleString('fr-FR')} FCFA
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CashRegisterModal
        isOpen={showCashRegisterModal}
        onClose={() => setShowCashRegisterModal(false)}
        type={cashRegisterType}
        onComplete={handleCashRegisterComplete}
      />
    </div>
  )
} 