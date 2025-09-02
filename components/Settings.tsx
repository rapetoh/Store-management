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
  X
} from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import SupplierManagement from './SupplierManagement'
import CategoryManagement from './CategoryManagement'
import { useReceiptSettings } from '@/contexts/ReceiptSettingsContext'

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

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })
  const [isLoading, setIsLoading] = useState(false)

  // Get settings from context
  const { receiptSettings, companyInfo, refreshSettings } = useReceiptSettings()

  // Local form state for editing
  const [localReceiptSettings, setLocalReceiptSettings] = useState(receiptSettings)
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo)

  // Tax Rates
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [isLoadingTaxRates, setIsLoadingTaxRates] = useState(true)

  // Load tax rates on component mount
  useEffect(() => {
    loadTaxRates()
  }, [])

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
        throw new Error(error.error || 'Failed to delete tax rate')
      }
    } catch (error) {
      console.error('Error removing tax rate:', error)
      showToast('error', 'Erreur', 'Impossible de supprimer le taux de TVA')
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
    </div>
  )
} 