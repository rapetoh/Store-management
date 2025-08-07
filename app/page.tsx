'use client'

import { useState } from 'react'
import { Search, Bell, User, Package, ShoppingCart, BarChart3, Settings, DollarSign, Calculator, ArrowLeft, Percent, AlertTriangle } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import Products from '@/components/Products'
import Sales from '@/components/Orders' // Renamed import from Orders to Sales
import Reports from '@/components/Reports'
import SettingsPage from '@/components/Settings'
import NotificationsModal from '@/components/NotificationsModal'
import InfoModal from '@/components/InfoModal'
import CashRegisterModal from '@/components/CashRegisterModal' // New import
import ReturnModal from '@/components/ReturnModal' // New import
import InventoryModal from '@/components/InventoryModal' // New import
import CustomerModal from '@/components/CustomerModal' // New import
import AdvancedReportsModal from '@/components/AdvancedReportsModal' // New import

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'sales', label: 'Ventes', icon: ShoppingCart }, // Renamed 'orders' to 'sales'
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
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryType, setInventoryType] = useState<'adjustment' | 'transfer' | 'alert' | 'count'>('adjustment')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerModalType, setCustomerModalType] = useState<'search' | 'create' | 'edit' | 'view'>('search')
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

  const handleReturn = () => {
    setShowReturnModal(true)
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

  const handleCustomerSearch = () => {
    setCustomerModalType('search')
    setShowCustomerModal(true)
  }

  const handleCustomerCreate = () => {
    setCustomerModalType('create')
    setShowCustomerModal(true)
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
      case 'sales': // Changed 'orders' to 'sales'
        return <Sales /> // Changed <Orders /> to <Sales />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">StockFlow</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* POS Actions */}
              <div className="flex items-center space-x-2">
                {/* Cash Register */}
                <div className="flex items-center space-x-1">
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
                  <button
                    onClick={handleCloseCashRegister}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Fermer la caisse"
                  >
                    <DollarSign className="w-5 h-5" />
                  </button>
                </div>

                {/* Returns */}
                <button
                  onClick={handleReturn}
                  className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                  title="Retours et remboursements"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Inventory Management */}
                <div className="flex items-center space-x-1">
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
                </div>

                {/* Customer Management */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleCustomerSearch}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Rechercher un client"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCustomerCreate}
                    className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                    title="Nouveau client"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>

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
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleUserProfile}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

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

      <CashRegisterModal
        isOpen={showCashRegisterModal}
        onClose={() => setShowCashRegisterModal(false)}
        type={cashRegisterType}
      />

      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onReturnProcessed={(returnData) => {
          showToast('success', 'Retour traité', `Retour ${returnData.id} traité avec succès`)
        }}
        originalSale={{
          id: 'SALE001',
          saleItems: [
            { id: '1', name: 'Lait 1L', price: 1.20, quantity: 2 },
            { id: '2', name: 'Pain baguette', price: 0.85, quantity: 1 }
          ]
        }}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        onInventoryUpdated={(update) => {
          showToast('success', 'Inventaire mis à jour', 'Les modifications d\'inventaire ont été appliquées')
        }}
        type={inventoryType}
      />

      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerSelected={(customer) => {
          showToast('success', 'Client sélectionné', `Client "${customer.name}" sélectionné`)
        }}
        type={customerModalType}
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