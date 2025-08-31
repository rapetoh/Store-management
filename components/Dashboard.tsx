'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Edit,
  Trash2,
  Settings,
  Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import AddProductModal from './AddProductModal'
import QuickSaleModal from './QuickSaleModal'
import InventoryModal from './InventoryModal'
import { useRouter } from 'next/navigation'

interface RecentActivity {
  id: string
  action: string
  details: string
  user: string
  financialImpact: number | null
  financialDisplay: string
  category: string
  createdAt: string
  timeDisplay: string
  icon: string
  color: string
  bgColor: string
  textColor: string
}

interface DashboardProps {
  onReplenishmentRequest?: (product: any) => void
}

export default function Dashboard({ onReplenishmentRequest }: DashboardProps) {
  const router = useRouter()
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [chartData, setChartData] = useState([
    { name: 'Lun', chiffreAffaire: 0, benefice: 0 },
    { name: 'Mar', chiffreAffaire: 0, benefice: 0 },
    { name: 'Mer', chiffreAffaire: 0, benefice: 0 },
    { name: 'Jeu', chiffreAffaire: 0, benefice: 0 },
    { name: 'Ven', chiffreAffaire: 0, benefice: 0 },
    { name: 'Sam', chiffreAffaire: 0, benefice: 0 },
    { name: 'Dim', chiffreAffaire: 0, benefice: 0 },
  ])
  const [pieData, setPieData] = useState([
    { name: 'Aucune donnée', value: 1, color: '#6B7280' },
  ])
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    todaySales: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    yearRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  useEffect(() => {
    loadStats()
    loadChartData()
    loadCategoryProfitData()
    loadRecentActivities()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      const response = await fetch('/api/dashboard/chart-data')
      const data = await response.json()
      setChartData(data)
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  const loadCategoryProfitData = async () => {
    try {
      const response = await fetch('/api/dashboard/category-profit')
      const data = await response.json()
      if (data.length > 0) {
        setPieData(data)
      }
    } catch (error) {
      console.error('Error loading category profit data:', error)
    }
  }

  const loadRecentActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-activities')
      const data = await response.json()
      setRecentActivities(data)
    } catch (error) {
      console.error('Error loading recent activities:', error)
    }
  }

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-cart':
        return <ShoppingCart className="w-5 h-5" />
      case 'edit':
        return <Edit className="w-5 h-5" />
      case 'trash':
        return <Trash2 className="w-5 h-5" />
      case 'package':
        return <Package className="w-5 h-5" />
      case 'settings':
        return <Settings className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddProduct = () => {
    showToast('success', 'Produit ajouté', 'Le produit a été ajouté avec succès !')
  }

  const handleSaleCompleted = (sale: any) => {
    showToast('success', 'Vente terminée', `La vente ${sale.id} a été enregistrée avec succès !\n\nTotal: ${sale.total.toLocaleString('fr-FR')} FCFA`)
    // Refresh stats and chart data after sale
    loadStats()
    loadChartData()
    loadCategoryProfitData()
  }

  const logActivity = async (action: string, details: string, financialImpact?: number) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
          user: 'Admin', // TODO: Get actual user from auth system
          financialImpact: financialImpact || undefined,
          category: 'Dashboard'
        }),
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const handleRevenueCardClick = () => {
    // Log the dashboard interaction
    logActivity(
      'login',
      'Navigation: Dashboard → Ventes (Chiffre d\'affaires annuel)',
      undefined
    )
    
    // Calculate Jan 1 of current year
    const currentYear = new Date().getFullYear()
    const janFirst = `${currentYear}-01-01`
    const today = new Date().toISOString().split('T')[0]
    
    // Navigate to sales section with date filter
    // Since this is a single-page app, we need to pass the date filter through URL or state
    const url = `/?section=sales&startDate=${janFirst}&endDate=${today}`
    window.location.href = url
  }

  const handleTodaySalesCardClick = () => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Navigate to sales section with today's date filter
    const url = `/?section=sales&startDate=${today}&endDate=${today}`
    window.location.href = url
  }

  const handleStockAlertsCardClick = () => {
    setShowInventoryModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de votre gestion de stock</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ajouter un produit
          </button>
          <button 
            onClick={() => setShowQuickSaleModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Nouvelle vente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Chiffre d\'affaire', value: isLoading ? '...' : `${(stats?.yearRevenue || 0).toLocaleString('fr-FR')} FCFA`, icon: DollarSign, color: 'bg-blue-500', change: '', isClickable: true, handler: handleRevenueCardClick },
          { title: 'Ventes Aujourd\'hui', value: isLoading ? '...' : `${(stats?.todayRevenue || 0).toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: 'bg-green-500', change: '', isClickable: true, handler: handleTodaySalesCardClick },
          { title: 'Alertes Stock', value: isLoading ? '...' : (stats?.lowStockProducts || 0).toString(), icon: AlertTriangle, color: 'bg-red-500', change: '', isClickable: true, handler: handleStockAlertsCardClick },
          { title: 'Clients Actifs', value: isLoading ? '...' : (stats?.totalCustomers || 0).toString(), icon: Users, color: 'bg-purple-500', change: '', isClickable: false, handler: null },
        ].map((stat, index) => (
          <div 
            key={stat.title} 
            className={`bg-white rounded-lg shadow p-6 ${stat.isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={stat.isClickable && stat.handler ? () => stat.handler() : undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.change.startsWith('+') ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">vs mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes (Semaine en cours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value.toLocaleString('fr-FR')} FCFA`, 
                  name
                ]}
                labelFormatter={(label) => {
                  const now = new Date()
                  const currentDay = now.getDay()
                  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1
                  const monday = new Date(now)
                  monday.setDate(now.getDate() - daysFromMonday)
                  const weekStart = monday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                  const weekEnd = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                  return `${label} (${weekStart}-${weekEnd})`
                }}
              />
              <Line 
                type="monotone" 
                dataKey="chiffreAffaire" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Chiffre d'affaire"
              />
              <Line 
                type="monotone" 
                dataKey="benefice" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Bénéfice"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marge Catégorielle (Bénéfices)</h3>
          <p className="text-sm text-gray-600 mb-4">Bénéfices par catégorie depuis le 1er janvier {new Date().getFullYear()}</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}\n${value.toLocaleString('fr-FR')} FCFA`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Bénéfice']}
                labelFormatter={(label) => `${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total des bénéfices: {pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activités Récentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center`}>
                      <div className={activity.textColor}>
                        {getActivityIcon(activity.icon)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.details}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{activity.category}</p>
                        <span className="text-sm text-gray-500">•</span>
                        <p className="text-sm text-gray-600">{activity.user}</p>
                        <span className="text-sm text-gray-500">•</span>
                        <p className="text-sm text-gray-600">{activity.timeDisplay}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      activity.financialImpact && activity.financialImpact > 0 
                        ? 'bg-green-100 text-green-800' 
                        : activity.financialImpact && activity.financialImpact < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.financialDisplay}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleAddProduct}
      />

      <QuickSaleModal
        isOpen={showQuickSaleModal}
        onClose={() => setShowQuickSaleModal(false)}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        type="alert"
        onInventoryUpdated={(data) => {
          // Refresh stats after inventory update
          loadStats()
        }}
        onReplenishmentRequest={onReplenishmentRequest}
      />
    </div>
  )
} 