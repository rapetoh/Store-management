'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Download, 
  Calendar,
  LineChart,
  FileText,
  Receipt,
  Percent,
  TrendingDown,
  Users,
  Package
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import InfoModal from './InfoModal'
import AdvancedReportsModal from './AdvancedReportsModal'

interface Report {
  id: string
  name: string
  description: string
  type: 'sales' | 'tax' | 'profit' | 'inventory' | 'customers'
  icon: any
  lastGenerated?: string
}

const reports: Report[] = [
  {
    id: 'sales-analysis',
    name: 'Analyse des ventes',
    description: 'Rapport détaillé des ventes par période, produits et clients',
    type: 'sales',
    icon: TrendingUp,
    lastGenerated: '2024-01-15'
  },
  {
    id: 'tax-report',
    name: 'Rapport de TVA',
    description: 'Déclaration de TVA avec calculs automatiques',
    type: 'tax',
    icon: Calculator,
    lastGenerated: '2024-01-10'
  },
  {
    id: 'profit-margin',
    name: 'Marge bénéficiaire',
    description: 'Analyse des marges par produit et catégorie',
    type: 'profit',
    icon: Percent,
    lastGenerated: '2024-01-12'
  },
  {
    id: 'inventory-value',
    name: 'Valeur du stock',
    description: 'Évaluation du stock en cours et rotation',
    type: 'inventory',
    icon: Package,
    lastGenerated: '2024-01-14'
  },
  {
    id: 'customer-analysis',
    name: 'Analyse clients',
    description: 'Comportement d\'achat et fidélité clients',
    type: 'customers',
    icon: Users,
    lastGenerated: '2024-01-08'
  },
  {
    id: 'cash-flow',
    name: 'Flux de trésorerie',
    description: 'Suivi des entrées et sorties de trésorerie',
    type: 'sales',
    icon: DollarSign,
    lastGenerated: '2024-01-13'
  }
]

interface SalesData {
  date: string
  revenue: number
  salesCount: number
}

interface ProductData {
  product: any
  performance: {
    quantitySold: number
    totalRevenue: number
    totalCost: number
    profit: number
    profitMargin: number
    salesCount: number
  }
}

interface CustomerData {
  customer: any
  spending: {
    totalSpent: number
    totalDiscount: number
    orderCount: number
    averageOrderValue: number
  }
  segment: string
}

interface InventoryData {
  products: any[]
  metrics: {
    totalProducts: number
    totalStock: number
    totalValue: number
    totalCost: number
    lowStockProducts: number
    outOfStockProducts: number
    averageStockValue: number
    profitMargin: number
  }
  categoryBreakdown: any[]
}

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [advancedModalType, setAdvancedModalType] = useState<'sales' | 'inventory' | 'customers' | 'financial' | 'custom'>('sales')
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  // Real data states
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [customerData, setCustomerData] = useState<CustomerData[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null)
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    averageMargin: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' },
    { id: 'custom', label: 'Période personnalisée' }
  ]

  // Fetch real data
  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, customDateRange])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      // Calculate date range based on selected period
      const now = new Date()
      let startDate = new Date()
      
      if (selectedPeriod === 'custom') {
        // Use custom date range
        startDate = new Date(customDateRange.startDate)
        const endDate = new Date(customDateRange.endDate)
        const dateParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        
        // Fetch all report data in parallel
        const [salesRes, productsRes, customersRes, inventoryRes] = await Promise.all([
          fetch(`/api/reports/sales?${dateParams}`),
          fetch(`/api/reports/products?${dateParams}`),
          fetch(`/api/reports/customers?${dateParams}`),
          fetch('/api/reports/inventory')
        ])
        
        // Process responses...
        if (salesRes.ok) {
          const salesData = await salesRes.json()
          setSalesData(salesData.chartData || [])
          
          setQuickStats(prev => ({
            ...prev,
            totalRevenue: salesData.totals?.totalRevenue || 0,
            totalSales: salesData.totals?.totalSales || 0
          }))
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProductData(productsData.products || [])
          
          setQuickStats(prev => ({
            ...prev,
            averageMargin: productsData.summary?.averageProfitMargin || 0
          }))
        }

        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomerData(customersData.customers || [])
          
          setQuickStats(prev => ({
            ...prev,
            totalCustomers: customersData.summary?.totalCustomers || 0
          }))
        }

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventoryData(inventoryData)
        }
        
        return
      }
      
      // Handle predefined periods
      switch (selectedPeriod) {
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

      const dateParams = `startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`

      // Fetch all report data in parallel
      const [salesRes, productsRes, customersRes, inventoryRes] = await Promise.all([
        fetch(`/api/reports/sales?${dateParams}`),
        fetch(`/api/reports/products?${dateParams}`),
        fetch(`/api/reports/customers?${dateParams}`),
        fetch('/api/reports/inventory')
      ])

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSalesData(salesData.chartData || [])
        
        // Update quick stats from sales data
        setQuickStats(prev => ({
          ...prev,
          totalRevenue: salesData.totals?.totalRevenue || 0,
          totalSales: salesData.totals?.totalSales || 0
        }))
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProductData(productsData.products || [])
        
        // Update quick stats from products data
        setQuickStats(prev => ({
          ...prev,
          averageMargin: productsData.summary?.averageProfitMargin || 0
        }))
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomerData(customersData.customers || [])
        
        // Update quick stats from customers data
        setQuickStats(prev => ({
          ...prev,
          totalCustomers: customersData.summary?.totalCustomers || 0
        }))
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        setInventoryData(inventoryData)
      }

    } catch (error) {
      console.error('Error fetching report data:', error)
      showToast('error', 'Erreur', 'Impossible de charger les données des rapports')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleCreateReport = (report: Report) => {
    // Map report types to AdvancedReportsModal types
    const modalType = report.type === 'sales' ? 'sales' : 
                     report.type === 'inventory' ? 'inventory' : 
                     report.type === 'customers' ? 'customers' : 
                     report.type === 'profit' ? 'financial' : 'custom'
    
    // Open the AdvancedReportsModal
    setSelectedReport(report.id)
    setShowAdvancedModal(true)
    setAdvancedModalType(modalType)
  }

  const handleViewReport = (report: Report) => {
    // Quick view - show info modal with basic details
    setInfoModalData({
      title: report.name,
      message: `Dernière génération: ${report.lastGenerated}\n\n${report.description}\n\nCliquez sur "Générer" pour voir le rapport complet avec graphiques.`,
      type: 'info',
      icon: 'info'
    })
    setShowInfoModal(true)
  }

  const handleDownloadReport = (report: Report) => {
    try {
      // Generate a simple CSV report based on the report type
      let csvContent = ''
      let filename = `rapport_${report.type}_${new Date().toISOString().split('T')[0]}.csv`
      
      if (report.type === 'sales') {
        csvContent = 'Date,Ventes,Revenus\n'
        // Add sample data or fetch from current sales data
        if (salesData.length > 0) {
          salesData.forEach(item => {
            csvContent += `${new Date(item.date).toLocaleDateString('fr-FR')},${item.salesCount},${item.revenue}\n`
          })
        } else {
          csvContent += `${new Date().toLocaleDateString('fr-FR')},0,0\n`
        }
      } else {
        csvContent = 'Données,Résultat\n'
        csvContent += `Type de rapport,${report.name}\n`
        csvContent += `Dernière génération,${report.lastGenerated}\n`
        csvContent += `Description,${report.description}\n`
      }
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      
      showToast('success', 'Téléchargement', `Le rapport "${report.name}" a été téléchargé`)
    } catch (error) {
      console.error('Download error:', error)
      showToast('error', 'Erreur', 'Erreur lors du téléchargement')
    }
  }

  const handleSetPeriod = (period: string) => {
    setSelectedPeriod(period)
    showToast('info', 'Période mise à jour', `Période sélectionnée: ${periods.find(p => p.id === period)?.label}`)
  }

  const handleAdvancedReportGenerated = (report: any) => {
    showToast('success', 'Rapport généré', `Le rapport "${report.name}" a été généré avec succès.`)
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Prepare chart data
  const salesChartData = salesData.length > 0 ? salesData.map(item => ({
    month: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short' }),
    sales: item.revenue,
    orders: item.salesCount
  })) : []

  const productChartData = productData.length > 0 ? productData.slice(0, 5).map(item => ({
    category: item.product.category?.name || 'Sans catégorie',
    revenue: item.performance.totalRevenue,
    margin: item.performance.profitMargin
  })) : []

  const customerChartData = customerData.length > 0 ? customerData.reduce((acc, item) => {
    const segment = item.segment
    if (!acc.find(s => s.segment === segment)) {
      acc.push({
        segment,
        count: 1,
        revenue: item.spending.totalSpent,
        avgOrder: item.spending.averageOrderValue
      })
    } else {
      const existing = acc.find(s => s.segment === segment)!
      existing.count += 1
      existing.revenue += item.spending.totalSpent
      existing.avgOrder = (existing.avgOrder + item.spending.averageOrderValue) / 2
    }
    return acc
  }, [] as any[]) : []

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Debug logging
  console.log('Chart data debug:', {
    salesData: salesData.length,
    salesChartData: salesChartData.length,
    productData: productData.length,
    productChartData: productChartData.length,
    customerData: customerData.length,
    customerChartData: customerChartData.length
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Analysez vos données et générez des rapports</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => handleSetPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.label}</option>
            ))}
          </select>
          
          {/* Always-visible date inputs */}
          <div className="flex space-x-2 items-center bg-white border border-gray-300 rounded-md p-2">
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              disabled={selectedPeriod !== 'custom'}
              className={`px-2 py-1 border border-gray-300 rounded text-sm ${
                selectedPeriod !== 'custom' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
              }`}
              title={selectedPeriod !== 'custom' ? 'Sélectionnez "Période personnalisée" pour activer' : 'Date de début'}
            />
            <span className={`text-sm ${selectedPeriod !== 'custom' ? 'text-gray-400' : 'text-gray-500'}`}>à</span>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              disabled={selectedPeriod !== 'custom'}
              className={`px-2 py-1 border border-gray-300 rounded text-sm ${
                selectedPeriod !== 'custom' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
              }`}
              title={selectedPeriod !== 'custom' ? 'Sélectionnez "Période personnalisée" pour activer' : 'Date de fin'}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Chiffre d\'affaires', 
            value: formatCurrency(quickStats.totalRevenue), 
            change: '+12%', 
            icon: DollarSign, 
            color: 'bg-green-500' 
          },
          { 
            title: 'Ventes', 
            value: quickStats.totalSales.toString(), 
            change: '+8%', 
            icon: Receipt, 
            color: 'bg-blue-500' 
          },
          { 
            title: 'Clients actifs', 
            value: quickStats.totalCustomers.toString(), 
            change: '+5%', 
            icon: Users, 
            color: 'bg-purple-500' 
          },
          { 
            title: 'Marge moyenne', 
            value: `${quickStats.averageMargin.toFixed(1)}%`, 
            change: '+2%', 
            icon: Percent, 
            color: 'bg-orange-500' 
          }
        ].map((stat, index) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <report.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            </div>
            
            {report.lastGenerated && (
              <p className="text-xs text-gray-500 mb-4">
                Dernière génération: {report.lastGenerated}
              </p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleCreateReport(report)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                title="Ouvrir le rapport complet avec graphiques"
              >
                Générer
              </button>
              <button
                onClick={() => handleDownloadReport(report)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Télécharger en CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Montant']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Aucune donnée de vente disponible</div>
            </div>
          )}
        </div>

        {/* Test Chart - Simple Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Graphique</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Test 1', value: 100 },
              { name: 'Test 2', value: 200 },
              { name: 'Test 3', value: 150 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par catégorie</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : productChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="category" type="category" stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenus']}
                />
                <Bar dataKey="revenue" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Aucune donnée de produit disponible</div>
            </div>
          )}
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments clients</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : customerChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {customerChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenus']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Aucune donnée client disponible</div>
            </div>
          )}
        </div>

        {/* Inventory Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valeur du stock</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : inventoryData ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(inventoryData.metrics.totalValue)}
                </div>
                <div className="text-sm text-gray-600">Valeur totale du stock</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-green-600">
                    {inventoryData.metrics.totalProducts}
                  </div>
                  <div className="text-xs text-gray-600">Produits</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-orange-600">
                    {inventoryData.metrics.lowStockProducts}
                  </div>
                  <div className="text-xs text-gray-600">Stock faible</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Aucune donnée d'inventaire disponible</div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé financier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(quickStats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Chiffre d'affaires</div>
            <div className="text-xs text-green-600 mt-1">+12% vs période précédente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(quickStats.totalRevenue * 0.285)}
            </div>
            <div className="text-sm text-gray-600">Bénéfice estimé</div>
            <div className="text-xs text-blue-600 mt-1">+15% vs période précédente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {quickStats.averageMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Marge moyenne</div>
            <div className="text-xs text-purple-600 mt-1">+2% vs période précédente</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        type={infoModalData.type}
        icon={infoModalData.icon}
      />
      
      <AdvancedReportsModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        onReportGenerated={handleAdvancedReportGenerated}
        type={advancedModalType}
      />
    </div>
  )
} 