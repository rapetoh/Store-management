'use client'

import { useState } from 'react'
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
  Upload,
  Receipt
} from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import InvoiceModal from './InvoiceModal'

interface Order {
  id: string
  customer: string
  date: string
  total: number
  status: string
  items: number
  paymentStatus: string
  notes?: string
  orderItems?: any[]
}

const initialOrders: Order[] = [
  {
    id: 'ORD001',
    customer: 'John Doe',
    date: '2023-10-26',
    total: 125.00,
    status: 'Livré',
    items: 3,
    paymentStatus: 'Payé',
    notes: 'Livraison express demandée'
  },
  {
    id: 'ORD002',
    customer: 'Jane Smith',
    date: '2023-10-25',
    total: 75.00,
    status: 'Expédié',
    items: 2,
    paymentStatus: 'Payé'
  },
  {
    id: 'ORD003',
    customer: 'Robert Johnson',
    date: '2023-10-24',
    total: 210.50,
    status: 'En attente',
    items: 5,
    paymentStatus: 'En attente',
    notes: 'Commande urgente'
  },
  {
    id: 'ORD004',
    customer: 'Emily White',
    date: '2023-10-23',
    total: 45.00,
    status: 'Livré',
    items: 1,
    paymentStatus: 'Payé'
  },
  {
    id: 'ORD005',
    customer: 'Michael Brown',
    date: '2023-10-22',
    total: 300.00,
    status: 'Annulé',
    items: 4,
    paymentStatus: 'Remboursé',
    notes: 'Annulé par le client'
  },
  {
    id: 'ORD006',
    customer: 'Sarah Davis',
    date: '2023-10-21',
    total: 99.99,
    status: 'Expédié',
    items: 2,
    paymentStatus: 'Payé'
  }
]

const statuses = ['Tous les statuts', 'En attente', 'Expédié', 'Livré', 'Annulé']
const customers = ['Tous les clients', 'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily White', 'Michael Brown', 'Sarah Davis']

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts')
  const [selectedCustomer, setSelectedCustomer] = useState('Tous les clients')
  const [selectedDate, setSelectedDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'info' as const, icon: 'info' as const })

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'Tous les statuts' || order.status === selectedStatus
    const matchesCustomer = selectedCustomer === 'Tous les clients' || order.customer === selectedCustomer
    const matchesDate = !selectedDate || order.date === selectedDate
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'bg-green-100 text-green-700'
      case 'Expédié':
        return 'bg-blue-100 text-blue-700'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-700'
      case 'Annulé':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Livré':
        return <CheckCircle className="w-4 h-4" />
      case 'Expédié':
        return <Truck className="w-4 h-4" />
      case 'En attente':
        return <Clock className="w-4 h-4" />
      case 'Annulé':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({ type, title, message })
    }
  }

  const handleAddOrder = () => {
    setInfoModalData({
      title: 'Nouvelle commande',
      message: 'Fonctionnalité de création de commande\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
      type: 'info',
      icon: 'cart'
    })
    setShowInfoModal(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setInfoModalData({
      title: 'Modifier la commande',
      message: `Fonctionnalité d'édition pour la commande ${order.id}\n\nCette fonctionnalité sera implémentée dans la prochaine version.`,
      type: 'info',
      icon: 'cart'
    })
    setShowInfoModal(true)
  }

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id))
      showToast('success', 'Commande supprimée', `La commande "${selectedOrder.id}" a été supprimée avec succès.`)
      setSelectedOrder(null)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setInfoModalData({
      title: 'Détails de la commande',
      message: `ID: ${order.id}\nClient: ${order.customer}\nDate: ${order.date}\nArticles: ${order.items} items\nTotal: €${order.total.toFixed(2)}\nStatut: ${order.status}\nPaiement: ${order.paymentStatus}${order.notes ? `\n\nNotes: ${order.notes}` : ''}`,
      type: 'info',
      icon: 'cart'
    })
    setShowInfoModal(true)
  }

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order)
    setShowInvoiceModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Client', 'Date', 'Total', 'Statut', 'Articles', 'Paiement'],
      ...filteredOrders.map(o => [o.id, o.customer, o.date, o.total, o.status, o.items, o.paymentStatus])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showToast('success', 'Export terminé', 'Le fichier CSV a été téléchargé avec succès.')
  }

  const handleImport = () => {
    setInfoModalData({
      title: 'Import de commandes',
      message: 'Fonctionnalité d\'import\n\nSélectionnez un fichier CSV pour importer des commandes.\n\nCette fonctionnalité sera implémentée dans la prochaine version.',
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
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600">Gérez et suivez vos commandes</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleImport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={handleAddOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des commandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Commandes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.paymentStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewInvoice(order)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Voir la facture"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres ou créez une nouvelle commande.</p>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer la commande"
        message={`Êtes-vous sûr de vouloir supprimer la commande "${selectedOrder?.id}" ?\n\nCette action est irréversible.`}
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

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={selectedOrder}
      />
    </div>
  )
} 