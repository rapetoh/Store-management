'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import AddProductModal from './AddProductModal'
import QuickSaleModal from './QuickSaleModal'

const chartData = [
  { name: 'Lun', ventes: 4000, stock: 2400 },
  { name: 'Mar', ventes: 3000, stock: 1398 },
  { name: 'Mer', ventes: 2000, stock: 9800 },
  { name: 'Jeu', ventes: 2780, stock: 3908 },
  { name: 'Ven', ventes: 1890, stock: 4800 },
  { name: 'Sam', ventes: 2390, stock: 3800 },
  { name: 'Dim', ventes: 3490, stock: 4300 },
]

const pieData = [
  { name: 'Électronique', value: 400, color: '#3B82F6' },
  { name: 'Accessoires', value: 300, color: '#10B981' },
  { name: 'Bureau', value: 200, color: '#6B7280' },
  { name: 'Autres', value: 100, color: '#F59E0B' },
]

const recentProducts = [
  { id: 1, name: 'Souris Sans Fil X2', stock: 150, status: 'En stock', trend: 'up' },
  { id: 2, name: 'Clavier Ergonomique', stock: 20, status: 'Stock faible', trend: 'down' },
  { id: 3, name: 'Hub USB-C', stock: 5, status: 'Stock critique', trend: 'down' },
  { id: 4, name: 'Casque Gaming Pro', stock: 3, status: 'Stock critique', trend: 'down' },
]

export default function Dashboard() {
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    todaySales: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
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

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddProduct = (newProduct: any) => {
    showToast('success', 'Produit ajouté', `Le produit "${newProduct.name}" a été ajouté avec succès !`)
  }

  const handleSaleCompleted = (sale: any) => {
    showToast('success', 'Vente terminée', `La vente ${sale.id} a été enregistrée avec succès !\n\nTotal: €${sale.total.toFixed(2)}`)
    // Refresh stats after sale
    loadStats()
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
          { title: 'Total Produits', value: isLoading ? '...' : (stats?.totalProducts || 0).toString(), icon: Package, color: 'bg-blue-500', change: '' },
          { title: 'Ventes Aujourd\'hui', value: isLoading ? '...' : `€${(stats?.todayRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-500', change: '' },
          { title: 'Alertes Stock', value: isLoading ? '...' : (stats?.lowStockProducts || 0).toString(), icon: AlertTriangle, color: 'bg-red-500', change: '' },
          { title: 'Clients Actifs', value: isLoading ? '...' : (stats?.totalCustomers || 0).toString(), icon: Users, color: 'bg-purple-500', change: '' },
        ].map((stat, index) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ventes" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Produits Récents</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock} unités</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'En stock' ? 'bg-green-100 text-green-800' :
                    product.status === 'Stock faible' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                  {product.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
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
        onSaleCompleted={handleSaleCompleted}
      />
    </div>
  )
} 