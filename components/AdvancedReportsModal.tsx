'use client'

import { useState } from 'react'
import { X, BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar, Download, Printer, Filter, PieChart, LineChart } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface AdvancedReportsModalProps {
  isOpen: boolean
  onClose: () => void
  onReportGenerated: (report: any) => void
  type: 'sales' | 'inventory' | 'customers' | 'financial' | 'custom'
}

interface ReportData {
  id: string
  name: string
  type: string
  period: string
  data: any
  generatedAt: string
  filters: any
}

export default function AdvancedReportsModal({ isOpen, onClose, onReportGenerated, type }: AdvancedReportsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null)

  const periods = [
    { id: 'today', label: 'Aujourd\'hui' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' },
    { id: 'custom', label: 'Période personnalisée' }
  ]

  // Données simulées pour les graphiques
  const salesData = [
    { date: '2024-01-01', sales: 1200, transactions: 45, avgTicket: 26.67 },
    { date: '2024-01-02', sales: 1350, transactions: 52, avgTicket: 25.96 },
    { date: '2024-01-03', sales: 980, transactions: 38, avgTicket: 25.79 },
    { date: '2024-01-04', sales: 1650, transactions: 61, avgTicket: 27.05 },
    { date: '2024-01-05', sales: 1420, transactions: 55, avgTicket: 25.82 },
    { date: '2024-01-06', sales: 2100, transactions: 78, avgTicket: 26.92 },
    { date: '2024-01-07', sales: 1850, transactions: 68, avgTicket: 27.21 }
  ]

  const productPerformance = [
    { name: 'Lait 1L', sales: 450, revenue: 540, margin: 0.15 },
    { name: 'Pain baguette', sales: 320, revenue: 272, margin: 0.25 },
    { name: 'Yaourt nature', sales: 280, revenue: 182, margin: 0.20 },
    { name: 'Pommes Golden', sales: 180, revenue: 450, margin: 0.30 },
    { name: 'Eau minérale', sales: 150, revenue: 135, margin: 0.10 }
  ]

  const customerSegments = [
    { name: 'Fidèles', value: 45, color: '#3B82F6' },
    { name: 'Occasionnels', value: 30, color: '#10B981' },
    { name: 'Nouveaux', value: 15, color: '#F59E0B' },
    { name: 'Inactifs', value: 10, color: '#EF4444' }
  ]

  const getTitle = () => {
    switch (type) {
      case 'sales': return 'Rapport des ventes'
      case 'inventory': return 'Rapport d\'inventaire'
      case 'customers': return 'Rapport clients'
      case 'financial': return 'Rapport financier'
      case 'custom': return 'Rapport personnalisé'
      default: return 'Rapport avancé'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'sales': return 'Analyse détaillée des performances de vente'
      case 'inventory': return 'État des stocks et mouvements d\'inventaire'
      case 'customers': return 'Analyse du comportement client'
      case 'financial': return 'Rapport financier complet'
      case 'custom': return 'Créer un rapport personnalisé'
      default: return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'sales': return <TrendingUp className="w-5 h-5" />
      case 'inventory': return <Package className="w-5 h-5" />
      case 'customers': return <Users className="w-5 h-5" />
      case 'financial': return <DollarSign className="w-5 h-5" />
      case 'custom': return <BarChart3 className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const generateReport = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const report: ReportData = {
      id: `REP${Date.now()}`,
      name: `${getTitle()} - ${periods.find(p => p.id === selectedPeriod)?.label}`,
      type,
      period: selectedPeriod,
      data: {
        salesData,
        productPerformance,
        customerSegments,
        summary: {
          totalSales: 10550,
          totalTransactions: 417,
          averageTicket: 25.30,
          topProduct: 'Lait 1L',
          growthRate: 12.5
        }
      },
      generatedAt: new Date().toISOString(),
      filters: selectedFilters
    }

    setGeneratedReport(report)
    setIsGenerating(false)
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    showToast('success', 'Export', `Rapport exporté en ${format.toUpperCase()}`)
  }

  const printReport = () => {
    showToast('success', 'Impression', 'Rapport envoyé à l\'imprimante')
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Filters and controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Period Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Période</h3>
                <div className="space-y-2">
                  {periods.map(period => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedPeriod === period.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={selectedFilters.category || ''}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes les catégories</option>
                      <option value="alimentation">Alimentation</option>
                      <option value="boissons">Boissons</option>
                      <option value="hygiene">Hygiène</option>
                      <option value="maison">Maison</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caissier</label>
                    <select
                      value={selectedFilters.cashier || ''}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, cashier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les caissiers</option>
                      <option value="marie">Marie</option>
                      <option value="jean">Jean</option>
                      <option value="sophie">Sophie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                    <select
                      value={selectedFilters.paymentMethod || ''}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes les méthodes</option>
                      <option value="cash">Espèces</option>
                      <option value="card">Carte bancaire</option>
                      <option value="check">Chèque</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>Générer le rapport</span>
                    </>
                  )}
                </button>

                {generatedReport && (
                  <div className="space-y-2">
                    <button
                      onClick={() => exportReport('pdf')}
                      className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter PDF</span>
                    </button>
                    <button
                      onClick={() => exportReport('excel')}
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter Excel</span>
                    </button>
                    <button
                      onClick={printReport}
                      className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main content - Charts and data */}
            <div className="lg:col-span-3 space-y-6">
              {generatedReport ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Ventes</p>
                          <p className="text-2xl font-bold text-blue-900">€{generatedReport.data.summary.totalSales.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Transactions</p>
                          <p className="text-2xl font-bold text-green-900">{generatedReport.data.summary.totalTransactions}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Ticket Moyen</p>
                          <p className="text-2xl font-bold text-purple-900">€{generatedReport.data.summary.averageTicket}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Croissance</p>
                          <p className="text-2xl font-bold text-orange-900">+{generatedReport.data.summary.growthRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Product Performance */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des produits</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Customer Segments */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments clients</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={customerSegments}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {customerSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des produits</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2">Produit</th>
                              <th className="text-right py-2">Ventes</th>
                              <th className="text-right py-2">Revenus</th>
                              <th className="text-right py-2">Marge</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productPerformance.map((product, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-2">{product.name}</td>
                                <td className="text-right py-2">{product.sales}</td>
                                <td className="text-right py-2">€{product.revenue}</td>
                                <td className="text-right py-2">{(product.margin * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport généré</h3>
                  <p className="text-gray-600">Sélectionnez une période et cliquez sur "Générer le rapport" pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 