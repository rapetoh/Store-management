'use client'

import { useState } from 'react'
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
import InfoModal from './InfoModal'

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
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddProduct = (newProduct: any) => {
    showToast('success', 'Produit ajouté', `Le produit "${newProduct.name}" a été ajouté avec succès !`)
  }

  const handleNewOrder = () => {
    setInfoModalData({
      title: 'Nouvelle commande',
      message: 'Fonctionnalité de création de commande\n\nRedirection vers la section Commandes...\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
      type: 'info',
      icon: 'cart'
    })
    setShowInfoModal(true)
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
            onClick={handleNewOrder}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Nouvelle commande
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Produits', value: '1,247', icon: Package, color: 'bg-blue-500', change: '+12%' },
          { title: 'Ventes du Mois', value: '€45,230', icon: DollarSign, color: 'bg-green-500', change: '+8%' },
          { title: 'Alertes Stock', value: '23', icon: AlertTriangle, color: 'bg-red-500', change: '-5%' },
          { title: 'Clients Actifs', value: '156', icon: Users, color: 'bg-purple-500', change: '+3%' },
        ].map((stat, index) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.change.startsWith('+') ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line 
                type="monotone" 
                dataKey="ventes" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
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
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock} unités</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === 'En stock' ? 'bg-green-100 text-green-700' :
                    product.status === 'Stock faible' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
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

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        type={infoModalData.type}
        icon={infoModalData.icon}
      />
    </div>
  )
} 