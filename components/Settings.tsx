'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  CreditCard,
  Receipt,
  FileText,
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  MapPin,
  X,
  Users,
  UserPlus,
  Edit3,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import SupplierManagement from './SupplierManagement'
import CategoryManagement from './CategoryManagement'
import { useReceiptSettings } from '@/contexts/ReceiptSettingsContext'
import { useAuth } from '@/contexts/AuthContext'

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
  isActive: boolean
  description?: string
}



interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  siret: string
  vatNumber: string
  logo?: string
}

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'cashier'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })
  const [isLoading, setIsLoading] = useState(false)

  // Get settings from context
  const { receiptSettings, companyInfo, refreshSettings } = useReceiptSettings()
  
  // Get current user from auth context
  const { user: currentUser } = useAuth()

  // Local form state for editing
  const [localReceiptSettings, setLocalReceiptSettings] = useState(receiptSettings)
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo)

  // Tax Rates
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [isLoadingTaxRates, setIsLoadingTaxRates] = useState(true)

  // User Management
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier'
  })
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'cashier' as 'admin' | 'cashier'
  })

  // Load tax rates on component mount
  useEffect(() => {
    loadTaxRates()
  }, [])

  // Load users when users tab is accessed
  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === 'admin') {
      loadUsers()
    }
  }, [activeTab, currentUser])

  // Sync local state with context values
  useEffect(() => {
    setLocalReceiptSettings(receiptSettings)
    setLocalCompanyInfo(companyInfo)
  }, [receiptSettings, companyInfo])

  const loadTaxRates = async () => {
    try {
      setIsLoadingTaxRates(true)
      const response = await fetch('/api/tax-rates')
      if (response.ok) {
        const data = await response.json()
        setTaxRates(data)
      } else {
        throw new Error('Failed to load tax rates')
      }
    } catch (error) {
      console.error('Error loading tax rates:', error)
      showToast('error', 'Erreur', 'Impossible de charger les taux de TVA')
    } finally {
      setIsLoadingTaxRates(false)
    }
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
          category: 'Paramètres'
        }),
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)
      
      // Prepare settings data
      const settingsData = {
        'receipt.showLogo': localReceiptSettings.showLogo,
        'receipt.showTaxDetails': localReceiptSettings.showTaxDetails,
        'receipt.showCashierName': localReceiptSettings.showCashierName,
        'receipt.receiptFooter': localReceiptSettings.receiptFooter,
        'receipt.autoPrint': localReceiptSettings.autoPrint,
        'receipt.printDuplicate': localReceiptSettings.printDuplicate,
        'company.name': localCompanyInfo.name,
        'company.address': localCompanyInfo.address,
        'company.phone': localCompanyInfo.phone,
        'company.email': localCompanyInfo.email,
        'company.siret': localCompanyInfo.siret,
        'company.vatNumber': localCompanyInfo.vatNumber
      }
      
      // Save to settings endpoint
      const settingsResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      // Also save to company endpoint for compatibility
      const companyResponse = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: localCompanyInfo.name,
          address: localCompanyInfo.address,
          phone: localCompanyInfo.phone,
          email: localCompanyInfo.email,
          siret: localCompanyInfo.siret,
          vatNumber: localCompanyInfo.vatNumber
        }),
      })

      if (settingsResponse.ok && companyResponse.ok) {
        await refreshSettings() // Refresh the context
        showToast('success', 'Paramètres sauvegardés', 'Tous les paramètres ont été sauvegardés avec succès.')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('error', 'Erreur', 'Impossible de sauvegarder les paramètres')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportSettings = () => {
    const settings = {
      companyInfo,
      taxRates,

      receiptSettings
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stockflow-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('success', 'Export réussi', 'Les paramètres ont été exportés avec succès.')
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string)
            
            // Prepare settings data for import
            const settingsData: Record<string, string> = {}
            
            if (settings.companyInfo) {
              settingsData['company.name'] = settings.companyInfo.name
              settingsData['company.address'] = settings.companyInfo.address
              settingsData['company.phone'] = settings.companyInfo.phone
              settingsData['company.email'] = settings.companyInfo.email
              settingsData['company.siret'] = settings.companyInfo.siret
              settingsData['company.vatNumber'] = settings.companyInfo.vatNumber
            }
            
            if (settings.receiptSettings) {
              settingsData['receipt.showLogo'] = settings.receiptSettings.showLogo.toString()
              settingsData['receipt.showTaxDetails'] = settings.receiptSettings.showTaxDetails.toString()
              settingsData['receipt.showCashierName'] = settings.receiptSettings.showCashierName.toString()
              settingsData['receipt.receiptFooter'] = settings.receiptSettings.receiptFooter
              settingsData['receipt.autoPrint'] = settings.receiptSettings.autoPrint.toString()
              settingsData['receipt.printDuplicate'] = settings.receiptSettings.printDuplicate.toString()
            }
            
            // Save imported settings to database
            const response = await fetch('/api/settings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(settingsData),
            })
            
            if (response.ok) {
              await refreshSettings() // Refresh the context
              showToast('success', 'Import réussi', 'Les paramètres ont été importés avec succès.')
            } else {
              throw new Error('Failed to save imported settings')
            }
          } catch (error) {
            showToast('error', 'Erreur d\'import', 'Le fichier n\'est pas valide.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const addTaxRate = async () => {
    const newTaxRate: Omit<TaxRate, 'id'> = {
      name: 'Nouveau taux',
      rate: 0,
      isDefault: false,
      isActive: true,
      description: ''
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/tax-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaxRate),
      })

      if (response.ok) {
        const createdTaxRate = await response.json()
        setTaxRates(prev => [...prev, createdTaxRate])
        showToast('success', 'Taux ajouté', 'Le nouveau taux de TVA a été ajouté avec succès.')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create tax rate')
      }
    } catch (error) {
      console.error('Error adding tax rate:', error)
      showToast('error', 'Erreur', 'Impossible d\'ajouter le taux de TVA')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTaxRate = async (id: string, updates: Partial<TaxRate>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tax-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        const updatedTaxRate = await response.json()
        setTaxRates(prev => prev.map(tax => 
          tax.id === id ? updatedTaxRate : tax
        ))
        showToast('success', 'Taux mis à jour', 'Le taux de TVA a été mis à jour avec succès.')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update tax rate')
      }
    } catch (error) {
      console.error('Error updating tax rate:', error)
      showToast('error', 'Erreur', 'Impossible de mettre à jour le taux de TVA')
    } finally {
      setIsLoading(false)
    }
  }

  const removeTaxRate = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tax-rates?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTaxRates(prev => prev.filter(tax => tax.id !== id))
        showToast('success', 'Taux supprimé', 'Le taux de TVA a été supprimé avec succès.')
      } else {
        const error = await response.json()
        // Show the specific error message from the backend
        showToast('error', 'Erreur', error.error || 'Impossible de supprimer le taux de TVA')
        return
      }
    } catch (error) {
      console.error('Error removing tax rate:', error)
      showToast('error', 'Erreur', 'Une erreur est survenue lors de la suppression du taux de TVA')
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultTaxRate = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tax-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isDefault: true }),
      })

      if (response.ok) {
        const updatedTaxRate = await response.json()
        setTaxRates(prev => prev.map(tax => ({
          ...tax,
          isDefault: tax.id === id
        })))
        showToast('success', 'Taux par défaut', 'Le taux de TVA par défaut a été mis à jour.')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set default tax rate')
      }
    } catch (error) {
      console.error('Error setting default tax rate:', error)
      showToast('error', 'Erreur', 'Impossible de définir le taux par défaut')
    } finally {
      setIsLoading(false)
    }
  }

  // User Management Functions
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      } else {
        throw new Error('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      showToast('error', 'Erreur', 'Impossible de charger les utilisateurs')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const createUser = async () => {
    if (!newUserForm.username || !newUserForm.email || !newUserForm.firstName || !newUserForm.lastName || !newUserForm.password) {
      showToast('error', 'Champs requis', 'Tous les champs sont obligatoires')
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm),
      })

      if (response.ok) {
        const newUser = await response.json()
        setUsers(prev => [...prev, newUser])
        setNewUserForm({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          role: 'cashier'
        })
        setShowAddUserModal(false)
        showToast('success', 'Utilisateur créé', 'L\'utilisateur a été créé avec succès')
        
        // Log the activity
        await logActivity('user_created', `Nouvel utilisateur créé: ${newUser.username} (${newUser.role})`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      showToast('error', 'Erreur', 'Impossible de créer l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ))
        showToast('success', 'Utilisateur mis à jour', 'L\'utilisateur a été mis à jour avec succès')
        
        // Log the activity
        await logActivity('user_updated', `Utilisateur modifié: ${updatedUser.username}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showToast('error', 'Erreur', 'Impossible de mettre à jour l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { isActive })
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUserForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    })
    setShowEditUserModal(true)
  }

  const saveEditUser = async () => {
    if (!selectedUser) return
    
    if (!editUserForm.username || !editUserForm.email || !editUserForm.firstName || !editUserForm.lastName) {
      showToast('error', 'Champs requis', 'Tous les champs sont obligatoires')
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUserForm),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ))
        setShowEditUserModal(false)
        setSelectedUser(null)
        setEditUserForm({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: 'cashier'
        })
        showToast('success', 'Utilisateur modifié', 'L\'utilisateur a été modifié avec succès')
        
        // Log the activity
        await logActivity('user_updated', `Utilisateur modifié: ${updatedUser.username}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showToast('error', 'Erreur', 'Impossible de modifier l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }



  const handleResetSettings = () => {
    setShowConfirmModal(true)
  }

  const confirmReset = () => {
    // Reset all settings to default values
    setLocalCompanyInfo({
      name: 'StockFlow',
      address: '123 Rue du Commerce\n75001 Paris, France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@stockflow.fr',
      siret: '123 456 789 00012',
      vatNumber: 'FR12345678901'
    })
    
    setLocalReceiptSettings({
      showLogo: true,
      showTaxDetails: true,
      showCashierName: true,
      receiptFooter: 'Merci de votre visite !',
      autoPrint: false,
      printDuplicate: false
    })
    
    setShowConfirmModal(false)
    showToast('success', 'Paramètres réinitialisés', 'Tous les paramètres ont été réinitialisés aux valeurs par défaut.')
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configurez votre application StockFlow</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSettings}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button
            onClick={handleImportSettings}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'company', label: 'Entreprise', icon: Building2 },
            { id: 'suppliers', label: 'Fournisseurs', icon: Building2 },
            { id: 'categories', label: 'Catégories', icon: Building2 },
            { id: 'taxes', label: 'TVA', icon: Receipt },
            { id: 'receipts', label: 'Reçus', icon: FileText },
            ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'Utilisateurs', icon: Users }] : []),
            { id: 'advanced', label: 'Avancé', icon: SettingsIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Company Information */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={localCompanyInfo.name}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <textarea
                  value={localCompanyInfo.address}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={localCompanyInfo.phone}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={localCompanyInfo.email}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                <input
                  type="text"
                  value={localCompanyInfo.siret}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, siret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de TVA</label>
                <input
                  type="text"
                  value={localCompanyInfo.vatNumber}
                  onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tax Rates */}
        {activeTab === 'taxes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Taux de TVA</h3>
              <button
                onClick={addTaxRate}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un taux</span>
              </button>
            </div>
            
            {isLoadingTaxRates ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des taux de TVA...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxRates.map((tax) => (
                  <div key={tax.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => updateTaxRate(tax.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom du taux"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.1"
                        value={tax.rate}
                        onChange={(e) => updateTaxRate(tax.id, { rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Taux %"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDefaultTaxRate(tax.id)}
                        disabled={isLoading || tax.isDefault}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          tax.isDefault
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tax.isDefault ? 'Par défaut' : 'Définir par défaut'}
                      </button>
                      <button
                        onClick={() => removeTaxRate(tax.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {taxRates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun taux de TVA configuré</p>
                    <p className="text-sm">Cliquez sur "Ajouter un taux" pour commencer</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {/* Receipt Settings */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuration des reçus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localReceiptSettings.showLogo}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, showLogo: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Afficher le logo</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localReceiptSettings.showTaxDetails}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, showTaxDetails: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Afficher les détails de TVA</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localReceiptSettings.showCashierName}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, showCashierName: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Afficher le nom du caissier</span>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message de fin</label>
                  <textarea
                    value={localReceiptSettings.receiptFooter}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, receiptFooter: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localReceiptSettings.autoPrint}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, autoPrint: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Impression automatique</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localReceiptSettings.printDuplicate}
                    onChange={(e) => setLocalReceiptSettings(prev => ({ ...prev, printDuplicate: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Imprimer en double</span>
                </label>
              </div>
            </div>
          </div>
        )}



        {/* Suppliers Management */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <SupplierManagement />
          </div>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <CategoryManagement />
          </div>
        )}

        {/* User Management - Admin Only */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
              <button
                onClick={() => setShowAddUserModal(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Ajouter un utilisateur</span>
              </button>
            </div>
            
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des utilisateurs...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === 'admin' ? 'Administrateur' : 'Caissier'}
                          </span>
                          {!user.isActive && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              Désactivé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                        {user.lastLogin && (
                          <p className="text-xs text-gray-500">
                            Dernière connexion: {new Date(user.lastLogin).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, !user.isActive)}
                        disabled={isLoading || user.id === currentUser?.id}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={user.id === currentUser?.id ? 'Vous ne pouvez pas désactiver votre propre compte' : ''}
                      >
                        {user.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun utilisateur trouvé</p>
                    <p className="text-sm">Cliquez sur "Ajouter un utilisateur" pour commencer</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres avancés</h3>
            <div className="space-y-4">
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Réinitialiser tous les paramètres</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmReset}
        title="Réinitialiser les paramètres"
        message="Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ? Cette action ne peut pas être annulée."
        confirmText="Réinitialiser"
        cancelText="Annuler"
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        type={infoModalData.type}
        icon={infoModalData.icon}
      />

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ajouter un utilisateur</h3>
                  <p className="text-sm text-gray-600">Créer un nouveau compte utilisateur</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUserForm({
                    username: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    password: '',
                    role: 'cashier'
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jdupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'cashier' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cashier">Caissier</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUserForm({
                      username: '',
                      email: '',
                      firstName: '',
                      lastName: '',
                      password: '',
                      role: 'cashier'
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={createUser}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Créer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Modifier l'utilisateur</h3>
                  <p className="text-sm text-gray-600">Modifier les informations de {selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setSelectedUser(null)
                  setEditUserForm({
                    username: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    role: 'cashier'
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={editUserForm.firstName}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={editUserForm.lastName}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jdupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'cashier' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedUser.id === currentUser?.id} // Prevent changing own role
                >
                  <option value="cashier">Caissier</option>
                  <option value="admin">Administrateur</option>
                </select>
                {selectedUser.id === currentUser?.id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vous ne pouvez pas modifier votre propre rôle
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Pour changer le mot de passe, l'utilisateur doit utiliser la fonction "Mot de passe oublié" lors de la connexion.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false)
                    setSelectedUser(null)
                    setEditUserForm({
                      username: '',
                      email: '',
                      firstName: '',
                      lastName: '',
                      role: 'cashier'
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveEditUser}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Modifier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 