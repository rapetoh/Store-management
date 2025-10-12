'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText
} from 'lucide-react'

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  details: string
  user: string
  financialImpact: number | null // null for N/A cases
  category: string
  metadata?: string | null
}

export default function Logs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  useEffect(() => {
    loadLogs()
  }, [filterAction, filterDate])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filterAction !== 'all') params.append('action', filterAction)
      if (filterDate !== 'all') {
        const now = new Date()
        if (filterDate === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          params.append('startDate', today.toISOString())
          params.append('endDate', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        } else if (filterDate === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          params.append('startDate', weekAgo.toISOString())
        } else if (filterDate === 'month') {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          params.append('startDate', monthAgo.toISOString())
        }
      }
      params.append('limit', '1000') // Get more logs for better filtering
      
      const response = await fetch(`/api/logs?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error loading logs:', error)
      // For now, show empty state if API fails
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'sale': return <ShoppingCart className="w-4 h-4 text-green-600" />
      case 'adjustment': return <Package className="w-4 h-4 text-yellow-600" />
      case 'purchase': return <TrendingDown className="w-4 h-4 text-blue-600" />
      case 'modification': return <Settings className="w-4 h-4 text-gray-600" />
      case 'login': return <Users className="w-4 h-4 text-purple-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'sale': return 'bg-green-100 text-green-800'
      case 'adjustment': return 'bg-yellow-100 text-yellow-800'
      case 'purchase': return 'bg-blue-100 text-blue-800'
      case 'modification': return 'bg-gray-100 text-gray-800'
      case 'login': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'sale': return 'Vente'
      case 'adjustment': return 'Ajustement'
      case 'purchase': return 'Achat'
      case 'modification': return 'Modification'
      case 'login': return 'Connexion'
      default: return 'Autre'
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || log.action === filterAction
    
    return matchesSearch && matchesAction
  })

  const totalFinancialImpact = filteredLogs.reduce((sum, log) => {
    return sum + (log.financialImpact || 0)
  }, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des logs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs d'activité</h1>
          <p className="text-gray-600">Version Beta - Sera amelioré dans une prochaine version</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les actions</option>
              <option value="sale">Ventes</option>
              <option value="adjustment">Ajustements</option>
              <option value="purchase">Achats</option>
              <option value="modification">Modifications</option>
              <option value="login">Connexions</option>
            </select>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact financier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.financialImpact !== null ? (
                      <span className={`text-sm font-medium ${
                        log.financialImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.financialImpact >= 0 ? '+' : ''}{log.financialImpact.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun log trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune activité ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 