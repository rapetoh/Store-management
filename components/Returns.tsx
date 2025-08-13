'use client'

import React, { useState, useEffect } from 'react'
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  User
} from 'lucide-react'

interface ReturnInfo {
  saleId: string
  date: string
  reason: string
  items: string
  amount: number
  customer: string
  saleDate: string
}

interface ReturnStats {
  totalReturns: number
  totalAmount: number
  averageReturnAmount: number
  mostReturnedReason: string
  returnsThisMonth: number
}

export default function Returns() {
  const [returns, setReturns] = useState<ReturnInfo[]>([])
  const [stats, setStats] = useState<ReturnStats>({
    totalReturns: 0,
    totalAmount: 0,
    averageReturnAmount: 0,
    mostReturnedReason: '',
    returnsThisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReason, setSelectedReason] = useState('Toutes les raisons')
  const [selectedDate, setSelectedDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadReturns()
  }, [])

  const loadReturns = async () => {
    try {
      // Fetch all sales and extract return information
      const response = await fetch('/api/sales')
      const sales = await response.json()
      
      const returnData: ReturnInfo[] = []
      
      sales.forEach((sale: any) => {
        if (sale.notes) {
          const returnMatches = sale.notes.match(/\[RETOUR - ([^\]]+)\]/g)
          if (returnMatches) {
            returnMatches.forEach((match: string) => {
              const dateMatch = match.match(/\[RETOUR - ([^\]]+)\]/)
              const reasonMatch = sale.notes.match(/Raison: ([^\n]+)/)
              const itemsMatch = sale.notes.match(/Articles retournés: ([^\n]+)/)
              const amountMatch = sale.notes.match(/Montant retourné: €([0-9.]+)/)

              if (dateMatch) {
                returnData.push({
                  saleId: sale.id,
                  date: dateMatch[1],
                  reason: reasonMatch ? reasonMatch[1] : 'Non spécifiée',
                  items: itemsMatch ? itemsMatch[1] : '',
                  amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
                  customer: sale.customer || 'Client anonyme',
                  saleDate: sale.date || sale.saleDate || ''
                })
              }
            })
          }
        }
      })

      setReturns(returnData)
      calculateStats(returnData)
    } catch (error) {
      console.error('Error loading returns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (returnData: ReturnInfo[]) => {
    const totalReturns = returnData.length
    const totalAmount = returnData.reduce((sum, ret) => sum + ret.amount, 0)
    const averageReturnAmount = totalReturns > 0 ? totalAmount / totalReturns : 0
    
    // Count reasons
    const reasonCounts: { [key: string]: number } = {}
    returnData.forEach(ret => {
      reasonCounts[ret.reason] = (reasonCounts[ret.reason] || 0) + 1
    })
    const mostReturnedReason = Object.keys(reasonCounts).reduce((a, b) => 
      reasonCounts[a] > reasonCounts[b] ? a : b, ''
    )

    // Count returns this month
    const thisMonth = new Date().getMonth()
    const returnsThisMonth = returnData.filter(ret => {
      const returnDate = new Date(ret.date)
      return returnDate.getMonth() === thisMonth
    }).length

    setStats({
      totalReturns,
      totalAmount,
      averageReturnAmount,
      mostReturnedReason,
      returnsThisMonth
    })
  }

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReason = selectedReason === 'Toutes les raisons' || ret.reason === selectedReason
    const matchesDate = !selectedDate || ret.date.includes(selectedDate)
    
    return matchesSearch && matchesReason && matchesDate
  })

  const reasons = ['Toutes les raisons', ...Array.from(new Set(returns.map(r => r.reason)))]

  const handleExport = () => {
    const csvContent = [
      ['ID Vente', 'Client', 'Date de retour', 'Raison', 'Articles retournés', 'Montant', 'Date de vente'],
      ...filteredReturns.map(r => [
        r.saleId, 
        r.customer, 
        r.date, 
        r.reason, 
        r.items, 
        r.amount.toString(), 
        r.saleDate
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'retours.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Chargement des retours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des retours</h1>
          <p className="text-gray-600">Suivez et analysez les retours de produits</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total retours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReturns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.averageReturnAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Raison principale</p>
              <p className="text-sm font-bold text-gray-900 truncate">{stats.mostReturnedReason}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats.returnsThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des retours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {reasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Historique des retours ({filteredReturns.length})
          </h3>
        </div>
        
        {filteredReturns.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun retour trouvé</h3>
            <p className="text-gray-600">
              {returns.length === 0 
                ? "Aucun retour n'a encore été enregistré." 
                : "Aucun retour ne correspond aux critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de retour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturns.map((ret, index) => (
                  <tr key={`${ret.saleId}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ret.saleId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ret.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ret.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {ret.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ret.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      -€{ret.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 