'use client'

import { useState, useEffect } from 'react'
import { X, Search, Percent, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxUses?: number
  usedCount: number
  validUntil: Date
  description: string
  isActive: boolean
}

interface PromoCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onPromoCodeSelected: (promoCode: PromoCode) => void
  currentAmount: number
}

export default function PromoCodeModal({ isOpen, onClose, onPromoCodeSelected, currentAmount }: PromoCodeModalProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPromoCodes, setFilteredPromoCodes] = useState<PromoCode[]>([])

  useEffect(() => {
    if (isOpen) {
      loadPromoCodes()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = promoCodes.filter(promo => 
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPromoCodes(filtered)
    } else {
      setFilteredPromoCodes(promoCodes)
    }
  }, [searchTerm, promoCodes])

  const loadPromoCodes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/promocodes')
      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data)
        setFilteredPromoCodes(data)
      }
    } catch (error) {
      console.error('Error loading promo codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isPromoCodeValid = (promo: PromoCode) => {
    const now = new Date()
    const isValidDate = new Date(promo.validUntil) > now
    const hasReachedMaxUses = promo.maxUses ? promo.usedCount >= promo.maxUses : false
    const meetsMinAmount = currentAmount >= promo.minAmount
    
    return isValidDate && !hasReachedMaxUses && meetsMinAmount
  }

  const getPromoCodeStatus = (promo: PromoCode) => {
    if (!isPromoCodeValid(promo)) {
      if (new Date(promo.validUntil) <= new Date()) {
        return { status: 'expired', text: 'Expiré', color: 'text-red-600', bg: 'bg-red-50' }
      }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return { status: 'limit_reached', text: 'Limite atteinte', color: 'text-red-600', bg: 'bg-red-50' }
      }
      if (currentAmount < promo.minAmount) {
        return { status: 'min_amount', text: `Min: ${promo.minAmount.toLocaleString('fr-FR')} FCFA`, color: 'text-orange-600', bg: 'bg-orange-50' }
      }
    }
    return { status: 'valid', text: 'Valide', color: 'text-green-600', bg: 'bg-green-50' }
  }

  const formatDiscount = (promo: PromoCode) => {
    if (promo.type === 'percentage') {
      return `${promo.value}%`
    } else {
      return `${promo.value.toLocaleString('fr-FR')} FCFA`
    }
  }

  const handlePromoCodeSelect = (promo: PromoCode) => {
    if (isPromoCodeValid(promo)) {
      onPromoCodeSelected(promo)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sélectionner un code promo</h2>
            <p className="text-sm text-gray-600">Montant actuel: {currentAmount.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un code promo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement des codes promo...</p>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun code promo trouvé</p>
              <p className="text-sm">Essayez d'autres termes de recherche</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPromoCodes.map((promo) => {
                const status = getPromoCodeStatus(promo)
                const isValid = isPromoCodeValid(promo)
                
                return (
                  <div
                    key={promo.id}
                    className={`p-4 border rounded-lg transition-all ${
                      isValid 
                        ? 'border-green-200 bg-green-50 hover:border-green-300 cursor-pointer' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => isValid && handlePromoCodeSelect(promo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {promo.type === 'percentage' ? (
                              <Percent className="w-4 h-4 text-blue-600" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-green-600" />
                            )}
                            <span className="font-bold text-lg text-gray-900">
                              {promo.code}
                            </span>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.bg}`}>
                            <span className={status.color}>{status.text}</span>
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{promo.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>Réduction:</span>
                            <span className="font-medium text-green-600">{formatDiscount(promo)}</span>
                          </div>
                          
                          {promo.minAmount > 0 && (
                            <div className="flex items-center space-x-1">
                              <span>Min:</span>
                              <span className="font-medium">{promo.minAmount.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          
                          {promo.maxUses && (
                            <div className="flex items-center space-x-1">
                              <span>Utilisations:</span>
                              <span className="font-medium">{promo.usedCount}/{promo.maxUses}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Valide jusqu'au {new Date(promo.validUntil).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      {isValid && (
                        <div className="ml-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>• Les codes promo sont appliqués au montant total du panier</p>
            <p>• Certains codes peuvent avoir des montants minimums requis</p>
            <p>• Un seul code promo peut être appliqué par vente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
