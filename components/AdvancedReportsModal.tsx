'use client'

import { useState, useEffect } from 'react'
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
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const periods = [
    { id: 'today', label: 'Aujourd\'hui' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' },
    { id: 'custom', label: 'Période personnalisée' }
  ]

  // Load categories on mount
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      // Auto-generate report when modal opens
      generateReport()
    }
  }, [isOpen])

  // Regenerate report when custom date range changes
  useEffect(() => {
    if (isOpen && selectedPeriod === 'custom') {
      generateReport()
    }
  }, [customDateRange, selectedPeriod])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

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
    setIsLoading(true)
    
    try {
      // Calculate date range based on selected period
      const now = new Date()
      let startDate = new Date()
      let endDate = now
      
      if (selectedPeriod === 'custom') {
        // Use custom date range
        startDate = new Date(customDateRange.startDate)
        endDate = new Date(customDateRange.endDate)
      } else {
        // Handle predefined periods
        switch (selectedPeriod) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate.setMonth(now.getMonth() - 1)
        }
      }

      const dateParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      const categoryParam = selectedFilters.category ? `&categoryId=${selectedFilters.category}` : ''
      const paymentMethodParam = selectedFilters.paymentMethod ? `&paymentMethod=${selectedFilters.paymentMethod}` : ''
      const filterParams = `${dateParams}${categoryParam}${paymentMethodParam}`

      // Fetch real data based on report type
      let reportData: any = {}
      
      switch (type) {
        case 'sales':
          const salesReportRes = await fetch(`/api/reports/sales?${filterParams}`)
          if (salesReportRes.ok) {
            const salesData = await salesReportRes.json()
            reportData = {
              salesData: salesData.chartData || [],
              summary: {
                totalSales: salesData.totals?.totalSales || 0,
                totalRevenue: salesData.totals?.totalRevenue || 0,
                totalDiscount: salesData.totals?.totalDiscount || 0,
                totalTax: salesData.totals?.totalTax || 0,
                valeurMoyenne: salesData.totals?.totalSales > 0 
                  ? salesData.totals.totalRevenue / salesData.totals.totalSales 
                  : 0
              },
              paymentMethods: salesData.paymentMethods || []
            }
          }
          break

        case 'inventory':
          const inventoryReportRes = await fetch('/api/reports/inventory')
          if (inventoryReportRes.ok) {
            const inventoryData = await inventoryReportRes.json()
            reportData = {
              inventoryData: inventoryData,
              summary: {
                totalProducts: inventoryData.metrics?.totalProducts || 0,
                totalValue: inventoryData.metrics?.totalValue || 0,
                lowStockProducts: inventoryData.metrics?.lowStockProducts || 0,
                outOfStockProducts: inventoryData.metrics?.outOfStockProducts || 0
              }
            }
          }
          break

        case 'customers':
          const customersReportRes = await fetch(`/api/reports/customers?${filterParams}`)
          if (customersReportRes.ok) {
            const customersData = await customersReportRes.json()
            reportData = {
              customersData: customersData.customers || [],
              segmentBreakdown: customersData.segmentBreakdown || [],
              summary: {
                totalCustomers: customersData.summary?.totalCustomers || 0,
                totalRevenue: customersData.summary?.totalRevenue || 0,
                averageOrderValue: customersData.summary?.averageOrderValue || 0
              }
            }
          }
          break

        case 'financial':
          // Combine sales and inventory data for financial report
          const [financialSalesRes, financialInventoryRes] = await Promise.all([
            fetch(`/api/reports/sales?${filterParams}`),
            fetch('/api/reports/inventory')
          ])
          
          if (financialSalesRes.ok && financialInventoryRes.ok) {
            const [salesData, inventoryData] = await Promise.all([
              financialSalesRes.json(),
              financialInventoryRes.json()
            ])
            
            reportData = {
              salesData: salesData.chartData || [],
              inventoryData: inventoryData,
              summary: {
                totalRevenue: salesData.totals?.totalRevenue || 0,
                totalCost: inventoryData.metrics?.totalCost || 0,
                totalProfit: (salesData.totals?.totalRevenue || 0) - (inventoryData.metrics?.totalCost || 0),
                profitMargin: salesData.totals?.totalRevenue > 0 
                  ? ((salesData.totals.totalRevenue - (inventoryData.metrics?.totalCost || 0)) / salesData.totals.totalRevenue) * 100
                  : 0
              }
            }
          }
          break

        case 'custom':
          // Custom report - combine multiple data sources
          const [customSalesRes, customInventoryRes, customCustomersRes] = await Promise.all([
            fetch(`/api/reports/sales?${filterParams}`),
            fetch('/api/reports/inventory'),
            fetch(`/api/reports/customers?${filterParams}`)
          ])
          
          if (customSalesRes.ok && customInventoryRes.ok && customCustomersRes.ok) {
            const [salesData, inventoryData, customersData] = await Promise.all([
              customSalesRes.json(),
              customInventoryRes.json(),
              customCustomersRes.json()
            ])
            
            reportData = {
              salesData: salesData.chartData || [],
              inventoryData: inventoryData,
              customersData: customersData.customers || [],
              summary: {
                totalRevenue: salesData.totals?.totalRevenue || 0,
                totalProducts: inventoryData.metrics?.totalProducts || 0,
                totalCustomers: customersData.summary?.totalCustomers || 0
              }
            }
          }
          break
      }

      // Create the report object
      const newReport: ReportData = {
        id: `report-${Date.now()}`,
        name: getTitle(),
        type: type,
        period: selectedPeriod,
        data: reportData,
      generatedAt: new Date().toISOString(),
      filters: selectedFilters
    }

      setGeneratedReport(newReport)
      setIsGenerating(false)
      setIsLoading(false)
      
      // Call the callback
      onReportGenerated(newReport)
      
    } catch (error) {
      console.error('Error generating report:', error)
    setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!generatedReport) {
      showToast('error', 'Erreur', 'Aucun rapport généré à exporter')
      return
    }

    try {
      let content = ''
      let filename = `rapport_${type}_${new Date().toISOString().split('T')[0]}`

      if (format === 'csv') {
        // Generate CSV content
        content = generateCSVContent()
        filename += '.csv'
        
        // Create and download CSV file
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
        
        showToast('success', 'Export CSV', 'Rapport exporté en CSV')
      } else if (format === 'excel') {
        // For now, export as CSV with .xlsx extension (basic Excel format)
        content = generateCSVContent()
        filename += '.xlsx'
        
        const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
        
        showToast('success', 'Export Excel', 'Rapport exporté en Excel')
      } else if (format === 'pdf') {
        // For PDF, we'll create a simple HTML report and print it
        const htmlContent = generateHTMLReport()
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          printWindow.print()
          showToast('success', 'Export PDF', 'Rapport prêt pour impression PDF')
        } else {
          showToast('error', 'Erreur', 'Impossible d\'ouvrir la fenêtre d\'impression')
        }
      }
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', 'Erreur', 'Erreur lors de l\'export')
    }
  }

  const generateCSVContent = () => {
    if (!generatedReport) return ''
    
    let csv = 'Date,Donnée,Valeur\n'
    
    if (type === 'sales' && generatedReport.data.salesData) {
      generatedReport.data.salesData.forEach((item: any) => {
        csv += `${item.date},Ventes,${item.revenue}\n`
        csv += `${item.date},Nombre de ventes,${item.salesCount}\n`
      })
    }
    
    return csv
  }

  const generateHTMLReport = () => {
    if (!generatedReport) return ''
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport ${getTitle()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .summary-item { border: 1px solid #ddd; padding: 15px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .summary-label { color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${getTitle()}</h1>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${formatCurrency(generatedReport.data.summary?.totalRevenue || 0)}</div>
            <div class="summary-label">Chiffre d'affaires</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${generatedReport.data.summary?.totalSales || 0}</div>
            <div class="summary-label">Nombre de ventes</div>
          </div>
        </div>
        
        <h2>Détails</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Ventes</th>
              <th>Revenus</th>
            </tr>
          </thead>
          <tbody>
            ${type === 'sales' && generatedReport.data.salesData ? 
              generatedReport.data.salesData.map((item: any) => `
                <tr>
                  <td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>
                  <td>${item.salesCount}</td>
                  <td>${formatCurrency(item.revenue)}</td>
                </tr>
              `).join('') : ''
            }
          </tbody>
        </table>
      </body>
      </html>
    `
  }

  const printReport = () => {
    if (!generatedReport) {
      showToast('error', 'Erreur', 'Aucun rapport généré à imprimer')
      return
    }

    try {
      const htmlContent = generateHTMLReport()
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
    showToast('success', 'Impression', 'Rapport envoyé à l\'imprimante')
      } else {
        showToast('error', 'Erreur', 'Impossible d\'ouvrir la fenêtre d\'impression')
      }
    } catch (error) {
      console.error('Print error:', error)
      showToast('error', 'Erreur', 'Erreur lors de l\'impression')
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
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
                
                {/* Custom Date Range Inputs */}
                {selectedPeriod === 'custom' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={selectedFilters.category || ''}
                      onChange={(e) => setSelectedFilters((prev: any) => ({ 
                        ...prev, 
                        category: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                    <select
                      value={selectedFilters.paymentMethod || ''}
                      onChange={(e) => setSelectedFilters((prev: any) => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes les méthodes</option>
                      <option value="cash">Espèces</option>
                      <option value="card">Carte bancaire</option>
                      <option value="mobile">Mobile Money</option>
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
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des données...</p>
                </div>
              ) : generatedReport ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {type === 'sales' && (
                      <>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Ventes</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {formatCurrency(generatedReport.data.summary.totalRevenue)}
                              </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Transactions</p>
                              <p className="text-2xl font-bold text-green-900">
                                {generatedReport.data.summary.totalSales}
                              </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                              <p className="text-sm font-medium text-purple-600">Valeur Moyenne</p>
                              <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(generatedReport.data.summary.valeurMoyenne)}
                              </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                              <p className="text-sm font-medium text-orange-600">Remises</p>
                              <p className="text-2xl font-bold text-orange-900">
                                {formatCurrency(generatedReport.data.summary.totalDiscount)}
                              </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                      </>
                    )}

                    {type === 'inventory' && (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Produits</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {generatedReport.data.summary.totalProducts}
                              </p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600">Valeur Stock</p>
                              <p className="text-2xl font-bold text-green-900">
                                {formatCurrency(generatedReport.data.summary.totalValue)}
                              </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-600">Stock Faible</p>
                              <p className="text-2xl font-bold text-orange-900">
                                {generatedReport.data.summary.lowStockProducts}
                              </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                        
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-red-600">Rupture</p>
                              <p className="text-2xl font-bold text-red-900">
                                {generatedReport.data.summary.outOfStockProducts}
                              </p>
                            </div>
                            <X className="w-8 h-8 text-red-600" />
                          </div>
                        </div>
                      </>
                    )}

                    {type === 'customers' && (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Clients</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {generatedReport.data.summary.totalCustomers}
                              </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600">Revenus</p>
                              <p className="text-2xl font-bold text-green-900">
                                {formatCurrency(generatedReport.data.summary.totalRevenue)}
                              </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-600">Valeur Moyenne</p>
                              <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(generatedReport.data.summary.averageOrderValue)}
                              </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                      </>
                    )}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    {type === 'sales' && generatedReport.data.salesData && generatedReport.data.salesData.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
                      <ResponsiveContainer width="100%" height={300}>
                          <RechartsLineChart data={generatedReport.data.salesData.map((item: any) => ({
                            date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
                            revenue: item.revenue,
                            sales: item.salesCount
                          }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Montant']} />
                            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                    )}

                    {/* Payment Methods */}
                    {type === 'sales' && generatedReport.data.paymentMethods && generatedReport.data.paymentMethods.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
                      <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={generatedReport.data.paymentMethods.map((item: any) => ({
                                name: item.method,
                                value: item.amount
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {generatedReport.data.paymentMethods.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Montant']} />
                          </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    )}

                    {/* Customer Segments */}
                    {type === 'customers' && generatedReport.data.segmentBreakdown && generatedReport.data.segmentBreakdown.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments clients</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                              data={generatedReport.data.segmentBreakdown.map((item: any) => ({
                                name: item.name,
                                value: item.totalSpent
                              }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                              {generatedReport.data.segmentBreakdown.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                            ))}
                          </Pie>
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenus']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    )}

                    {/* Detailed Table */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails</h3>
                      <div className="overflow-x-auto">
                        {type === 'sales' && generatedReport.data.salesData && (
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2">Date</th>
                              <th className="text-right py-2">Ventes</th>
                              <th className="text-right py-2">Revenus</th>
                            </tr>
                          </thead>
                          <tbody>
                              {generatedReport.data.salesData.slice(0, 10).map((item: any, index: number) => (
                              <tr key={index} className="border-b border-gray-100">
                                  <td className="py-2">
                                    {new Date(item.date).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td className="text-right py-2">{item.salesCount}</td>
                                  <td className="text-right py-2">{formatCurrency(item.revenue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {type === 'customers' && generatedReport.data.customersData && (
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2">Client</th>
                                <th className="text-right py-2">Commandes</th>
                                <th className="text-right py-2">Total dépensé</th>
                                <th className="text-right py-2">Segment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.data.customersData.slice(0, 10).map((item: any, index: number) => (
                                <tr key={index} className="border-b border-gray-100">
                                  <td className="py-2">{item.customer.name}</td>
                                  <td className="text-right py-2">{item.spending.orderCount}</td>
                                  <td className="text-right py-2">{formatCurrency(item.spending.totalSpent)}</td>
                                  <td className="text-right py-2">{item.segment}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        )}
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