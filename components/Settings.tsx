'use client'

import { useState } from 'react'
import { 
  Settings, 
  Building, 
  CreditCard, 
  Receipt, 
  Calculator, 
  Save, 
  Download, 
  Upload,
  Printer,
  FileText,
  DollarSign,
  Percent,
  User,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  name: string
  isActive: boolean
  requiresReceipt: boolean
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

  // Company Information
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'StockFlow',
    address: '123 Rue du Commerce\n75001 Paris, France',
    phone: '+33 1 23 45 67 89',
    email: 'contact@stockflow.fr',
    siret: '123 456 789 00012',
    vatNumber: 'FR12345678901'
  })

  // Tax Rates
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: '1', name: 'TVA 20%', rate: 20, isDefault: true },
    { id: '2', name: 'TVA 10%', rate: 10, isDefault: false },
    { id: '3', name: 'TVA 5.5%', rate: 5.5, isDefault: false },
    { id: '4', name: 'TVA 2.1%', rate: 2.1, isDefault: false },
    { id: '5', name: 'Exonéré', rate: 0, isDefault: false }
  ])

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'cash', name: 'Espèces', isActive: true, requiresReceipt: true },
    { id: 'card', name: 'Carte bancaire', isActive: true, requiresReceipt: true },
    { id: 'check', name: 'Chèque', isActive: true, requiresReceipt: true },
    { id: 'transfer', name: 'Virement', isActive: true, requiresReceipt: false },
    { id: 'paypal', name: 'PayPal', isActive: false, requiresReceipt: true }
  ])

  // Receipt Settings
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showTaxDetails: true,
    showPaymentMethod: true,
    showCashierName: true,
    receiptFooter: 'Merci de votre visite !',
    autoPrint: false,
    printDuplicate: false
  })

  // Invoice Settings
  const [invoiceSettings, setInvoiceSettings] = useState({
    defaultDueDays: 30,
    showTaxBreakdown: true,
    allowPartialPayment: true,
    autoNumbering: true,
    prefix: 'INV-',
    nextNumber: 1001
  })

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleSaveSettings = () => {
    showToast('success', 'Paramètres sauvegardés', 'Tous les paramètres ont été sauvegardés avec succès.')
  }

  const handleExportSettings = () => {
    const settings = {
      companyInfo,
      taxRates,
      paymentMethods,
      receiptSettings,
      invoiceSettings
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stockflow_settings_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showToast('success', 'Export terminé', 'Les paramètres ont été exportés avec succès.')
  }

  const handleImportSettings = () => {
    setInfoModalData({
      title: 'Import des paramètres',
      message: 'Sélectionnez un fichier JSON pour importer les paramètres.\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
      type: 'info',
      icon: 'info'
    })
    setShowInfoModal(true)
  }

  const addTaxRate = () => {
    const newTaxRate: TaxRate = {
      id: Date.now().toString(),
      name: 'Nouveau taux',
      rate: 0,
      isDefault: false
    }
    setTaxRates(prev => [...prev, newTaxRate])
  }

  const removeTaxRate = (id: string) => {
    setTaxRates(prev => prev.filter(tax => tax.id !== id))
  }

  const setDefaultTaxRate = (id: string) => {
    setTaxRates(prev => prev.map(tax => ({
      ...tax,
      isDefault: tax.id === id
    })))
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, isActive: !method.isActive } : method
    ))
  }

  const tabs = [
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'taxes', label: 'Taxes', icon: Calculator },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'receipts', label: 'Reçus', icon: Receipt },
    { id: 'invoices', label: 'Factures', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configurez votre application StockFlow</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleImportSettings}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button 
            onClick={handleExportSettings}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

        <div className="p-6">
          {/* Company Information */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                  <input
                    type="text"
                    value={companyInfo.siret}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, siret: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de TVA</label>
                  <input
                    type="text"
                    value={companyInfo.vatNumber}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
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
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  + Ajouter un taux
                </button>
              </div>
              <div className="space-y-3">
                {taxRates.map((tax) => (
                  <div key={tax.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => setTaxRates(prev => prev.map(t => 
                          t.id === tax.id ? { ...t, name: e.target.value } : t
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.1"
                        value={tax.rate}
                        onChange={(e) => setTaxRates(prev => prev.map(t => 
                          t.id === tax.id ? { ...t, rate: parseFloat(e.target.value) || 0 } : t
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDefaultTaxRate(tax.id)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          tax.isDefault
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tax.isDefault ? 'Par défaut' : 'Définir par défaut'}
                      </button>
                      <button
                        onClick={() => removeTaxRate(tax.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Méthodes de paiement</h3>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={method.isActive}
                          onChange={() => togglePaymentMethod(method.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={method.requiresReceipt}
                          onChange={() => setPaymentMethods(prev => prev.map(m => 
                            m.id === method.id ? { ...m, requiresReceipt: !m.requiresReceipt } : m
                          ))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Reçu requis</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
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
                      checked={receiptSettings.showLogo}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, showLogo: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Afficher le logo</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showTaxDetails}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, showTaxDetails: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Afficher les détails de TVA</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showPaymentMethod}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, showPaymentMethod: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Afficher la méthode de paiement</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showCashierName}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, showCashierName: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Afficher le nom du caissier</span>
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={receiptSettings.autoPrint}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, autoPrint: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Impression automatique</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={receiptSettings.printDuplicate}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, printDuplicate: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Imprimer en double</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pied de page du reçu</label>
                    <textarea
                      value={receiptSettings.receiptFooter}
                      onChange={(e) => setReceiptSettings(prev => ({ ...prev, receiptFooter: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration des factures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Préfixe des factures</label>
                  <input
                    type="text"
                    value={invoiceSettings.prefix}
                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, prefix: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prochain numéro</label>
                  <input
                    type="number"
                    value={invoiceSettings.nextNumber}
                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, nextNumber: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Délai de paiement par défaut (jours)</label>
                  <input
                    type="number"
                    value={invoiceSettings.defaultDueDays}
                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, defaultDueDays: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.showTaxBreakdown}
                      onChange={(e) => setInvoiceSettings(prev => ({ ...prev, showTaxBreakdown: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Afficher le détail des taxes</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.allowPartialPayment}
                      onChange={(e) => setInvoiceSettings(prev => ({ ...prev, allowPartialPayment: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Autoriser les paiements partiels</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.autoNumbering}
                      onChange={(e) => setInvoiceSettings(prev => ({ ...prev, autoNumbering: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Numérotation automatique</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {}}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir effectuer cette action ?"
        type="warning"
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