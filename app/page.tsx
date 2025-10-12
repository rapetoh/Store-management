'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useReceiptSettings } from '@/contexts/ReceiptSettingsContext'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, User, Package, ShoppingCart, BarChart3, Settings, DollarSign, Calculator, Percent, AlertTriangle, Users, CreditCard, Warehouse, FileText } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import Products from '@/components/Products'
import Sales from '@/components/Orders' // Renamed import from Orders to Sales
import Customers from '@/components/Customers'

import Reports from '@/components/Reports'
import SettingsPage from '@/components/Settings'
import NotificationsModal from '@/components/NotificationsModal'
import InfoModal from '@/components/InfoModal'
import CashRegisterModal from '@/components/CashRegisterModal' // New import
import Cash from '@/components/Cash' // New import
import ProtectedRoute from '@/components/ProtectedRoute'
import UserProfileModal from '@/components/UserProfileModal'

import InventoryModal from '@/components/InventoryModal' // New import
import Inventory from '@/components/Inventory' // New import
import Logs from '@/components/Logs' // New import
import InventoryInsightsModal from '@/components/InventoryInsightsModal' // New import

import AdvancedReportsModal from '@/components/AdvancedReportsModal' // New import

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, requiredRole: 'admin' },
  { id: 'products', label: 'Produits', icon: Package, requiredRole: null }, // Accessible to all
  { id: 'inventory', label: 'Inventaire', icon: Warehouse, requiredRole: 'admin' },
  { id: 'sales', label: 'Ventes', icon: ShoppingCart, requiredRole: null }, // Accessible to all
  { id: 'customers', label: 'Clients', icon: Users, requiredRole: null }, // Accessible to all
  { id: 'reports', label: 'Rapports', icon: BarChart3, requiredRole: 'admin' },
  { id: 'cash', label: 'Caisse', icon: CreditCard, requiredRole: 'admin' },
  { id: 'logs', label: 'Logs', icon: FileText, requiredRole: 'admin' },
  { id: 'settings', label: 'Paramètres', icon: Settings, requiredRole: 'admin' },
]

// Utility function to check if user has access to a feature
const hasAccess = (requiredRole: string | null, userRole: string | undefined) => {
  if (requiredRole === null) return true // Feature accessible to all
  if (requiredRole === 'admin') return userRole === 'admin'
  return false
}

// Filter navigation items based on user role
const getFilteredNavigationItems = (userRole: string | undefined) => {
  return navigationItems.filter(item => hasAccess(item.requiredRole, userRole))
}

export default function Home() {
  const searchParams = useSearchParams()
  const { unreadCount, refreshCount } = useNotificationCount()
  const { companyInfo } = useReceiptSettings()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  // Set default section based on user role
  const getDefaultSection = (userRole: string | undefined) => {
    return userRole === 'admin' ? 'dashboard' : 'sales'
  }
  
  const [activeSection, setActiveSection] = useState(() => {
    return getDefaultSection(user?.role)
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })
  
  const [showUserProfileModal, setShowUserProfileModal] = useState(false)
  
  // New states for cash register
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false)
  const [cashRegisterType, setCashRegisterType] = useState<'open' | 'close' | 'count'>('open')
  const [currentCashSession, setCurrentCashSession] = useState<any>(null)

  // New states for all modals
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryType, setInventoryType] = useState<'adjustment' | 'transfer' | 'alert' | 'count'>('adjustment')
  const [showInventoryInsightsModal, setShowInventoryInsightsModal] = useState(false)

  const [showAdvancedReportsModal, setShowAdvancedReportsModal] = useState(false)
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'customers' | 'custom'>('sales')

  // State for replenishment modal
  const [showReplenishmentModal, setShowReplenishmentModal] = useState(false)
  const [selectedProductForReplenishment, setSelectedProductForReplenishment] = useState<any>(null)

  // Check URL parameters on mount and when they change with role-based restrictions
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && ['dashboard', 'products', 'inventory', 'sales', 'customers', 'reports', 'cash', 'logs', 'settings'].includes(section)) {
      // Check if user has access to the requested section
      const sectionAccess = navigationItems.find(item => item.id === section)
      if (sectionAccess && hasAccess(sectionAccess.requiredRole, user?.role)) {
        setActiveSection(section)
      } else if (user?.role) {
        // Redirect to default section if no access
        setActiveSection(getDefaultSection(user.role))
      }
    }
  }, [searchParams, user?.role])

  // Check cash register status on component mount and when needed
  useEffect(() => {
    checkCashRegisterStatus()
  }, [])

  // Handle role-based access control
  useEffect(() => {
    if (user?.role) {
      // Check if current active section is accessible by user
      const currentSectionAccess = navigationItems.find(item => item.id === activeSection)
      if (currentSectionAccess && !hasAccess(currentSectionAccess.requiredRole, user.role)) {
        // Redirect to default section for user role
        setActiveSection(getDefaultSection(user.role))
      }
    }
  }, [user?.role, activeSection])

  const checkCashRegisterStatus = async () => {
    try {
      const response = await fetch('/api/cash')
      const data = await response.json()
      setCurrentCashSession(data.currentSession)
    } catch (error) {
      console.error('Error checking cash register status:', error)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }


  const handleNotifications = () => {
    setShowNotifications(true)
    refreshCount() // Refresh notification count when opening modal
  }

  const handleUserProfile = () => {
    setActiveSection('settings')
    // Clear URL parameters when navigating to settings
    const url = new URL(window.location.href)
    url.searchParams.delete('startDate')
    url.searchParams.delete('endDate')
    url.searchParams.set('section', 'settings')
    window.history.replaceState({}, '', url.toString())
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

  // Handle cash register modal close to refresh status
  const handleCashRegisterModalClose = () => {
    setShowCashRegisterModal(false)
    // Refresh cash register status after modal closes
    setTimeout(() => {
      checkCashRegisterStatus()
    }, 500)
  }

  const handleInventoryAdjustment = () => {
    setShowInventoryInsightsModal(true)
  }

  const handleInventoryTransfer = () => {
    setInventoryType('transfer')
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

  const generateLogoText = () => {
    if (!companyInfo.name) return 'S'
    
    const words = companyInfo.name.trim().split(/\s+/)
    if (words.length === 1) {
      // Single word: take first letter
      return words[0].charAt(0).toUpperCase()
    } else {
      // Multiple words: take first letter of each word
      return words.map((word: string) => word.charAt(0).toUpperCase()).join('')
    }
  }

  const handleReplenishmentRequest = (product: any) => {
    setSelectedProductForReplenishment(product)
    setShowReplenishmentModal(true)
    // Navigate to inventory section to show the replenishment modal
    setActiveSection('inventory')
    
    // Reset the state after a short delay to allow the modal to open
    setTimeout(() => {
      setShowReplenishmentModal(false)
      setSelectedProductForReplenishment(null)
    }, 100)
  }

  const renderContent = () => {
    // Get date parameters for sales filtering
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Check if user has access to current section
    const currentSectionAccess = navigationItems.find(item => item.id === activeSection)
    if (currentSectionAccess && !hasAccess(currentSectionAccess.requiredRole, user?.role)) {
      // Show access denied for restricted sections
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Accès restreint</h2>
          <p className="text-gray-500 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <button
            onClick={() => setActiveSection(getDefaultSection(user?.role))}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      )
    }
    
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onReplenishmentRequest={handleReplenishmentRequest} />
      case 'products':
        return <Products />
      case 'inventory':
        return <Inventory 
          preSelectedProduct={selectedProductForReplenishment}
          showReplenishmentModalOnMount={showReplenishmentModal}
        />
      case 'sales':
        return <Sales key={`sales-${startDate}-${endDate}`} />
      case 'customers':
        return <Customers />
      case 'reports':
        return <Reports />
      case 'cash':
        return <Cash />
      case 'logs':
        return <Logs />
      case 'settings':
        return <SettingsPage />
      default:
        return user?.role === 'admin' ? <Dashboard onReplenishmentRequest={handleReplenishmentRequest} /> : <Sales key={`sales-${startDate}-${endDate}`} />
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
                  <span className="text-white font-bold text-sm">{generateLogoText()}</span>
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">{companyInfo.name}</span>
              </div>
              
              <nav className="hidden md:flex space-x-2">
                {getFilteredNavigationItems(user?.role).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id)
                      // Clear URL parameters when navigating to non-sales sections
                      if (item.id !== 'sales') {
                        const url = new URL(window.location.href)
                        url.searchParams.delete('startDate')
                        url.searchParams.delete('endDate')
                        url.searchParams.set('section', item.id)
                        window.history.replaceState({}, '', url.toString())
                      }
                    }}
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

            {/* Actions */}
            <div className="flex items-center space-x-2">
              
              {/* Essential Actions */}
              <div className="flex items-center space-x-1">
                {/* Cash Register - Admin Only */}
                {hasAccess('admin', user?.role) && (
                  <button
                    onClick={handleOpenCashRegister}
                    disabled={currentCashSession && currentCashSession.status === 'open'}
                    className={`p-2 rounded-md transition-colors group relative ${
                      currentCashSession && currentCashSession.status === 'open'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                    title={currentCashSession && currentCashSession.status === 'open' ? 'Caisse déjà ouverte' : 'Ouvrir la caisse'}
                  >
                    <DollarSign className="w-5 h-5" />
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {currentCashSession && currentCashSession.status === 'open' ? 'Caisse déjà ouverte' : 'Ouvrir la caisse'}
                    </div>
                  </button>
                )}
                {/* Cash Count - Admin Only */}
                {hasAccess('admin', user?.role) && (
                  <button
                    onClick={handleCountCash}
                    disabled={!currentCashSession || currentCashSession.status !== 'open'}
                    className={`p-2 rounded-md transition-colors group relative ${
                      !currentCashSession || currentCashSession.status !== 'open'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                    title={!currentCashSession ? 'Aucune session de caisse' : currentCashSession.status !== 'open' ? 'Caisse non ouverte' : 'Compter la caisse'}
                  >
                    <Calculator className="w-5 h-5" />
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {!currentCashSession ? 'Aucune session de caisse' : currentCashSession.status !== 'open' ? 'Caisse non ouverte' : 'Compter la caisse'}
                    </div>
                  </button>
                )}

                {/* Inventory Management - Admin Only */}
                {hasAccess('admin', user?.role) && (
                  <button
                    onClick={handleInventoryAdjustment}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                    title="Aperçu d'inventaire"
                  >
                    <Package className="w-5 h-5" />
                  </button>
                )}

                {/* Advanced Reports - Admin Only */}
                {hasAccess('admin', user?.role) && (
                  <button
                    onClick={handleAdvancedReports}
                    className="p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
                    title="Rapports avancés"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <button
                onClick={handleNotifications}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {isAuthenticated ? (
                <button
                  onClick={() => setShowUserProfileModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                  title="Profil utilisateur"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                  title="Se connecter"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProtectedRoute>
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </ProtectedRoute>

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
        onClose={handleCashRegisterModalClose}
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

      <InventoryInsightsModal
        isOpen={showInventoryInsightsModal}
        onClose={() => setShowInventoryInsightsModal(false)}
      />
      
              <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
        />
    </div>
  )
} 