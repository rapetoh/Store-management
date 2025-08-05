'use client'

import { useState } from 'react'
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Bell,
  User,
  Download,
  Upload,
  Filter
} from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import Products from '@/components/Products'
import Orders from '@/components/Orders'
import Reports from '@/components/Reports'
import SettingsPage from '@/components/Settings'
import NotificationsModal from '@/components/NotificationsModal'
import InfoModal from '@/components/InfoModal'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'reports', label: 'Rapports', icon: BarChart3 },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Recherche dans les produits
      if (searchTerm.toLowerCase().includes('produit')) {
        setActiveSection('products')
        showToast('info', 'Recherche', `Recherche pour: "${searchTerm}"\n\nRedirection vers la section Produits...`)
      }
      // Recherche dans les commandes
      else if (searchTerm.toLowerCase().includes('commande')) {
        setActiveSection('orders')
        showToast('info', 'Recherche', `Recherche pour: "${searchTerm}"\n\nRedirection vers la section Commandes...`)
      }
      // Recherche générale
      else {
        setInfoModalData({
          title: 'Recherche',
          message: `Recherche pour: "${searchTerm}"\n\nRésultats de recherche à implémenter...\n\nCette fonctionnalité sera développée dans la prochaine version.`,
          type: 'info',
          icon: 'info'
        })
        setShowInfoModal(true)
      }
      setSearchTerm('')
    } else {
      showToast('warning', 'Recherche', 'Veuillez entrer un terme de recherche')
    }
  }

  const handleNotifications = () => {
    setShowNotifications(true)
  }

  const handleUserProfile = () => {
    setActiveSection('settings')
    showToast('info', 'Navigation', 'Navigation vers les paramètres utilisateur')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <Products />
      case 'orders':
        return <Orders />
      case 'reports':
        return <Reports />
      case 'settings':
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">StockFlow</h1>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="w-64 px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button 
                onClick={handleNotifications}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={handleUserProfile}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
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