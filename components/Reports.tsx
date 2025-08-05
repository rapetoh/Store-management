'use client'

import { useState } from 'react'
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

const salesData = [
  { month: 'Jan', sales: 45000, profit: 12000, orders: 156 },
  { month: 'Fév', sales: 52000, profit: 14000, orders: 178 },
  { month: 'Mar', sales: 48000, profit: 13000, orders: 165 },
  { month: 'Avr', sales: 61000, profit: 16000, orders: 192 },
  { month: 'Mai', sales: 55000, profit: 15000, orders: 181 },
  { month: 'Jun', sales: 67000, profit: 18000, orders: 210 }
]

const taxData = [
  { period: 'Q1 2024', collected: 8500, deductible: 3200, net: 5300 },
  { period: 'Q2 2024', collected: 9200, deductible: 3500, net: 5700 },
  { period: 'Q3 2024', collected: 7800, deductible: 2900, net: 4900 },
  { period: 'Q4 2024', collected: 10500, deductible: 4100, net: 6400 }
]

const profitData = [
  { category: 'Électronique', revenue: 45000, cost: 32000, margin: 28.9 },
  { category: 'Accessoires', revenue: 28000, cost: 21000, margin: 25.0 },
  { category: 'Bureau', revenue: 22000, cost: 18000, margin: 18.2 },
  { category: 'Gaming', revenue: 35000, cost: 25000, margin: 28.6 }
]

const customerData = [
  { segment: 'VIP', count: 45, revenue: 85000, avgOrder: 1890 },
  { segment: 'Régulier', count: 120, revenue: 65000, avgOrder: 542 },
  { segment: 'Occasionnel', count: 280, revenue: 42000, avgOrder: 150 },
  { segment: 'Nouveau', count: 95, revenue: 18000, avgOrder: 189 }
]

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' },
    { id: 'custom', label: 'Période personnalisée' }
  ]

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleCreateReport = (report: Report) => {
    setSelectedReport(report.id)
    showToast('success', 'Rapport généré', `Le rapport "${report.name}" a été généré avec succès.`)
  }

  const handleViewReport = (report: Report) => {
    setInfoModalData({
      title: report.name,
      message: `Dernière génération: ${report.lastGenerated}\n\n${report.description}\n\nFonctionnalité de visualisation à implémenter.`,
      type: 'info',
      icon: 'info'
    })
    setShowInfoModal(true)
  }

  const handleDownloadReport = (report: Report) => {
    showToast('success', 'Téléchargement', `Le rapport "${report.name}" est en cours de téléchargement...`)
  }

  const handleSetPeriod = (period: string) => {
    setSelectedPeriod(period)
    showToast('info', 'Période mise à jour', `Période sélectionnée: ${periods.find(p => p.id === period)?.label}`)
  }

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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Chiffre d\'affaires', value: '€245,000', change: '+12%', icon: DollarSign, color: 'bg-green-500' },
          { title: 'Commandes', value: '1,082', change: '+8%', icon: Receipt, color: 'bg-blue-500' },
          { title: 'Clients actifs', value: '540', change: '+5%', icon: Users, color: 'bg-purple-500' },
          { title: 'Marge moyenne', value: '28.5%', change: '+2%', icon: Percent, color: 'bg-orange-500' }
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
              >
                Générer
              </button>
              <button
                onClick={() => handleViewReport(report)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Voir le rapport"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownloadReport(report)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Télécharger"
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
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
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
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Tax Report */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport de TVA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="collected" fill="#3B82F6" />
              <Bar dataKey="deductible" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Margins */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marge par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="category" type="category" stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="margin" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments clients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="revenue"
              >
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]} />
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

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé financier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">€245,000</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires</div>
            <div className="text-xs text-green-600 mt-1">+12% vs période précédente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">€69,800</div>
            <div className="text-sm text-gray-600">Bénéfice net</div>
            <div className="text-xs text-blue-600 mt-1">+15% vs période précédente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">28.5%</div>
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
    </div>
  )
} 