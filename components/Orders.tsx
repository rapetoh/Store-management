'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Download,
  Receipt,
  DollarSign,
  CreditCard
} from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import ReceiptModal from './ReceiptModal'
import QuickSaleModal from './QuickSaleModal'
import EditSaleModal from './EditSaleModal'
import SaleDetailsModal from './SaleDetailsModal'

interface Sale {
  id: string
  customer: string
  date: string
  time: string
  total: number
  status: string
  itemCount: number
  paymentMethod: string
  cashier: string
  notes?: string
  saleItems?: any[]
  // Additional fields for EditSaleModal
  customerId?: string
  totalAmount?: number
  discountAmount?: number
  taxAmount?: number
  finalAmount?: number
  paymentStatus?: string
  saleDate?: string
  // Items for EditSaleModal
  items?: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    discount: number
    totalPrice: number
  }>
}

// Sales will be loaded from database

const statuses = ['Tous les statuts', 'Payé', 'En cours', 'Remboursé', 'Annulé']
const paymentMethods = ['Toutes les méthodes', 'cash', 'card', 'check', 'transfer']
const cashiers = ['Tous les caissiers', 'Marie Dupont', 'Jean Martin', 'Sophie Bernard']

export default function Sales() {
  const searchParams = useSearchParams()
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Toutes les méthodes')
  const [selectedCashier, setSelectedCashier] = useState('Tous les caissiers')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  const [showEditSaleModal, setShowEditSaleModal] = useState(false)
  const [showSaleDetailsModal, setShowSaleDetailsModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  useEffect(() => {
    loadSales()
  }, [searchParams])

  // Clear URL parameters when manually navigating to Sales tab
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'sales') {
      // If we're on sales tab but no local date range is set, clear URL parameters
      if (!dateRange.startDate && !dateRange.endDate) {
        const url = new URL(window.location.href)
        url.searchParams.delete('startDate')
        url.searchParams.delete('endDate')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [searchParams, dateRange])

  // Reload sales when local date range changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadSales()
    }
  }, [dateRange])

  const loadSales = async () => {
    try {
      // Check for date range parameters from URL or local state
      let urlStartDate = searchParams.get('startDate')
      let urlEndDate = searchParams.get('endDate')
      
      // Prioritize local date range over URL parameters
      if (dateRange.startDate && dateRange.endDate) {
        urlStartDate = dateRange.startDate
        urlEndDate = dateRange.endDate
      }
      
      let url = '/api/sales'
      if (urlStartDate && urlEndDate) {
        url += `?startDate=${urlStartDate}&endDate=${urlEndDate}`
        console.log('Fetching sales with date range:', urlStartDate, 'to', urlEndDate)
      } else {
        console.log('Fetching all sales (no date filter)')
      }
      
      const response = await fetch(url)
      const data = await response.json()
      console.log('Sales API response:', data)
      setSales(data)
    } catch (error) {
      console.error('Error loading sales:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'Tous les statuts' || sale.status === selectedStatus
    const matchesPaymentMethod = selectedPaymentMethod === 'Toutes les méthodes' || sale.paymentMethod === selectedPaymentMethod
    const matchesCashier = selectedCashier === 'Tous les caissiers' || sale.cashier === selectedCashier

    // If we have date range filters, the backend API already filtered the data
    // So we don't need to filter by date in the frontend
    const matchesDate = true // Backend API handles date filtering

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesCashier && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payé': return 'bg-green-100 text-green-800'
      case 'En cours': return 'bg-yellow-100 text-yellow-800'
      case 'Remboursé': return 'bg-red-100 text-red-800'
      case 'Annulé': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Payé': return <CheckCircle className="w-4 h-4" />
      case 'En cours': return <Clock className="w-4 h-4" />
      case 'Remboursé': return <XCircle className="w-4 h-4" />
      case 'Annulé': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Espèces': return <DollarSign className="w-4 h-4" />
      case 'Carte bancaire': return <CreditCard className="w-4 h-4" />
      case 'Chèque': return <DollarSign className="w-4 h-4" />
      case 'Virement': return <DollarSign className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddSale = () => {
    setShowQuickSaleModal(true)
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
          financialImpact: financialImpact || null,
          category: 'Ventes'
        }),
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const handleSaleCompleted = (sale: any) => {
    // Log the sale activity
    logActivity(
      'sale',
      `Vente #${sale.id} - ${sale.itemCount || 0} articles - ${sale.paymentMethod || 'Non spécifié'}`,
      sale.total || 0
    )
    
    // Refresh sales list from database
    loadSales()
    showToast('success', 'Vente terminée', `La vente ${sale.id} a été enregistrée avec succès !\n\nTotal: ${(sale.total || 0).toLocaleString('fr-FR')} FCFA`)
  }

  const handleEditSale = async (sale: Sale) => {
    try {
      // Load detailed sale information
      const response = await fetch(`/api/sales/${sale.id}`)
      if (response.ok) {
        const detailedSale = await response.json()
        setSelectedSale(detailedSale)
        setShowEditSaleModal(true)
      } else {
        // Fallback to basic sale data
        setSelectedSale(sale)
        setShowEditSaleModal(true)
      }
    } catch (error) {
      console.error('Error loading sale details:', error)
      // Fallback to basic sale data
      setSelectedSale(sale)
      setShowEditSaleModal(true)
    }
  }

  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedSale) {
      // Log the deletion activity
      logActivity(
        'modification',
        `Suppression vente #${selectedSale.id} - Total: ${selectedSale.total.toLocaleString('fr-FR')} FCFA`,
        -(selectedSale.total || 0) // Negative impact for deletion
      )
      
      setSales(prev => prev.filter(s => s.id !== selectedSale.id))
      showToast('success', 'Vente supprimée', `La vente "${selectedSale.id}" a été supprimée avec succès.`)
      setSelectedSale(null)
      setShowDeleteModal(false)
    }
  }

  const handleViewSale = async (sale: Sale) => {
    // Fetch detailed sale information including items
    try {
      const response = await fetch(`/api/sales/${sale.id}`)
      if (response.ok) {
        const detailedSale = await response.json()
        setSelectedSale(detailedSale)
        setShowSaleDetailsModal(true)
      } else {
        // Fallback to basic info if detailed fetch fails
        setInfoModalData({
          title: 'Détails de la vente',
          message: `ID: ${sale.id}\nClient: ${sale.customer}\nDate: ${sale.date} à ${sale.time}\nArticles: ${sale.itemCount} items\nTotal: ${sale.total.toLocaleString('fr-FR')} FCFA\nStatut: ${sale.status}\nMéthode de paiement: ${sale.paymentMethod}\nCaissier: ${sale.cashier}${sale.notes ? `\n\nNotes: ${sale.notes}` : ''}`,
          type: 'info',
          icon: 'info'
        })
        setShowInfoModal(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      // Fallback to basic info
      setInfoModalData({
        title: 'Détails de la vente',
        message: `ID: ${sale.id}\nClient: ${sale.customer}\nDate: ${sale.date} à ${sale.time}\nArticles: ${sale.itemCount} items\nTotal: ${sale.total.toLocaleString('fr-FR')} FCFA\nStatut: ${sale.status}\nMéthode de paiement: ${sale.paymentMethod}\nCaissier: ${sale.cashier}${sale.notes ? `\n\nNotes: ${sale.notes}` : ''}`,
        type: 'info',
        icon: 'info'
      })
      setShowInfoModal(true)
    }
  }

  const handleViewReceipt = async (sale: Sale) => {
    try {
      // Load detailed sale information
      const response = await fetch(`/api/sales/${sale.id}`)
      if (response.ok) {
        const detailedSale = await response.json()
        setSelectedSale(detailedSale)
        setShowReceiptModal(true)
      } else {
        // Fallback to basic sale data
        setSelectedSale(sale)
        setShowReceiptModal(true)
      }
    } catch (error) {
      console.error('Error loading sale details for receipt:', error)
      // Fallback to basic sale data
      setSelectedSale(sale)
      setShowReceiptModal(true)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Client', 'Date', 'Heure', 'Total', 'Statut', 'Articles', 'Méthode de paiement', 'Caissier'],
      ...sales.map(s => [s.id, s.customer, s.date, s.time, s.total.toString(), s.status, s.itemCount.toString(), s.paymentMethod, s.cashier])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'ventes.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('success', 'Export terminé', 'Le fichier CSV a été téléchargé avec succès.')
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
          <p className="text-gray-600">Gérez vos transactions en magasin</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddSale}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle vente</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des ventes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caissier</label>
                <select
                  value={selectedCashier}
                  onChange={(e) => setSelectedCashier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cashiers.map(cashier => (
                    <option key={cashier} value={cashier}>{cashier}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Au (non inclus)</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des Ventes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                    <div className="text-sm text-gray-500">{sale.itemCount} articles</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sale.customer}</div>
                    <div className="text-sm text-gray-500">Caissier: {sale.cashier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sale.date}</div>
                    <div className="text-sm text-gray-500">{sale.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(sale.total || 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="text-sm text-gray-900">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sale.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewSale(sale)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewReceipt(sale)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Voir le reçu"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Affichage de {filteredSales.length} ventes sur {sales.length} total
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-1 text-sm text-white bg-blue-600 border border-blue-600 rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer la vente"
        message={`Êtes-vous sûr de vouloir supprimer la vente "${selectedSale?.id}" ?\n\nCette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
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

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        sale={selectedSale}
      />

      <QuickSaleModal
        isOpen={showQuickSaleModal}
        onClose={() => setShowQuickSaleModal(false)}
      />

      <EditSaleModal
        isOpen={showEditSaleModal}
        onClose={() => setShowEditSaleModal(false)}
        sale={selectedSale}
        onSaleUpdated={loadSales}
      />

      <SaleDetailsModal
        isOpen={showSaleDetailsModal}
        onClose={() => setShowSaleDetailsModal(false)}
        sale={selectedSale}
      />
    </div>
  )
} 