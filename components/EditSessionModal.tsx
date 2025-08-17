'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calculator, FileText, AlertTriangle, Edit } from 'lucide-react'

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

interface EditSessionModalProps {
  isOpen: boolean
  session: CashSession
  onClose: () => void
  onSave: (session: CashSession) => void
}

export default function EditSessionModal({ isOpen, session, onClose, onSave }: EditSessionModalProps) {
  const [editedSession, setEditedSession] = useState<CashSession>(session)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setEditedSession(session)
    }
  }, [isOpen, session])

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      // Recalculate difference if actual amount changed
      if (editedSession.actualAmount !== session.actualAmount) {
        const expectedAmount = editedSession.expectedAmount || (editedSession.openingAmount + editedSession.totalSales)
        const actualAmount = editedSession.actualAmount || 0
        // Difference = Expected - Actual (same logic as in countCash)
        editedSession.difference = expectedAmount - actualAmount
      }

      await onSave(editedSession)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCalculatedDifference = () => {
    const expectedAmount = editedSession.expectedAmount || (editedSession.openingAmount + editedSession.totalSales)
    const actualAmount = editedSession.actualAmount || 0
    // Difference = Expected - Actual (same logic as in countCash)
    return expectedAmount - actualAmount
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Edit className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Modifier la Session</h2>
              <p className="text-xs text-gray-600">Modifier les détails de la session de caisse</p>
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
          {/* Session Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Informations de Session</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Date d'ouverture</p>
                <p className="font-medium">{new Date(session.startTime).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-600">Montant d'ouverture</p>
                <p className="font-medium">{session.openingAmount.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div>
                <p className="text-gray-600">Ventes totales</p>
                <p className="font-medium">{session.totalSales.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div>
                <p className="text-gray-600">Montant attendu</p>
                <p className="font-medium">{(session.expectedAmount || session.openingAmount + session.totalSales).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Actual Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant compté *
              </label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  value={editedSession.actualAmount || ''}
                  onChange={(e) => setEditedSession(prev => ({ 
                    ...prev, 
                    actualAmount: parseFloat(e.target.value) || 0 
                  }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

                         {/* Calculated Difference */}
             {editedSession.actualAmount !== undefined && (
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                 <div className="flex items-center space-x-2 mb-1">
                   <AlertTriangle className="w-3 h-3 text-blue-600" />
                   <span className="text-xs font-medium text-blue-900">Différence calculée</span>
                 </div>
                                   <p className={`text-sm font-medium ${getCalculatedDifference() === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getCalculatedDifference() === 0 ? '' : getCalculatedDifference() > 0 ? '-' : '+'}{Math.abs(getCalculatedDifference()).toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {getCalculatedDifference() === 0 ? 'Parfait' : getCalculatedDifference() > 0 ? 'Manquant' : 'Surplus'} (Attendu - Compté)
                  </p>
               </div>
             )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={editedSession.status}
                onChange={(e) => setEditedSession(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Ouverte</option>
                <option value="counted">Comptée</option>
                <option value="closed">Fermée</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  value={editedSession.notes || ''}
                  onChange={(e) => setEditedSession(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes sur la session..."
                />
              </div>
            </div>
          </div>
        </div>

                 {/* Actions */}
         <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 flex-shrink-0">
           <button
             onClick={onClose}
             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
           >
             Annuler
           </button>
           <button
             onClick={handleSave}
             disabled={isProcessing || editedSession.actualAmount === undefined}
             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
           >
             {isProcessing ? (
               <>
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 <span>Sauvegarde...</span>
               </>
             ) : (
               <>
                 <Save className="w-4 h-4" />
                 <span>Sauvegarder</span>
               </>
             )}
           </button>
         </div>
      </div>
    </div>
  )
} 