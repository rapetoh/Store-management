'use client'

import { useState } from 'react'
import { Search, Bell, User, Package, ShoppingCart, BarChart3, Settings, DollarSign, Calculator, Percent, AlertTriangle, Users } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import Products from '@/components/Products'
import Sales from '@/components/Orders' // Renamed import from Orders to Sales
import Customers from '@/components/Customers'

import Reports from '@/components/Reports'
import SettingsPage from '@/components/Settings'
import NotificationsModal from '@/components/NotificationsModal'
import InfoModal from '@/components/InfoModal'
import CashRegisterModal from '@/components/CashRegisterModal' // New import

import InventoryModal from '@/components/InventoryModal' // New import

import AdvancedReportsModal from '@/components/AdvancedReportsModal' // New import

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'sales', label: 'Ventes', icon: ShoppingCart },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'reports', label: 'Rapports', icon: BarChart3 },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })
  
  // New states for cash register
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [cashRegisterType, setCashRegisterType] = useState<'open' | 'close' | 'count'>('open')

  // New states for all modals
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryType, setInventoryType] = useState<'adjustment' | 'transfer' | 'alert' | 'count'>('adjustment')

  const [showAdvancedReportsModal, setShowAdvancedReportsModal] = useState(false)
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'customers' | 'financial' | 'custom'>('sales')

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
      // Recherche dans les ventes
      else if (searchTerm.toLowerCase().includes('vente')) { // Changed 'commande' to 'vente'
        setActiveSection('sales') // Changed 'orders' to 'sales'
        showToast('info', 'Recherche', `Recherche pour: "${searchTerm}"\n\nRedirection vers la section Ventes...`) // Changed 'Commandes' to 'Ventes'
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

  // New functions for cash register
  const handleOpenCashRegister = () => {
    setCashRegisterType('open')
    setShowCashRegisterModal(true)
  }

  const handleCloseCashRegister = () => {
    setCashRegisterType('close')
    setShowCashRegisterModal(true)
  }

  const handleCountCash = () => {
    setCashRegisterType('count')
    setShowCashRegisterModal(true)
  }



  const handleInventoryAdjustment = () => {
    setInventoryType('adjustment')
    setShowInventoryModal(true)
  }

  const handleInventoryTransfer = () => {
    setInventoryType('transfer')
    setShowInventoryModal(true)
  }

  const handleInventoryAlerts = () => {
    setInventoryType('alert')
    setShowInventoryModal(true)
  }

  const handleInventoryCount = () => {
    setInventoryType('count')
    setShowInventoryModal(true)
  }



  const handleAdvancedReports = () => {
    setReportType('sales')
    setShowAdvancedReportsModal(true)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <Products />
      case 'sales':
        return <Sales />
      case 'customers':
        return <Customers />

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
      <header className="bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">StockFlow</span>
              </div>
              
              <nav className="hidden md:flex space-x-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors group relative ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.label}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Essential Actions */}
              <div className="flex items-center space-x-1">
                {/* Cash Register */}
                <button
                  onClick={handleOpenCashRegister}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  title="Ouvrir la caisse"
                >
                  <DollarSign className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCountCash}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  title="Compter la caisse"
                >
                  <Calculator className="w-5 h-5" />
                </button>



                {/* Inventory Management */}
                <button
                  onClick={handleInventoryAdjustment}
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                  title="Ajustement de stock"
                >
                  <Package className="w-5 h-5" />
                </button>
                <button
                  onClick={handleInventoryAlerts}
                  className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors"
                  title="Alertes de stock"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>

                {/* Advanced Reports */}
                <button
                  onClick={handleAdvancedReports}
                  className="p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
                  title="Rapports avancés"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={handleNotifications}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleUserProfile}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                title="Profil utilisateur"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
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

      <CashRegisterModal
        isOpen={showCashRegisterModal}
        onClose={() => setShowCashRegisterModal(false)}
        type={cashRegisterType}
      />



      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        onInventoryUpdated={(update) => {
          showToast('success', 'Inventaire mis à jour', 'Les modifications d\'inventaire ont été appliquées')
        }}
        type={inventoryType}
      />



      <AdvancedReportsModal
        isOpen={showAdvancedReportsModal}
        onClose={() => setShowAdvancedReportsModal(false)}
        onReportGenerated={(report) => {
          showToast('success', 'Rapport généré', `Rapport "${report.name}" généré avec succès`)
        }}
        type={reportType}
      />
    </div>
  )
} 