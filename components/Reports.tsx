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
  type: 'sales' | 'inventory' | 'customers'
  icon: any
}

const reports: Report[] = [
  {
    id: 'sales-analysis',
    name: 'Analyse des ventes',
    type: 'sales',
    icon: TrendingUp
  },
  {
    id: 'inventory-value',
    name: 'Valeur du stock',
    type: 'inventory',
    icon: Package
  },
  {
    id: 'customer-analysis',
    name: 'Analyse clients',
    type: 'customers',
    icon: Users
  },
  {
    id: 'cash-flow',
    name: 'Flux de trésorerie',
    type: 'sales',
    icon: DollarSign
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
    totalActiveCustomers: 0,
    averageMargin: 0
  })
  const [previousPeriodStats, setPreviousPeriodStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    averageMargin: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustomerSalesModal, setShowCustomerSalesModal] = useState(false)
  const [customerSales, setCustomerSales] = useState<any[]>([])
  const [isLoadingSales, setIsLoadingSales] = useState(false)

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

  const fetchCustomerSales = async (customerId: string) => {
    setIsLoadingSales(true)
    try {
      // Use the same date range from the current filter
      const params = new URLSearchParams()
      params.append('customerId', customerId)
      
      if (selectedPeriod === 'custom') {
        params.append('startDate', new Date(customDateRange.startDate).toISOString())
        params.append('endDate', new Date(customDateRange.endDate).toISOString())
      }
      
      const response = await fetch(`/api/sales?${params}`)
      if (response.ok) {
        const sales = await response.json()
        setCustomerSales(sales)
      } else {
        console.error('Failed to fetch customer sales')
        setCustomerSales([])
      }
    } catch (error) {
      console.error('Error fetching customer sales:', error)
      setCustomerSales([])
    } finally {
      setIsLoadingSales(false)
    }
  }

  const navigateToSaleInOrdersTab = (saleId: string) => {
    // Navigate to sales tab with pre-search for this sale ID
    const url = new URL(window.location.href)
    url.searchParams.set('section', 'sales')
    url.searchParams.set('search', saleId)
    window.location.href = url.toString()
  }

  const calculatePreviousPeriod = () => {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()
    let prevStartDate = new Date()
    let prevEndDate = new Date()

    if (selectedPeriod === 'custom') {
      startDate = new Date(customDateRange.startDate)
      endDate = new Date(customDateRange.endDate)
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      prevEndDate = new Date(startDate)
      prevEndDate.setDate(prevEndDate.getDate() - 1)
      prevStartDate = new Date(prevEndDate)
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff)
    } else {
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          prevStartDate.setDate(now.getDate() - 14)
          prevEndDate.setDate(now.getDate() - 8)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          prevStartDate.setMonth(now.getMonth() - 2)
          prevEndDate.setMonth(now.getMonth() - 1)
          prevEndDate.setDate(prevEndDate.getDate() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          prevStartDate.setMonth(now.getMonth() - 6)
          prevEndDate.setMonth(now.getMonth() - 3)
          prevEndDate.setDate(prevEndDate.getDate() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          prevStartDate.setFullYear(now.getFullYear() - 2)
          prevEndDate.setFullYear(now.getFullYear() - 1)
          prevEndDate.setDate(prevEndDate.getDate() - 1)
          break
        default:
          return null
      }
    }

    return {
      current: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      previous: { startDate: prevStartDate.toISOString(), endDate: prevEndDate.toISOString() }
    }
  }

  const calculatePercentageChange = (current: number, previous: number): { change: string, isPositive: boolean, tooltip: string } => {
    // If both are zero or very close to zero, show no change
    if (Math.abs(current) < 0.01 && Math.abs(previous) < 0.01) {
      return { change: '0%', isPositive: true, tooltip: 'Aucune donnée pour les deux périodes' }
    }
    
    // If previous period is zero but current has data, show "NEW"
    if (Math.abs(previous) < 0.01 && current > 0) {
      return { change: 'NOUVEAU', isPositive: true, tooltip: `Nouvelle activité cette période: ${current.toLocaleString('fr-FR')}` }
    }
    
    // If current is zero but previous had data, show significant drop
    if (Math.abs(current) < 0.01 && previous > 0) {
      return { change: '-100%', isPositive: false, tooltip: `Aucune activité cette période (précédente: ${previous.toLocaleString('fr-FR')})` }
    }
    
    // Normal percentage calculation
    const percentChange = ((current - previous) / previous) * 100
    const isPositive = percentChange >= 0
    
    // Cap extreme percentages for display
    let displayChange = percentChange
    if (Math.abs(percentChange) > 999) {
      displayChange = isPositive ? 999 : -999
    }
    
    const changeStr = isPositive ? `+${displayChange.toFixed(1)}%` : `${displayChange.toFixed(1)}%`
    const tooltip = `Période actuelle: ${current.toLocaleString('fr-FR')} | Période précédente: ${previous.toLocaleString('fr-FR')}`
    
    return { change: changeStr, isPositive, tooltip }
  }

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
          fetch(`/api/reports/inventory?${dateParams}`)
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
            totalCustomers: customersData.summary?.totalCustomers || 0,
            totalActiveCustomers: customersData.summary?.totalActiveCustomers || 0
          }))
        }

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventoryData(inventoryData)
        }

        // Fetch previous period data for comparison
        const periods = calculatePreviousPeriod()
        if (periods) {
          const prevDateParams = `startDate=${periods.previous.startDate}&endDate=${periods.previous.endDate}`
          try {
            const [prevSalesRes, prevProductsRes, prevCustomersRes] = await Promise.all([
              fetch(`/api/reports/sales?${prevDateParams}`),
              fetch(`/api/reports/products?${prevDateParams}`),
              fetch(`/api/reports/customers?${prevDateParams}`)
            ])

            let prevStats = { totalRevenue: 0, totalSales: 0, totalCustomers: 0, averageMargin: 0 }

            if (prevSalesRes.ok) {
              const prevSalesData = await prevSalesRes.json()
              prevStats.totalRevenue = prevSalesData.totals?.totalRevenue || 0
              prevStats.totalSales = prevSalesData.totals?.totalSales || 0
            }

            if (prevProductsRes.ok) {
              const prevProductsData = await prevProductsRes.json()
              prevStats.averageMargin = prevProductsData.summary?.averageProfitMargin || 0
            }

            if (prevCustomersRes.ok) {
              const prevCustomersData = await prevCustomersRes.json()
              prevStats.totalCustomers = prevCustomersData.summary?.totalCustomers || 0
            }

            setPreviousPeriodStats(prevStats)
          } catch (error) {
            console.error('Error fetching previous period data:', error)
            // Don't break if previous period fetch fails
            setPreviousPeriodStats({ totalRevenue: 0, totalSales: 0, totalCustomers: 0, averageMargin: 0 })
          }
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
        fetch(`/api/reports/inventory?${dateParams}`)
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
          totalCustomers: customersData.summary?.totalCustomers || 0,
          totalActiveCustomers: customersData.summary?.totalActiveCustomers || 0
        }))
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        setInventoryData(inventoryData)
      }

      // Fetch previous period data for comparison (for predefined periods)
      const periods = calculatePreviousPeriod()
      if (periods) {
        const prevDateParams = `startDate=${periods.previous.startDate}&endDate=${periods.previous.endDate}`
        try {
          const [prevSalesRes, prevProductsRes, prevCustomersRes] = await Promise.all([
            fetch(`/api/reports/sales?${prevDateParams}`),
            fetch(`/api/reports/products?${prevDateParams}`),
            fetch(`/api/reports/customers?${prevDateParams}`)
          ])

          let prevStats = { totalRevenue: 0, totalSales: 0, totalCustomers: 0, averageMargin: 0 }

          if (prevSalesRes.ok) {
            const prevSalesData = await prevSalesRes.json()
            prevStats.totalRevenue = prevSalesData.totals?.totalRevenue || 0
            prevStats.totalSales = prevSalesData.totals?.totalSales || 0
          }

          if (prevProductsRes.ok) {
            const prevProductsData = await prevProductsRes.json()
            prevStats.averageMargin = prevProductsData.summary?.averageProfitMargin || 0
          }

          if (prevCustomersRes.ok) {
            const prevCustomersData = await prevCustomersRes.json()
            prevStats.totalCustomers = prevCustomersData.summary?.totalCustomers || 0
          }

          setPreviousPeriodStats(prevStats)
        } catch (error) {
          console.error('Error fetching previous period data:', error)
          // Don't break if previous period fetch fails
          setPreviousPeriodStats({ totalRevenue: 0, totalSales: 0, totalCustomers: 0, averageMargin: 0 })
        }
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
                     report.type === 'customers' ? 'customers' : 'custom'
    
    // Open the AdvancedReportsModal
    setSelectedReport(report.id)
    setShowAdvancedModal(true)
    setAdvancedModalType(modalType)
  }

  const handleViewReport = (report: Report) => {
    // Quick view - show info modal with basic details
    setInfoModalData({
      title: report.name,
      message: `Cliquez sur "Générer" pour voir le rapport complet avec graphiques.`,
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
        csvContent += `Date de génération,${new Date().toLocaleDateString('fr-FR')}\n`
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

  const productChartData = productData.length > 0 ? productData.reduce((acc, item) => {
    const categoryName = item.product.category?.name || 'Sans catégorie'
    const existingCategory = acc.find(cat => cat.category === categoryName)
    
    if (existingCategory) {
      existingCategory.revenue += item.performance.totalRevenue
      existingCategory.totalProducts += 1
      existingCategory.totalProfit += item.performance.profit
      existingCategory.margin = existingCategory.totalProfit / existingCategory.revenue * 100
    } else {
      acc.push({
        category: categoryName,
        revenue: item.performance.totalRevenue,
        margin: item.performance.profitMargin,
        totalProducts: 1,
        totalProfit: item.performance.profit
      })
    }
    return acc
  }, [] as any[]).sort((a, b) => b.revenue - a.revenue).slice(0, 5) : []

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
    productChartDataContent: productChartData,
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
        {(() => {
          const revenueChange = calculatePercentageChange(quickStats.totalRevenue, previousPeriodStats.totalRevenue)
          const salesChange = calculatePercentageChange(quickStats.totalSales, previousPeriodStats.totalSales)
          const customersChange = calculatePercentageChange(quickStats.totalCustomers, previousPeriodStats.totalCustomers)
          const marginChange = calculatePercentageChange(quickStats.averageMargin, previousPeriodStats.averageMargin)
          
          return [
            { 
              title: 'Chiffre d\'affaires', 
              value: formatCurrency(quickStats.totalRevenue), 
              change: revenueChange.change,
              changeTooltip: revenueChange.tooltip,
              isPositive: revenueChange.isPositive,
              icon: DollarSign, 
              color: 'bg-green-500' 
            },
            { 
              title: 'Ventes', 
              value: quickStats.totalSales.toString(), 
              change: salesChange.change,
              changeTooltip: salesChange.tooltip,
              isPositive: salesChange.isPositive,
              icon: Receipt, 
              color: 'bg-blue-500' 
            },
            { 
              title: 'Clients acheteurs', 
              value: `${quickStats.totalCustomers} / ${quickStats.totalActiveCustomers}`, 
              change: customersChange.change,
              changeTooltip: customersChange.tooltip,
              isPositive: customersChange.isPositive,
              icon: Users, 
              color: 'bg-purple-500' 
            },
            { 
              title: 'Marge moyenne', 
              value: `${quickStats.averageMargin.toFixed(1)}%`, 
              change: marginChange.change,
              changeTooltip: marginChange.tooltip,
              isPositive: marginChange.isPositive,
              icon: Percent, 
              color: 'bg-orange-500' 
            }
          ]
        })().map((stat, index) => (
          <div 
            key={stat.title} 
            className={`bg-white rounded-lg shadow p-6 ${stat.title === 'Clients acheteurs' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={stat.title === 'Clients acheteurs' ? () => setShowCustomerDetailsModal(true) : undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center justify-between mt-2">
                  <div 
                    className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'} cursor-help`}
                    title={stat.changeTooltip}
                  >
                    {stat.change}
                  </div>
                  {stat.title === 'Clients acheteurs' && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-xs font-medium">Voir</span>
                    </div>
                  )}
                </div>
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
              </div>
            </div>

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


        {/* Product Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par catégorie</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : productChartData.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Données trouvées: {productChartData.length} catégorie(s)
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productChartData} margin={{ top: 20, right: 20, left: 40, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#6B7280"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                      return value.toString()
                    }}
                    domain={[0, 'dataMax']}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenus']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3B82F6" 
                    radius={[3, 3, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Category Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {productChartData.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{item.category}</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(item.revenue)}</div>
                    <div className="text-xs text-gray-500">{item.margin.toFixed(1)}% marge</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Aucune donnée de vente par catégorie</div>
                <div className="text-sm text-gray-400">
                  Produits trouvés: {productData.length} | Période: {selectedPeriod}
                </div>
              </div>
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="revenue"
                        label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
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
                        formatter={(value: any, name: string) => [formatCurrency(value), 'Revenus']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Segments Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Détails par segment</h4>
                  {customerChartData.map((segment, index) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">{segment.segment}</div>
                          <div className="text-sm text-gray-600">{segment.count} client(s)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(segment.revenue)}</div>
                        <div className="text-sm text-gray-600">{formatCurrency(segment.avgOrder)} moy.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Segment Explanation */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Critères de segmentation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-700">
                  <div><span className="font-medium">Bronze:</span> &lt; 200K FCFA</div>
                  <div><span className="font-medium">Argent:</span> 200K - 500K FCFA</div>
                  <div><span className="font-medium">Or:</span> 500K - 1M FCFA</div>
                  <div><span className="font-medium">Diamant:</span> &gt; 1M FCFA</div>
                </div>
              </div>
            </div>
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
            <div className={`text-xs mt-1 ${calculatePercentageChange(quickStats.totalRevenue, previousPeriodStats.totalRevenue).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {calculatePercentageChange(quickStats.totalRevenue, previousPeriodStats.totalRevenue).change} vs période précédente
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {quickStats.totalSales}
            </div>
            <div className="text-sm text-gray-600">Nombre de ventes</div>
            <div className={`text-xs mt-1 ${calculatePercentageChange(quickStats.totalSales, previousPeriodStats.totalSales).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {calculatePercentageChange(quickStats.totalSales, previousPeriodStats.totalSales).change} vs période précédente
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {quickStats.averageMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Marge moyenne</div>
            <div className={`text-xs mt-1 ${calculatePercentageChange(quickStats.averageMargin, previousPeriodStats.averageMargin).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {calculatePercentageChange(quickStats.averageMargin, previousPeriodStats.averageMargin).change} vs période précédente
            </div>
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

      {/* Customer Details Modal */}
      {showCustomerDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Clients acheteurs</h3>
                <p className="text-sm text-gray-600 mt-1">{quickStats.totalCustomers} clients ont effectué des achats</p>
              </div>
              <button
                onClick={() => setShowCustomerDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Cliquez sur un client pour voir ses achats</p>
              </div>
              
              {/* Scrollable customer list */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {customerData.length > 0 ? (
                  customerData.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={async () => {
                        setSelectedCustomer(item)
                        setShowCustomerSalesModal(true)
                        await fetchCustomerSales(item.customer.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {item.customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.customer.name}</p>
                              <p className="text-sm text-gray-600">{item.customer.email || item.customer.phone}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {item.spending.totalSpent.toLocaleString('fr-FR')} FCFA
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.spending.orderCount} commande{item.spending.orderCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="ml-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Aucun client acheteur pour cette période</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowCustomerDetailsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Sales Modal */}
      {showCustomerSalesModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedCustomer.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.customer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.customer.email || selectedCustomer.customer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomerSalesModal(false)
                  setSelectedCustomer(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.spending.orderCount}</p>
                    <p className="text-sm text-gray-600">Commande{selectedCustomer.spending.orderCount > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedCustomer.spending.totalSpent.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-sm text-gray-600">Total dépensé</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.spending.averageOrderValue.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-sm text-gray-600">Panier moyen</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Historique des achats</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Cliquez sur une vente pour aller directement à l'onglet Ventes
                </p>
                
                {/* Sales list */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {isLoadingSales ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Chargement des ventes...</span>
                    </div>
                  ) : customerSales.length > 0 ? (
                    customerSales.map((sale, index) => (
                      <div 
                        key={sale.id} 
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navigateToSaleInOrdersTab(sale.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Vente #{sale.id.slice(-8)}</p>
                                <p className="text-sm text-gray-600">{sale.date} à {sale.time}</p>
                                <p className="text-xs text-gray-500">{sale.items} article{sale.items > 1 ? 's' : ''} • {sale.paymentMethod}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {sale.total.toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{sale.status}</p>
                          </div>
                          
                          <div className="ml-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Aucune vente pour cette période</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowCustomerSalesModal(false)
                  setSelectedCustomer(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Retour à la liste
              </button>
              <button
                onClick={() => {
                  setShowCustomerSalesModal(false)
                  setSelectedCustomer(null)
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 