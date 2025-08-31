'use client'

import { useState, useEffect } from 'react'
import { X, Package, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'

interface InventoryInsight {
  date: string
  count: number
  status: 'OK' | 'ADJUSTED'
}

interface InventoryInsightsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InventoryInsightsModal({ isOpen, onClose }: InventoryInsightsModalProps) {
  const [insights, setInsights] = useState<InventoryInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalInventoried, setTotalInventoried] = useState(0)

  // Load inventory insights
  const loadInsights = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/inventory/insights')
      const data = await response.json()
      
      setInsights(data.insights || [])
      setTotalProducts(data.totalProducts || 0)
      setTotalInventoried(data.totalInventoried || 0)
    } catch (error) {
      console.error('Error loading inventory insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadInsights()
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'ADJUSTED':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'text-green-600 bg-green-50'
      case 'ADJUSTED':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Insights d'Inventaire</h2>
              <p className="text-sm text-gray-600">Métriques d'inventaire par date</p>
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
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des insights...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Produits</p>
                      <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Inventoriés</p>
                      <p className="text-2xl font-bold text-green-900">{totalInventoried}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {totalProducts > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression d'inventaire</span>
                    <span className="text-sm text-gray-500">{Math.round((totalInventoried / totalProducts) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(totalInventoried / totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Insights List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Inventaires par date
                </h3>
                
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun inventaire effectué</h3>
                    <p className="text-gray-500">
                      Aucun produit n'a encore été inventorié. Commencez votre premier inventaire !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(insight.date)}</p>
                            <p className="text-sm text-gray-500">
                              {insight.count} produit{insight.count > 1 ? 's' : ''} inventorié{insight.count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(insight.status)}`}>
                            {insight.status === 'OK' ? 'OK' : 'Ajusté'}
                          </span>
                          {getStatusIcon(insight.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {insights.length > 0 ? `${insights.length} session${insights.length > 1 ? 's' : ''} d'inventaire` : 'Aucune session d\'inventaire'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 